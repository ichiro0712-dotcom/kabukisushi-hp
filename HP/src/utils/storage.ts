// LocalStorageのキー
export const STORAGE_KEYS = {
  AUTH: 'kabuki_admin_auth',
  MENU_ITEMS: 'kabuki_menu_items',
  GALLERY_IMAGES: 'kabuki_gallery_images',
  SETTINGS: 'kabuki_settings',
  ANALYTICS: 'kabuki_analytics',
  ADMIN_CREDENTIALS: 'kabuki_admin_credentials',
} as const;

// LocalStorageからデータを取得
export function getStorageItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item from localStorage (${key}):`, error);
    return null;
  }
}

// LocalStorageにデータを保存
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item to localStorage (${key}):`, error);
  }
}

// LocalStorageからデータを削除
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage (${key}):`, error);
  }
}

// LocalStorageをクリア
export function clearStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
