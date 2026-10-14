import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem, STORAGE_KEYS } from '../utils/storage';
import { ADMIN_CREDENTIALS, SESSION_EXPIRY, RECOVERY_KEY } from '../utils/constants';

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

// ヘルパー：最新の認証情報を取得
// ヘルパー：最新の認証情報を取得（定数からのみ）
const getLatestCredentials = () => {
  return { ...ADMIN_CREDENTIALS };
};

/** 保存されているログイン状態が有効か（期限切れなら消す）。描画の前に同期で読む */
function readStoredAuth(): boolean {
  const authState = getStorageItem<AuthState>(STORAGE_KEYS.AUTH);
  if (!authState || !authState.isAuthenticated) return false;
  if (Date.now() - authState.timestamp > SESSION_EXPIRY) {
    removeStorageItem(STORAGE_KEYS.AUTH);
    return false;
  }
  return true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // 最初から保存済みの状態で始める。以前は「未ログイン」で始めてから確認していたため、
  // 管理画面を開き直すたびに一瞬未ログイン扱いになり、ログイン画面へ飛ばされていた
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => readStoredAuth());

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
      console.log('[Auth] Login successful');
      return true;
    }

    console.warn('[Auth] Login failed: invalid credentials');
    return false;
  };



  // ログアウト処理
  const logout = () => {
    removeStorageItem(STORAGE_KEYS.AUTH);
    setIsAuthenticated(false);
    console.log('[Auth] Logged out');
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
