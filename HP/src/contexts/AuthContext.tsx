import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, STORAGE_KEYS } from '../utils/storage';
import { ADMIN_CREDENTIALS, SESSION_EXPIRY } from '../utils/constants';

interface AuthState {
  isAuthenticated: boolean;
  timestamp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初回マウント時に認証状態を確認
  useEffect(() => {
    const isValid = checkAuth();
    setIsAuthenticated(isValid);
  }, []);

  // 認証状態をチェック
  const checkAuth = (): boolean => {
    const authState = getStorageItem<AuthState>(STORAGE_KEYS.AUTH);

    if (!authState || !authState.isAuthenticated) {
      return false;
    }

    const now = Date.now();
    const elapsed = now - authState.timestamp;

    // セッション有効期限をチェック
    if (elapsed > SESSION_EXPIRY) {
      removeStorageItem(STORAGE_KEYS.AUTH);
      setIsAuthenticated(false);
      return false;
    }

    return true;
  };

  // ログイン処理
  const login = async (username: string, password: string): Promise<boolean> => {
    // ハードコードされた認証情報と照合
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const authState: AuthState = {
        isAuthenticated: true,
        timestamp: Date.now(),
      };
      setStorageItem(STORAGE_KEYS.AUTH, authState);
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  // ログアウト処理
  const logout = () => {
    removeStorageItem(STORAGE_KEYS.AUTH);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// カスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
