/**
 * Shared utility for text settings merge logic.
 * Used by EditorPage, LandingPage, and TravelerPage.
 */

const DYNAMIC_PREFIXES = ['image_', 'nigiri_', 'makimono_', 'ippin_', 'nihonshu_', 'alcohol_', 'shochu_', 'other_'];

export const isDynamicKey = (k: string): boolean =>
    (k.startsWith('image_') || DYNAMIC_PREFIXES.some(p => k.startsWith(p))) && !k.includes('_content');

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
