import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '../types/menu';
import { GalleryImage } from '../types/gallery';
import { Settings } from '../types/settings';
import { Analytics } from '../types/analytics';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../utils/storage';

interface DataContextType {
  // メニュー管理
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleSoldOut: (id: string) => void;

  // ギャラリー管理
  galleryImages: GalleryImage[];
  addImage: (image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => void;
  deleteImage: (id: string) => void;
  reorderImages: (images: GalleryImage[]) => void;

  // 設定管理
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // 統計データ
  analytics: Analytics;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// 初期メニューデータ（App.tsxからのハードコードデータ）
const INITIAL_MENU_ITEMS: MenuItem[] = [
  // にぎり
  { id: '1', name: '赤身', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: '中トロ', price: 780, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: '大トロ', price: 880, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '4', name: '大トロ炙り', price: 880, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', name: '海ぶどうトロ手巻き', price: 880, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '6', name: 'タイ', price: 480, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '7', name: '金目鯛', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '8', name: 'カマス', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '9', name: 'サワラ', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '10', name: 'ブリ', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '11', name: 'アジ', price: 450, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '12', name: 'カツオ', price: 500, category: 'nigiri', soldOut: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '13', name: 'サーモン', price: 450, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '14', name: '炙りサーモン', price: 450, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '15', name: '車海老', price: 980, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '16', name: '車海老カダイフ揚げ', price: 1300, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '17', name: '生海老漬け', price: 480, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '18', name: 'イカ', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '19', name: '水タコ', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '20', name: 'ホタテ', price: 600, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '21', name: '赤貝', price: 850, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '22', name: 'えんがわ', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '23', name: 'ウナギドック', price: 680, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '24', name: '穴子', price: 680, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '25', name: 'ノドグロドック', price: 900, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '26', name: 'タチウオドック', price: 700, category: 'nigiri', soldOut: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '27', name: 'とびっこ', price: 400, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '28', name: '白子軍艦', price: 550, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '29', name: 'いくら', price: 600, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '30', name: 'ウニ', price: 880, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '31', name: '玉子', price: 350, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '32', name: '芽ネギ', price: 350, category: 'nigiri', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // 巻物
  { id: '51', name: 'トロたく巻き', price: 1200, category: 'makimono', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '52', name: 'ネギトロ巻き', price: 1000, category: 'makimono', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '53', name: '鉄火巻き', price: 1200, category: 'makimono', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '54', name: 'ウニトロ巻き', price: 2000, category: 'makimono', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '55', name: 'カッパ巻き', price: 650, category: 'makimono', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '56', name: 'かんぴょう巻き', price: 650, category: 'makimono', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // 一品料理
  { id: '71', name: '味噌汁', price: 350, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '72', name: '茶碗蒸し', price: 650, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '73', name: '刺身盛り合わせ', price: 2000, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '74', name: 'カニつまみ', price: 980, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '75', name: '白子（ポン酢・天ぷら）', price: 1300, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '76', name: '生牡蠣', price: 750, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '77', name: '海鮮ユッケ', price: 980, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '78', name: 'マグロカマ焼き', price: 3200, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '79', name: 'サーモンハラス焼き', price: 1800, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '80', name: 'タチウオ塩焼き', price: 980, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '81', name: 'つまみ玉子', price: 680, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '82', name: '大福アイス', price: 580, category: 'ippin', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // コース
  { id: '101', name: 'おまかせにぎり８貫', price: 4980, category: 'course', description: 'お勧め握り８貫と本日の１品、お椀', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '102', name: '特選にぎり８貫', price: 6980, category: 'course', description: '贅沢なお勧め握り８貫と本日の１品、お椀', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '103', name: '特選にぎり１０貫', price: 9900, category: 'course', description: '贅沢なお勧め握り１０貫と本日の１品、厳選刺身５種盛り合わせ、お椀', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // ドリンク
  { id: '151', name: '黒龍　福井', price: 1800, category: 'drink', subcategory: '日本酒', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '152', name: '三井の寿　福岡', price: 1500, category: 'drink', subcategory: '日本酒', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '153', name: '日高見　宮城', price: 1500, category: 'drink', subcategory: '日本酒', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '154', name: 'ゼブラ　山形', price: 3500, category: 'drink', subcategory: '日本酒', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '155', name: 'サントリー プレミアムモルツ生', price: 880, category: 'drink', subcategory: 'ビール', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '156', name: 'サッポロラガー中瓶', price: 900, category: 'drink', subcategory: 'ビール', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '157', name: '角ハイボール', price: 770, category: 'drink', subcategory: 'その他', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '158', name: '富乃宝山(芋)', price: 880, category: 'drink', subcategory: '焼酎', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '159', name: '吉四六(麦)', price: 880, category: 'drink', subcategory: '焼酎', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '160', name: '鳥飼(米)', price: 880, category: 'drink', subcategory: '焼酎', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '161', name: 'グラスワイン(赤・白)', price: 1000, category: 'drink', subcategory: 'ワイン', soldOut: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

// 初期設定データ
const INITIAL_SETTINGS: Settings = {
  storeName: 'KABUKI寿司',
  address: {
    postalCode: '160-0021',
    prefecture: '東京都',
    city: '新宿区歌舞伎町2丁目45−16',
    building: 'GEST34ビル4F',
  },
  phone: '03-6302-1477',
  businessHours: {
    open: '18:00',
    close: '24:00',
  },
  closedDays: [],
  socialMedia: {
    instagram: 'https://www.instagram.com/kabukizushi_ichiban?igsh=MWRzdmxuNzF1ODlzNA%3D%3D&utm_source=qr',
    tiktok: 'https://www.tiktok.com/@kabukisushi1001?_t=8kzjmGapCuP&_r=1',
    youtube: 'https://www.youtube.com/@KABUKI-ev3sy',
    facebook: 'https://www.facebook.com/profile.php?id=100064940143541',
  },
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVisits: 1364,
    todayVisits: 42,
    popularMenuItems: [],
    recentUpdates: [],
  });

  // 初回マウント時にLocalStorageからデータを読み込む
  useEffect(() => {
    // メニューアイテムの読み込みまたは初期化
    const savedMenuItems = getStorageItem<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS);
    if (savedMenuItems) {
      setMenuItems(savedMenuItems);
    } else {
      setMenuItems(INITIAL_MENU_ITEMS);
      setStorageItem(STORAGE_KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
    }

    // ギャラリー画像の読み込み
    const savedImages = getStorageItem<GalleryImage[]>(STORAGE_KEYS.GALLERY_IMAGES);
    if (savedImages) {
      setGalleryImages(savedImages);
    } else {
      const initialImages: GalleryImage[] = [];
      setGalleryImages(initialImages);
      setStorageItem(STORAGE_KEYS.GALLERY_IMAGES, initialImages);
    }

    // 設定の読み込み
    const savedSettings = getStorageItem<Settings>(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      setSettings(savedSettings);
    } else {
      setSettings(INITIAL_SETTINGS);
      setStorageItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    }

    // アナリティクスの読み込み
    const savedAnalytics = getStorageItem<Analytics>(STORAGE_KEYS.ANALYTICS);
    if (savedAnalytics) {
      setAnalytics(savedAnalytics);
    }
  }, []);

  // メニューアイテムを追加
  const addMenuItem = (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    setStorageItem(STORAGE_KEYS.MENU_ITEMS, updated);

    // アナリティクスを更新
    addRecentUpdate('menu', `メニュー「${newItem.name}」を追加しました`);
  };

  // メニューアイテムを更新
  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    const updated = menuItems.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    );
    setMenuItems(updated);
    setStorageItem(STORAGE_KEYS.MENU_ITEMS, updated);

    const item = menuItems.find(m => m.id === id);
    if (item) {
      addRecentUpdate('menu', `メニュー「${item.name}」を更新しました`);
    }
  };

  // メニューアイテムを削除
  const deleteMenuItem = (id: string) => {
    const item = menuItems.find(m => m.id === id);
    const updated = menuItems.filter(item => item.id !== id);
    setMenuItems(updated);
    setStorageItem(STORAGE_KEYS.MENU_ITEMS, updated);

    if (item) {
      addRecentUpdate('menu', `メニュー「${item.name}」を削除しました`);
    }
  };

  // 売り切れ状態を切り替え
  const toggleSoldOut = (id: string) => {
    const updated = menuItems.map(item =>
      item.id === id
        ? { ...item, soldOut: !item.soldOut, updatedAt: new Date().toISOString() }
        : item
    );
    setMenuItems(updated);
    setStorageItem(STORAGE_KEYS.MENU_ITEMS, updated);
  };

  // ギャラリー画像を追加
  const addImage = (image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => {
    const newImage: GalleryImage = {
      ...image,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
    };
    const updated = [...galleryImages, newImage];
    setGalleryImages(updated);
    setStorageItem(STORAGE_KEYS.GALLERY_IMAGES, updated);

    addRecentUpdate('gallery', '新しい画像をアップロードしました');
  };

  // ギャラリー画像を削除
  const deleteImage = (id: string) => {
    const updated = galleryImages.filter(img => img.id !== id);
    setGalleryImages(updated);
    setStorageItem(STORAGE_KEYS.GALLERY_IMAGES, updated);

    addRecentUpdate('gallery', '画像を削除しました');
  };

  // ギャラリー画像の順序を変更
  const reorderImages = (images: GalleryImage[]) => {
    setGalleryImages(images);
    setStorageItem(STORAGE_KEYS.GALLERY_IMAGES, images);
  };

  // 設定を更新
  const updateSettings = (updates: Partial<Settings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    setStorageItem(STORAGE_KEYS.SETTINGS, updated);

    addRecentUpdate('settings', '店舗情報を更新しました');
  };

  // 最近の更新を追加（ヘルパー関数）
  const addRecentUpdate = (type: 'menu' | 'gallery' | 'settings', description: string) => {
    const newUpdate = {
      type,
      description,
      timestamp: new Date().toISOString(),
    };
    const updatedAnalytics = {
      ...analytics,
      recentUpdates: [newUpdate, ...analytics.recentUpdates].slice(0, 10), // 最新10件のみ保持
    };
    setAnalytics(updatedAnalytics);
    setStorageItem(STORAGE_KEYS.ANALYTICS, updatedAnalytics);
  };

  return (
    <DataContext.Provider
      value={{
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleSoldOut,
        galleryImages,
        addImage,
        deleteImage,
        reorderImages,
        settings,
        updateSettings,
        analytics,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// カスタムフック
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
