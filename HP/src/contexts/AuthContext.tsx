import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, STORAGE_KEYS } from '../utils/storage';
import { ADMIN_CREDENTIALS, SESSION_EXPIRY, RECOVERY_KEY } from '../utils/constants';

interface AuthState {
  isAuthenticated: boolean;
  timestamp: number;
}

interface Credentials {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  updateCredentials: (newUsername: string, newPassword: string) => Promise<boolean>;
  resetCredentials: (recoveryKey: string, newUsername: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ヘルパー：最新の認証情報を取得
const getLatestCredentials = (): Credentials => {
  try {
    const saved = getStorageItem<Credentials>(STORAGE_KEYS.ADMIN_CREDENTIALS);
    if (saved && saved.username && saved.password) {
      return saved;
    }
  } catch (e) {
    console.error('Error reading credentials from storage:', e);
  }
  return { ...ADMIN_CREDENTIALS };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>(getLatestCredentials());

  // 初回マウント時に認証状態を確認
  useEffect(() => {
    const isValid = checkAuth();
    console.log('[Auth] Initial auth check:', isValid);
    setIsAuthenticated(isValid);
    // マウント時にも最新の認証情報をロード
    setCredentials(getLatestCredentials());
  }, []);

  // 認証状態をチェック
  const checkAuth = (): boolean => {
    const authState = getStorageItem<AuthState>(STORAGE_KEYS.AUTH);
    if (!authState || !authState.isAuthenticated) return false;

    const now = Date.now();
    const elapsed = now - authState.timestamp;

    if (elapsed > SESSION_EXPIRY) {
      console.log('[Auth] Session expired');
      removeStorageItem(STORAGE_KEYS.AUTH);
      setIsAuthenticated(false);
      return false;
    }

    return true;
  };

  // ログイン処理
  const login = async (username: string, password: string): Promise<boolean> => {
    // 常に最新の情報を読み込む（ステートのラグを回避）
    const currentCreds = getLatestCredentials();
    console.log('[Auth] Attempting login for:', username);

    if (username === currentCreds.username && password === currentCreds.password) {
      const authState: AuthState = {
        isAuthenticated: true,
        timestamp: Date.now(),
      };
      setStorageItem(STORAGE_KEYS.AUTH, authState);
      setIsAuthenticated(true);
      setCredentials(currentCreds);
      console.log('[Auth] Login successful');
      return true;
    }

    console.warn('[Auth] Login failed: invalid credentials');
    return false;
  };

  // 認証情報の更新（ログイン中のみ）
  const updateCredentials = async (newUsername: string, newPassword: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const newCreds = { username: newUsername, password: newPassword };
    setStorageItem(STORAGE_KEYS.ADMIN_CREDENTIALS, newCreds);
    setCredentials(newCreds);
    console.log('[Auth] Credentials updated');
    return true;
  };

  // 認証情報のリセット（リカバリーキーを使用）
  const resetCredentials = async (recoveryKey: string, newUsername: string, newPassword: string): Promise<boolean> => {
    if (recoveryKey === RECOVERY_KEY) {
      const newCreds = { username: newUsername, password: newPassword };
      setStorageItem(STORAGE_KEYS.ADMIN_CREDENTIALS, newCreds);
      setCredentials(newCreds);
      console.log('[Auth] Credentials reset via recovery key');
      return true;
    }
    console.warn('[Auth] Reset failed: invalid recovery key');
    return false;
  };

  // ログアウト処理
  const logout = () => {
    removeStorageItem(STORAGE_KEYS.AUTH);
    setIsAuthenticated(false);
    console.log('[Auth] Logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuth, updateCredentials, resetCredentials }}>
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
