/**
 * Shared utility for text settings merge logic.
 * Used by EditorPage, LandingPage, and TravelerPage.
 */

const DYNAMIC_PREFIXES = ['image_', 'nigiri_', 'makimono_', 'ippin_', 'nihonshu_', 'alcohol_', 'shochu_', 'other_'];

/**
 * 写真が未設定のときに表示する画像（KABUKI寿司のロゴ）。
 *
 * 以前は「+追加」で作った項目に海外のフリー素材写真が入る作りだったため、写真を
 * 差し替えないまま公開すると、無関係な写真がそのままお客様に見えていた。
 */
export const PLACEHOLDER_IMAGE = '/assets/photo-placeholder.svg';

/** 過去に仮画像として使われていたURL。データ側に残っていても未設定として扱う */
const LEGACY_PLACEHOLDERS = [
    'photo-1763647756796-af9230245bf8', // 旧・Unsplashの仮画像
    '/assets/placeholder.webp',          // 存在しないファイルを指していた旧フォールバック
];

/** 写真が実質未設定か（空、または過去の仮画像） */
export function isPlaceholderImage(url: string | undefined | null): boolean {
    if (!url) return true;
    return LEGACY_PLACEHOLDERS.some(p => url.includes(p));
}

/** 表示用の画像URLを解決する。未設定ならロゴのプレースホルダーを返す */
export function resolveMenuImage(url: string | undefined | null): string {
    return isPlaceholderImage(url) ? PLACEHOLDER_IMAGE : (url as string);
}

/**
 * 見出し・商品名・価格などの1行テキストから、入力時に紛れ込む HTML を取り除く。
 *
 * 入力欄が contentEditable で innerHTML をそのまま保存しているため、改行すると <br>、
 * スペースを打つと &nbsp; がデータに残り、「価格が 2000<br>」「名前が <br> だけ」と
 * いった壊れ方をしていた。太字などの装飾は残したいので、対象は改行と空白のみに絞る。
 */
export function sanitizeInlineHtml(html: string): string {
    return html
        .replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, ' ')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/ /g, ' ')
        // 全角スペース(　)は意図的に使われることがあるので潰さない
        .replace(/[ \t\r\n]+/g, ' ')
        .replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
}

export const isDynamicKey = (k: string): boolean =>
    (k.startsWith('image_') || DYNAMIC_PREFIXES.some(p => k.startsWith(p))) && !k.includes('_content');

/**
 * Get ordered indices for a menu/gallery category, respecting saved order.
 * Used to keep LandingPage and TravelerPage display order in sync.
 */
export function getOrderedIndices(
    section: Record<string, string> | undefined,
    category: string,
    keyPrefix?: string
): number[] {
    if (!section) return [];
    const prefix = keyPrefix || category;
    const isGallery = category === 'image';
    const indices = Object.keys(section)
        .filter(key => isGallery
            ? (key.startsWith('image_') && !key.includes('_image'))
            : (key.startsWith(`${prefix}_`) && key.endsWith('_name')))
        .map(key => parseInt(key.split('_')[1]))
        .filter(num => !isNaN(num));

    const orderKey = `${category}_order`;
    const savedOrder = section[orderKey];
    if (savedOrder) {
        const orderArr = savedOrder.split(',').map(Number).filter(n => !isNaN(n));
        const missing = indices.filter(i => !orderArr.includes(i));
        return [...orderArr.filter(i => indices.includes(i)), ...missing];
    }
    return indices.sort((a, b) => a - b);
}

/**
 * Merge saved text settings with defaults.
 * - For sections with dynamic keys (menu items, gallery images), remove default dynamic keys and use saved ones.
 * - For static keys, defaults fill in any missing keys.
 * - Corrects "reversed text" artifacts from old bugs.
 */
export function mergeTextSettingsWithDefaults(
    saved: Record<string, any>,
    defaults: Record<string, Record<string, string>>
): Record<string, Record<string, string>> {
    // Deep copy to avoid mutating the input
    const parsed = JSON.parse(JSON.stringify(saved));

    // Proactive correction for "reversed text" issue
    if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach(sectionId => {
            const section = parsed[sectionId];
            if (section && typeof section === 'object') {
                Object.keys(section).forEach(field => {
                    const val = section[field];
                    if (typeof val === 'string' && (val.toLowerCase().includes('ihsus enilni') || val.toLowerCase().includes('ih su s enilni'))) {
                        parsed[sectionId][field] = defaults?.[sectionId]?.[field] || val;
                    }
                });
            }
        });
    }

    const merged = { ...defaults };
    if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach(sectionId => {
            const savedSection = parsed[sectionId];
            const defaultSection = defaults[sectionId] || {};
            const hasSavedDynamic = Object.keys(savedSection).some(isDynamicKey);
            if (hasSavedDynamic) {
                const sectionWithStaticDefaults: Record<string, string> = {};
                Object.keys(defaultSection).forEach(k => {
                    if (!isDynamicKey(k)) sectionWithStaticDefaults[k] = defaultSection[k];
                });
                merged[sectionId] = { ...sectionWithStaticDefaults, ...savedSection };
            } else {
                merged[sectionId] = { ...defaultSection, ...savedSection };
            }
        });
    }
    return merged;
}

/**
 * Migration: Remove old Unsplash default URLs from background settings.
 */
export function migrateBackgroundSettings(parsed: Record<string, any>): Record<string, any> {
    const result = { ...parsed };
    const oldUnsplashUrl = 'https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&auto=format&q=80';
    if (result.affiliated && result.affiliated.value === oldUnsplashUrl) delete result.affiliated;
    if (result.home && (result.home.value === '/assets/home_hero.webp' || result.home.value === 'https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80')) delete result.home;
    return result;
}
