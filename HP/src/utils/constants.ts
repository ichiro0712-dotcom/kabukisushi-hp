// 認証情報（デモ用）
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'kabukisushi2026',
} as const;

export const RECOVERY_KEY = 'KABUKI_RESET_2024'; // 初期リカバリーキー

// セッション有効期限（24時間）
export const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

// メニューカテゴリー
export const MENU_CATEGORIES = {
  course: 'コース',
  nigiri: 'にぎり',
  makimono: '巻物',
  ippin: '一品料理',
  drink: 'ドリンク',
} as const;

// 画像アップロード制限
export const IMAGE_CONSTRAINTS = {
  maxSize: 2 * 1024 * 1024, // 2MB
  acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
} as const;

// 管理画面のルートパス
export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  MENU: '/admin/menu',
  GALLERY: '/admin/gallery',
  SETTINGS: '/admin/settings',
} as const;
