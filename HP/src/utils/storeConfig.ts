export type StoreId = 'honten' | 'ichiban';

export interface StoreLinks {
  phone: string;
  phoneDisplay: string;
  reserveUrl: string;
  mapsUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  line: string;
}

export interface StoreTheme {
  /** 編集画面の最外背景・メインエリアの色 */
  canvas: string;
  /** トップバー（ヘッダー）の背景色 */
  topBar: string;
  /** トップバー下辺のボーダー色 */
  topBarBorder: string;
  /** トップバー上の文字色（セレクタ・アイコン等） */
  topBarText: string;
  /** 店舗識別バッジの背景色 */
  badge: string;
  /** 店舗識別バッジの文字色 */
  badgeText: string;
}

export interface StoreConfig {
  id: StoreId;
  displayName: string;
  shortName: string;
  storagePrefix: string;
  basePath: string;
  travelerPath: string;
  /** 日本語ページのタブ名（検索結果の見出しにも使われる） */
  pageTitle: string;
  /** 訪日客向け（英語）ページのタブ名 */
  travelerPageTitle: string;
  /** 管理画面を店舗ごとに色分けして取り違えを防ぐためのテーマ */
  theme: StoreTheme;
  links: StoreLinks;
}

export const STORE_CONFIGS: Record<StoreId, StoreConfig> = {
  honten: {
    id: 'honten',
    displayName: 'KABUKI寿司 本店',
    shortName: '本店',
    storagePrefix: 'honten',
    basePath: '/',
    travelerPath: '/traveler',
    pageTitle: 'KABUKI寿司 本店｜歌舞伎町の江戸前寿司・朝4時まで',
    travelerPageTitle: 'KABUKISUSHI MAIN BRANCH | Edo-mae Sushi in Shinjuku',
    theme: {
      canvas: 'bg-slate-100',
      topBar: 'bg-white',
      topBarBorder: 'border-slate-200',
      topBarText: 'text-slate-900',
      badge: 'bg-blue-600',
      badgeText: 'text-white',
    },
    links: {
      phone: '0364576612',
      phoneDisplay: '03-6457-6612',
      reserveUrl: 'https://www.tablecheck.com/ja/kabukisushi-shinjuku/reserve/message',
      mapsUrl: 'https://maps.app.goo.gl/u9gjVFA4ZFnH5ZVG6',
      instagram: 'https://www.instagram.com/kabukizushi_shinjuku/?hl=ja',
      facebook: 'https://www.facebook.com/profile.php?id=100068484907117&locale=hi_IN',
      tiktok: 'https://www.tiktok.com/@kabukisushi1',
      youtube: 'https://www.youtube.com/@KABUKI-ev3sy',
      line: '',
    },
  },
  ichiban: {
    id: 'ichiban',
    displayName: 'KABUKI寿司 1番通り店',
    shortName: '1番通り店',
    storagePrefix: 'ichiban',
    basePath: '/ichiban-dori',
    travelerPath: '/ichiban-dori/traveler',
    pageTitle: 'KABUKI寿司 1番通り店｜新宿・歌舞伎町の寿司',
    travelerPageTitle: 'KABUKISUSHI NO.1 STREET BRANCH | Sushi in Shinjuku',
    theme: {
      canvas: 'bg-slate-900',
      topBar: 'bg-slate-800',
      topBarBorder: 'border-slate-700',
      topBarText: 'text-slate-100',
      badge: 'bg-blue-500',
      badgeText: 'text-white',
    },
    links: {
      phone: '0363021477',
      phoneDisplay: '03-6302-1477',
      reserveUrl: 'https://www.tablecheck.com/shops/kabukisushi-ichiban/reserve',
      mapsUrl: 'https://maps.app.goo.gl/yC8c23nWvXpjYmoXA',
      instagram: 'https://www.instagram.com/kabukizushi_ichiban',
      facebook: 'https://www.facebook.com/profile.php?id=100068484907117',
      tiktok: 'https://www.tiktok.com/@kabukisushi1',
      youtube: 'https://www.youtube.com/@KABUKI-ev3sy',
      line: '',
    },
  },
};

export function getStorageKeys(storeId: StoreId) {
  const prefix = STORE_CONFIGS[storeId].storagePrefix;
  return {
    backgroundSettings: `${prefix}_background_settings`,
    layoutSettings: `${prefix}_layout_settings`,
    textSettings: `${prefix}_text_settings`,
  };
}
