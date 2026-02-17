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
}

export interface StoreConfig {
  id: StoreId;
  displayName: string;
  shortName: string;
  storagePrefix: string;
  basePath: string;
  travelerPath: string;
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
    links: {
      phone: '0364576612',
      phoneDisplay: '03-6457-6612',
      reserveUrl: 'https://www.tablecheck.com/ja/kabukisushi-shinjuku/reserve/message',
      mapsUrl: 'https://maps.app.goo.gl/u9gjVFA4ZFnH5ZVG6',
      instagram: 'https://www.instagram.com/kabukizushi_shinjuku/?hl=ja',
      facebook: 'https://www.facebook.com/profile.php?id=100068484907117&locale=hi_IN',
      tiktok: 'https://www.tiktok.com/@kabukisushi1',
      youtube: 'https://www.youtube.com/@KABUKI-ev3sy',
    },
  },
  ichiban: {
    id: 'ichiban',
    displayName: 'KABUKI寿司 1番通り店',
    shortName: '1番通り店',
    storagePrefix: 'ichiban',
    basePath: '/ichiban-dori',
    travelerPath: '/ichiban-dori/traveler',
    links: {
      phone: '0363021477',
      phoneDisplay: '03-6302-1477',
      reserveUrl: 'https://www.tablecheck.com/shops/kabukisushi-ichiban/reserve',
      mapsUrl: 'https://maps.app.goo.gl/yC8c23nWvXpjYmoXA',
      instagram: 'https://www.instagram.com/kabukizushi_ichiban',
      facebook: 'https://www.facebook.com/profile.php?id=100068484907117',
      tiktok: 'https://www.tiktok.com/@kabukisushi1',
      youtube: 'https://www.youtube.com/@KABUKI-ev3sy',
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
