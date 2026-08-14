import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import {
    Settings,
    Layout,
    Type,
    Palette,
    ShoppingBag,
    Monitor,
    Smartphone,
    Undo,
    Redo,
    ChevronRight,
    HelpCircle,
    Menu,
    Plus,
    Users,
    FileText,
    X,
    Image as ImageIcon,
    Video,
    Trash2,
    Save,
    Globe,
    ExternalLink,
    UserCog,
    Lock,
    LogOut,
    BarChart3,
    MoreHorizontal
} from 'lucide-react';
import { LandingPage, DEFAULT_TEXT_SETTINGS, getDefaultTextSettings } from '../../pages/LandingPage';
import { type StoreId, STORE_CONFIGS, getStorageKeys } from '../../../utils/storeConfig';
import { loadStoreSettings, saveAllSettings, type SettingsVersions } from '../../../lib/settingsService';
import { mergeTextSettingsWithDefaults } from '../../../lib/textSettingsUtils';
import ImageAssetLibrary from '../components/editor/ImageAssetLibrary';
import ImageEditorModal from '../components/editor/ImageEditorModal';
import AddSectionModal from '../components/editor/AddSectionModal';
import TextEditorModal from '../components/editor/TextEditorModal';
import { TravelerPage } from '../../pages/TravelerPage';
import HelpModal from '../components/editor/HelpModal';
import MarketingTagGuideModal from '../components/editor/MarketingTagGuideModal';

export type BackgroundType = 'color' | 'image' | 'video';

export interface BackgroundConfig {
    type: BackgroundType;
    value: string;
    overlay?: number;
    originalUrl?: string;
    backgroundMode?: 'cover' | 'contain' | 'tile' | 'center';
    overlayOpacity?: number; // 0 to 100
    textTheme?: 'light' | 'dark';
}

export interface LayoutConfig {
    width: 'auto' | 'full' | 'wide' | 'normal' | 'small';
    alignment: 'top' | 'center' | 'bottom';
    fullHeight: boolean;
    topSpace: boolean;
    bottomSpace: boolean;
}

export default function EditorPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('sections');
    const [activeSection, setActiveSection] = useState<string | undefined>('home');
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
    const [backgroundEditSection, setBackgroundEditSection] = useState<string | undefined>(undefined);
    const [activeBackgroundTab, setActiveBackgroundTab] = useState<BackgroundType>('image');
    const [showAssetLibrary, setShowAssetLibrary] = useState(false);
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [editingImage, setEditingImage] = useState<string>('');
    const [showTextEditor, setShowTextEditor] = useState(false);

    const [textEditSection, setTextEditSection] = useState<string | undefined>(undefined);
    const [editingMenuImage, setEditingMenuImage] = useState<{
        sectionId: string;
        category: string;
        index: number;
    } | null>(null);
    const [editPage, setEditPage] = useState<'landing' | 'traveler'>('landing');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreId>('honten');
    const selectedStoreRef = useRef<StoreId>(selectedStore);
    const [showMarketingTagGuide, setShowMarketingTagGuide] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    // Background settings state
    const [backgroundSettings, setBackgroundSettings] = useState<Record<string, BackgroundConfig>>({
        home: { type: 'image', value: '/assets/home_hero_new.webp' },
        about: { type: 'color', value: '#ffffff', textTheme: 'dark' },
        gallery: { type: 'color', value: '#E8EAEC' },
        access: { type: 'image', value: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080' },
        menu: { type: 'color', value: '#f5f5f5' },
        affiliated: { type: 'image', value: '/assets/honten_hero.webp' },
        footer: { type: 'color', value: '#1C1C1C' }
    });

    // Layout settings state
    const [layoutSettings, setLayoutSettings] = useState<Record<string, LayoutConfig>>({
        home: { width: 'full', alignment: 'center', fullHeight: true, topSpace: false, bottomSpace: false },
        about: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        gallery: { width: 'wide', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        access: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        menu: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        affiliated: { width: 'full', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        footer: { width: 'wide', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true }
    });

    // Text settings state
    const [textSettings, setTextSettings] = useState<Record<string, Record<string, string>>>(getDefaultTextSettings('honten'));

    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
    const updateLastSaved = () => setLastSavedTime(new Date());

    // History state for Undo/Redo
    const [past, setPast] = useState<any[]>([]);
    const [future, setFuture] = useState<any[]>([]);

    const pushToHistory = () => {
        const currentState = {
            backgroundSettings,
            layoutSettings,
            textSettings: { ...textSettings }
        };
        // Use a functional update to avoid stale state in history
        setPast(prev => {
            const newPast = [...prev, JSON.parse(JSON.stringify(currentState))];
            // Limit history to 50 items to prevent memory issues
            if (newPast.length > 50) newPast.shift();
            return newPast;
        });
        setFuture([]); // Clear future on new action
    };

    const undo = () => {
        if (past.length === 0) return;

        const currentState = {
            backgroundSettings,
            layoutSettings,
            textSettings: { ...textSettings }
        };

        const previousState = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture(prev => [JSON.parse(JSON.stringify(currentState)), ...prev]);
        setPast(newPast);

        // Restore state (central persistence effect handles localStorage + Supabase save)
        setBackgroundSettings(previousState.backgroundSettings);
        setLayoutSettings(previousState.layoutSettings);
        setTextSettings(previousState.textSettings);
    };

    const redo = () => {
        if (future.length === 0) return;

        const currentState = {
            backgroundSettings,
            layoutSettings,
            textSettings: { ...textSettings }
        };

        const nextState = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, JSON.parse(JSON.stringify(currentState))]);
        setFuture(newFuture);

        // Restore state (central persistence effect handles localStorage + Supabase save)
        setBackgroundSettings(nextState.backgroundSettings);
        setLayoutSettings(nextState.layoutSettings);
        setTextSettings(nextState.textSettings);
    };

    // Default background/layout settings for resetting
    const DEFAULT_BG: Record<string, BackgroundConfig> = {
        home: { type: 'image', value: '/assets/home_hero_new.webp' },
        about: { type: 'color', value: '#ffffff', textTheme: 'dark' },
        gallery: { type: 'color', value: '#E8EAEC' },
        access: { type: 'image', value: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080' },
        menu: { type: 'color', value: '#f5f5f5' },
        affiliated: { type: 'image', value: '/assets/honten_hero.webp' },
        footer: { type: 'color', value: '#1C1C1C' }
    };
    const DEFAULT_LAYOUT: Record<string, LayoutConfig> = {
        home: { width: 'full', alignment: 'center', fullHeight: true, topSpace: false, bottomSpace: false },
        about: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        gallery: { width: 'wide', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        access: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        menu: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        affiliated: { width: 'full', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
        footer: { width: 'wide', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true }
    };

    const handleStoreSwitch = async (newStoreId: StoreId) => {
        // Flush any pending debounced save before switching
        if (supabaseSaveTimerRef.current) {
            clearTimeout(supabaseSaveTimerRef.current);
            supabaseSaveTimerRef.current = undefined;
        }

        // Save current store data to localStorage + Supabase (awaited to prevent data loss)
        const currentKeys = getStorageKeys(selectedStore);
        localStorage.setItem(currentKeys.backgroundSettings, JSON.stringify(backgroundSettings));
        localStorage.setItem(currentKeys.layoutSettings, JSON.stringify(layoutSettings));
        localStorage.setItem(currentKeys.textSettings, JSON.stringify(textSettings));

        const saved = await persistToSupabase(selectedStore, backgroundSettings, layoutSettings, textSettings);
        if (saved === 'conflict') {
            alert('他の端末で先に更新されているため、この画面の変更は保存できませんでした。\n店舗の切り替えを中止します。ページを再読み込みしてから編集し直してください。');
            return;
        }
        if (saved === 'error') {
            alert('保存に失敗したため、店舗の切り替えを中止しました。通信状況を確認してください。');
            return;
        }

        // Switch store
        setLoadState('loading');
        loadStateRef.current = 'loading';
        setSelectedStore(newStoreId);
        selectedStoreRef.current = newStoreId;

        // Load new store data from Supabase（読めなければ編集させない。localStorage は使わない）
        const newDefaults = getDefaultTextSettings(newStoreId);
        const loaded = await loadStoreSettings(newStoreId);

        if (!loaded.ok) {
            setLoadErrorMessage(loaded.errorMessage || '設定の読み込みに失敗しました');
            setLoadState('failed');
            loadStateRef.current = 'failed';
            return;
        }

        const nextBg = loaded.backgroundSettings || { ...DEFAULT_BG };
        const nextLayout = loaded.layoutSettings || { ...DEFAULT_LAYOUT };
        const nextText = loaded.textSettings ? mergeTextWithDefaults(loaded.textSettings, newDefaults) : newDefaults;

        setBackgroundSettings(nextBg);
        setLayoutSettings(nextLayout);
        setTextSettings(nextText);

        versionsRef.current = loaded.versions;
        lastPersistedRef.current = signatureOf(nextBg, nextLayout, nextText);
        setLoadState('ready');
        loadStateRef.current = 'ready';

        // Clear undo/redo history
        setPast([]);
        setFuture([]);
        setLastSavedTime(null);
    };

    const menuItems = [
        { id: 'styles', icon: Palette, label: 'スタイル' },
        { id: 'store', icon: ShoppingBag, label: 'ストア' },
        { id: 'settings', icon: Settings, label: '設定' },
        { id: 'sections', icon: Layout, label: 'セクション' },
    ];

    const handleBackgroundEdit = (sectionId: string) => {
        setBackgroundEditSection(sectionId);
        const currentConfig = backgroundSettings[sectionId];
        if (currentConfig) {
            setActiveBackgroundTab(currentConfig.type);
        }
        setShowBackgroundPanel(true);
    };

    const updateBackground = (sectionId: string, config: Partial<BackgroundConfig>) => {
        pushToHistory();
        setBackgroundSettings(prev => ({
            ...prev,
            [sectionId]: {
                ...(prev[sectionId] || { type: 'color', value: '#ffffff' }),
                ...config
            }
        }));
    };

    const handleImageSelect = (url: string) => {
        if (editingMenuImage) {
            const { sectionId, category, index } = editingMenuImage;
            const field = sectionId === 'gallery' ? `${category}_${index}` : (sectionId === 'about' || sectionId === 'affiliated' || sectionId === 'access' || category.endsWith('_image')) ? category : `${category}_${index}_image`;
            handleInlineTextChange(sectionId, field, url);
            setEditingMenuImage(null);
        } else if (backgroundEditSection) {
            updateBackground(backgroundEditSection, {
                type: 'image',
                value: url,
                originalUrl: url // Store original URL when selecting new image
            });
        }
        setShowAssetLibrary(false);
    };

    const handleImageEdit = () => {
        if (backgroundEditSection) {
            const currentConfig = backgroundSettings[backgroundEditSection];
            if (currentConfig && currentConfig.type === 'image') {
                setEditingImage(currentConfig.value);
                setShowImageEditor(true);
            }
        }
    };

    const handleImageSave = (editedUrl: string) => {
        if (backgroundEditSection) {
            const currentConfig = backgroundSettings[backgroundEditSection];
            // Preserve original URL if it exists, otherwise set current value as original
            const originalUrl = currentConfig?.originalUrl || currentConfig?.value;

            updateBackground(backgroundEditSection, {
                type: 'image',
                value: editedUrl,
                originalUrl: originalUrl
            });
        }
        setShowImageEditor(false);
    };

    const handleDeleteBackground = () => {
        if (backgroundEditSection) {
            pushToHistory();
            setBackgroundSettings(prev => {
                const newSettings = { ...prev };
                delete newSettings[backgroundEditSection];
                return newSettings;
            });
            setShowBackgroundPanel(false);
        }
    };

    const handleTextEdit = (sectionId: string) => {
        setTextEditSection(sectionId);
        setShowTextEditor(true);
    };

    const handleTextSave = (content: Record<string, string>) => {
        if (textEditSection) {
            pushToHistory();
            setTextSettings(prev => ({
                ...prev,
                [textEditSection]: content
            }));
            setShowTextEditor(false);
        }
    };

    const handleInlineTextChange = (sectionId: string, field: string, value: string) => {
        pushToHistory();
        setTextSettings(prev => {
            const currentSectionText = prev[sectionId] || {};
            return {
                ...prev,
                [sectionId]: {
                    ...currentSectionText,
                    [field]: value
                }
            };
        });
    };

    const handleTextReset = (sectionId: string) => {
        setTextSettings(prev => {
            const defaultSectionText = DEFAULT_TEXT_SETTINGS[sectionId] || {};
            return {
                ...prev,
                [sectionId]: defaultSectionText
            };
        });
    };

    const handleAddMenuItem = (sectionId: string, category: string) => {
        pushToHistory();

        setTextSettings(prev => {
            const currentSection = prev[sectionId] || {};

            // Find next available index
            let nextIndex = 0;
            if (sectionId === 'gallery' && category === 'image') {
                const existingIndices = Object.keys(currentSection)
                    .filter(key => key.startsWith('image_'))
                    .map(key => parseInt(key.replace('image_', '')))
                    .filter(num => !isNaN(num));
                nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0;

                return {
                    ...prev,
                    [sectionId]: {
                        ...currentSection,
                        [`image_${nextIndex}`]: 'https://images.unsplash.com/photo-1763647756796-af9230245bf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&h=800&auto=format&q=80',
                    }
                };
            } else {
                const existingIndices = Object.keys(currentSection)
                    .filter(key => key.startsWith(`${category}_`) && key.endsWith('_name'))
                    .map(key => parseInt(key.split('_')[1]))
                    .filter(num => !isNaN(num));
                nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0;

                return {
                    ...prev,
                    [sectionId]: {
                        ...currentSection,
                        [`${category}_${nextIndex}_name`]: '新しいメニュー',
                        [`${category}_${nextIndex}_name_en`]: 'New Menu Item',
                        [`${category}_${nextIndex}_name_ko`]: '새 메뉴',
                        [`${category}_${nextIndex}_name_zh`]: '新菜单',
                        [`${category}_${nextIndex}_price`]: '0',
                        [`${category}_${nextIndex}_image`]: 'https://images.unsplash.com/photo-1763647756796-af9230245bf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&h=300&auto=format&q=80',
                        [`${category}_${nextIndex}_note`]: '',
                        [`${category}_${nextIndex}_soldOut`]: 'false',
                        [`${category}_${nextIndex}_hidden`]: 'false'
                    }
                };
            }
        });
    };

    const handleDeleteMenuItem = (sectionId: string, category: string, index: number) => {
        console.log('handleDeleteMenuItem called', sectionId, category, index);

        pushToHistory();

        setTextSettings(prev => {
            const currentSection = { ...prev[sectionId] };

            if (sectionId === 'gallery' && category === 'image') {
                // Delete both possible key formats to handle migration from old bugs
                delete currentSection[`image_${index}`];
                delete currentSection[`image_${index}_image`];
            } else {
                // Create a NEW object without all fields associated with this category and index
                const prefix = `${category}_${index}_`;
                Object.keys(currentSection).forEach(key => {
                    if (key.startsWith(prefix)) {
                        delete currentSection[key];
                    }
                });
            }

            return {
                ...prev,
                [sectionId]: currentSection
            };
        });
    };


    const handleReorderMenuItem = (sectionId: string, category: string, newOrder: number[]) => {
        pushToHistory();
        setTextSettings(prev => {
            const currentSection = { ...prev[sectionId] };
            currentSection[`${category}_order`] = newOrder.join(',');
            return { ...prev, [sectionId]: currentSection };
        });
    };

    const handleMenuImageEdit = (sectionId: string, category: string, index: number) => {
        setEditingMenuImage({ sectionId, category, index });
        setShowAssetLibrary(true);
    };

    const handleSaveBackground = () => {
        // Save settings to localStorage
        const saveKeys = getStorageKeys(selectedStore);
        localStorage.setItem(saveKeys.backgroundSettings, JSON.stringify(backgroundSettings));
        localStorage.setItem(saveKeys.layoutSettings, JSON.stringify(layoutSettings));
        localStorage.setItem(saveKeys.textSettings, JSON.stringify(textSettings));

        // Show success message or feedback if needed (optional, existing UI has a static "Saved" indicator)
        // For now just close the panel
        setShowBackgroundPanel(false);

        // Also trigger a window event so other components (if in same window) know to update, 
        // though for separate tab/window reload is needed.
        window.dispatchEvent(new Event('storage'));

        // Force update the timestamp to show "Just now"
        // This is a mock interaction since the UI is static
    };

    /** 保存できない状態のとき、その理由をユーザー向けの文言で返す */
    const blockedSaveMessage = () => {
        if (loadState === 'failed') {
            return '設定を読み込めていないため保存できません。\nこの状態で保存すると、サイトの内容が古い状態に巻き戻ってしまいます。\nページを再読み込みしてください。';
        }
        if (loadState === 'stale') {
            return '他の端末で先に更新されているため保存できません。\nこのまま保存すると相手の変更を消してしまいます。\nページを再読み込みしてから編集し直してください。';
        }
        return '読み込み中です。少し待ってからお試しください。';
    };

    const handlePublish = async () => {
        if (!canSave) { alert(blockedSaveMessage()); return; }
        handleSaveBackground();
        const result = await persistToSupabase(selectedStoreRef.current, backgroundSettings, layoutSettings, textSettings);
        if (result === 'ok') { alert('公開しました！'); return; }
        if (result === 'conflict') { alert('他の端末で先に更新されていたため、公開を中止しました。\nページを再読み込みしてから編集し直してください。'); return; }
        alert('公開に失敗しました。再度お試しください。');
    };

    // Use shared utility for text merge (see textSettingsUtils.ts)
    const mergeTextWithDefaults = mergeTextSettingsWithDefaults;

    // ---------------------------------------------------------------------
    // 読み込み・保存のガード
    //
    // 2026-08-14 に「古い状態のブラウザが本番DBを丸ごと上書きし、7月に追加した
    // メニューが消える」事故が起きた。原因は以下の3つで、すべてここで塞いでいる。
    //   1. Supabase の読み込みに失敗すると古い localStorage を採用していた
    //      → 読み込み失敗時は編集も保存も一切させない（localStorage は使わない）
    //   2. 画面を開いた直後、未編集のまま自動保存が走っていた
    //      → 読み込んだ内容と1文字も変わっていなければ保存しない
    //   3. 他端末の更新を確認せず全体を上書きしていた
    //      → 楽観ロック（versions）で、先を越されていたら中断する
    // ---------------------------------------------------------------------
    type LoadState = 'loading' | 'ready' | 'failed' | 'stale';
    const [loadState, setLoadState] = useState<LoadState>('loading');
    const [loadErrorMessage, setLoadErrorMessage] = useState<string>('');
    /** 保存が許可されている状態か */
    const canSave = loadState === 'ready';
    /** 各行の updated_at。保存時に「読み込んだ時から変わっていないか」の照合に使う */
    const versionsRef = useRef<SettingsVersions>({});
    /** 最後にDBへ書いた（または読み込んだ）内容のシグネチャ。無変更保存を防ぐ */
    const lastPersistedRef = useRef<string>('');

    const signatureOf = (
        bg: Record<string, any>,
        layout: Record<string, any>,
        text: Record<string, Record<string, string>>
    ) => JSON.stringify({ bg, layout, text });

    // Initialize from Supabase on mount
    useEffect(() => {
        async function initSettings() {
            const storeDefaults = getDefaultTextSettings(selectedStore);
            const loaded = await loadStoreSettings(selectedStore);

            if (!loaded.ok) {
                // 読み込めていない = 手元の状態が最新とは限らない。編集・保存を止める
                setLoadErrorMessage(loaded.errorMessage || '設定の読み込みに失敗しました');
                setLoadState('failed');
                return;
            }

            const nextBg = loaded.backgroundSettings || backgroundSettings;
            const nextLayout = loaded.layoutSettings || layoutSettings;
            const nextText = loaded.textSettings
                ? mergeTextWithDefaults(loaded.textSettings, storeDefaults)
                : storeDefaults;

            setBackgroundSettings(nextBg);
            setLayoutSettings(nextLayout);
            setTextSettings(nextText);

            versionsRef.current = loaded.versions;
            lastPersistedRef.current = signatureOf(nextBg, nextLayout, nextText);
            setLoadState('ready');
        }
        initSettings();
    }, []);

    // Central persistence effect - uses ref to avoid stale store on rapid switching
    const supabaseSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const [supabaseSaveError, setSupabaseSaveError] = useState(false);
    // Keep latest state in refs for unmount flush
    const latestBgRef = useRef(backgroundSettings);
    const latestLayoutRef = useRef(layoutSettings);
    const latestTextRef = useRef(textSettings);
    latestBgRef.current = backgroundSettings;
    latestLayoutRef.current = layoutSettings;
    latestTextRef.current = textSettings;

    // 非同期処理の中から最新の loadState を参照するための ref
    const loadStateRef = useRef<LoadState>(loadState);
    loadStateRef.current = loadState;

    /** 保存の唯一の入口。ガードと楽観ロックの後始末をここに集約する */
    const persistToSupabase = async (
        storeId: StoreId,
        bg: Record<string, any>,
        layout: Record<string, any>,
        text: Record<string, Record<string, string>>
    ): Promise<'ok' | 'conflict' | 'error' | 'blocked'> => {
        if (loadStateRef.current !== 'ready') return 'blocked';

        const result = await saveAllSettings(storeId, bg, layout, text, versionsRef.current);

        if (result.status === 'ok') {
            versionsRef.current = result.versions;
            lastPersistedRef.current = signatureOf(bg, layout, text);
            setSupabaseSaveError(false);
            updateLastSaved();
            return 'ok';
        }

        if (result.status === 'conflict') {
            // 他端末が先に更新している。これ以上書き込ませない
            loadStateRef.current = 'stale';
            setLoadState('stale');
            setSupabaseSaveError(true);
            return 'conflict';
        }

        setSupabaseSaveError(true);
        return 'error';
    };

    useEffect(() => {
        if (loadState !== 'ready') return;

        // Immediate localStorage write (local cache + preview sync)
        // ※ここに書いた値を初期データとして読み戻すことはしない（事故の原因になったため）
        const persistKeys = getStorageKeys(selectedStoreRef.current);
        localStorage.setItem(persistKeys.backgroundSettings, JSON.stringify(backgroundSettings));
        localStorage.setItem(persistKeys.layoutSettings, JSON.stringify(layoutSettings));
        localStorage.setItem(persistKeys.textSettings, JSON.stringify(textSettings));
        window.dispatchEvent(new Event('storage'));

        // 読み込んだ内容から変わっていなければ保存しない（開いただけで上書きしない）
        if (signatureOf(backgroundSettings, layoutSettings, textSettings) === lastPersistedRef.current) return;

        // Debounced Supabase save (2 seconds)
        if (supabaseSaveTimerRef.current) clearTimeout(supabaseSaveTimerRef.current);
        supabaseSaveTimerRef.current = setTimeout(() => {
            supabaseSaveTimerRef.current = undefined;
            persistToSupabase(selectedStoreRef.current, backgroundSettings, layoutSettings, textSettings);
        }, 2000);

        return () => { if (supabaseSaveTimerRef.current) clearTimeout(supabaseSaveTimerRef.current); };
    }, [backgroundSettings, layoutSettings, textSettings, loadState]);

    // Flush pending save on unmount to prevent data loss
    useEffect(() => {
        return () => {
            if (supabaseSaveTimerRef.current) {
                clearTimeout(supabaseSaveTimerRef.current);
                persistToSupabase(selectedStoreRef.current, latestBgRef.current, latestLayoutRef.current, latestTextRef.current);
            }
        };
    }, []);

    const handleLayoutChange = (sectionId: string, config: Partial<LayoutConfig>) => {
        pushToHistory();
        setLayoutSettings(prev => ({
            ...prev,
            [sectionId]: { ...prev[sectionId], ...config }
        }));
    };

    const sections = [
        { id: 'home', label: 'HOME' },
        { id: 'about', label: 'ABOUT' },
        { id: 'gallery', label: 'GALLERY' },
        { id: 'access', label: 'ACCESS' },
        { id: 'menu', label: 'MENU' },
        { id: 'tanpin', label: 'TANPIN' },
        { id: 'nigiri', label: 'NIGIRI' },
        { id: 'makimono', label: 'MAKIMONO' },
        { id: 'ippin', label: 'IPPIN' },
        { id: 'ippin_text', label: 'IPPIN_補足テキスト' },
        { id: 'drink_sake', label: 'DRINK（日本酒）' },
        { id: 'drink', label: 'DRINK' },
        { id: 'affiliated', label: 'Affiliated Store' },
    ];

    // 店舗ごとのテーマ色（管理画面の取り違え防止）
    const storeTheme = STORE_CONFIGS[selectedStore].theme;

    return (
        <div className={`flex h-screen ${storeTheme.canvas} overflow-hidden font-sans`}>

            {/* 読み込み失敗・競合の警告。この状態では保存を一切させない */}
            {(loadState === 'failed' || loadState === 'stale') && (
                <div className="absolute inset-x-0 top-0 z-[100] bg-red-600 text-white px-6 py-3 shadow-lg">
                    <div className="flex items-start gap-3 max-w-4xl mx-auto">
                        <span className="text-lg leading-none mt-0.5">⚠️</span>
                        <div className="flex-1 text-sm">
                            <div className="font-bold mb-0.5">
                                {loadState === 'failed'
                                    ? '設定を読み込めませんでした（保存は停止しています）'
                                    : '他の端末で先に更新されました（保存は停止しています）'}
                            </div>
                            <div className="text-red-100 text-xs leading-relaxed">
                                {loadState === 'failed'
                                    ? `この状態で編集・保存すると、サイトの内容が古い状態に巻き戻ります。ページを再読み込みしてください。${loadErrorMessage ? `（${loadErrorMessage}）` : ''}`
                                    : 'このまま保存すると相手の変更を消してしまうため、書き込みを止めました。ページを再読み込みしてから編集し直してください。'}
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="shrink-0 px-3 py-1.5 bg-white text-red-700 rounded text-xs font-bold hover:bg-red-50 transition-colors"
                        >
                            再読み込み
                        </button>
                    </div>
                </div>
            )}

            {/* Background Settings Side Panel (Overlay/Right) */}
            {showBackgroundPanel && (
                <div className="w-64 bg-[#2d2d2d] border-l border-black/20 flex flex-col z-30 shadow-2xl text-white absolute right-0 top-14 bottom-0 animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-black/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">背景</span>
                            <ImageIcon size={14} className="text-gray-400" />
                        </div>
                        <button
                            onClick={() => setShowBackgroundPanel(false)}
                            className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Background Tabs */}
                    <div className="flex border-b border-black/10 bg-[#252525]">
                        {[
                            { id: 'color', label: '色', type: 'color' as BackgroundType },
                            { id: 'image', label: '画像', type: 'image' as BackgroundType },
                            { id: 'video', label: '動画', type: 'video' as BackgroundType }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveBackgroundTab(tab.type)}
                                className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeBackgroundTab === tab.type ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeBackgroundTab === 'color' && (
                            <div className="h-full flex flex-col">
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
                                        '#343a40', '#212529', '#fcebc5', '#deb55a',
                                        '#ffefef', '#ffe0e0', '#ffccd5', '#ffb3c1',
                                        '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc'
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { type: 'color', value: color })}
                                            className={`aspect-square rounded shadow-inner border-2 ${backgroundEditSection && backgroundSettings[backgroundEditSection]?.value === color ? 'border-blue-500' : 'border-black/20'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-black/10">
                                    <label className="flex items-center justify-center gap-2 w-full py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded text-[11px] font-bold transition-all cursor-pointer">
                                        <Palette size={14} className="text-gray-400" />
                                        <span className="text-gray-300">カスタム</span>
                                        <input
                                            type="color"
                                            className="sr-only"
                                            onChange={(e) => backgroundEditSection && updateBackground(backgroundEditSection, { type: 'color', value: e.target.value })}
                                            value={backgroundEditSection && backgroundSettings[backgroundEditSection]?.type === 'color' ? backgroundSettings[backgroundEditSection].value : '#ffffff'}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeBackgroundTab === 'image' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        'https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
                                        'https://images.unsplash.com/photo-1651977560790-42e0c5cf2ba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
                                        'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&w=400&q=80',
                                        'https://images.unsplash.com/photo-1638866381709-071747b518c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80',
                                        'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&auto=format&fit=crop&q=80'
                                    ].map((url, i) => (
                                        <div
                                            key={i}
                                            onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { type: 'image', value: url })}
                                            className={`aspect-video rounded bg-gray-800 border transition-all cursor-pointer hover:border-blue-400 ${backgroundEditSection && backgroundSettings[backgroundEditSection]?.value === url ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                        >
                                            {backgroundEditSection && backgroundSettings[backgroundEditSection]?.value === url && (
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center">
                                                    <span className="text-[8px] text-white">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setShowAssetLibrary(true)}
                                        className="aspect-video rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 hover:border-gray-500 bg-white/5 group"
                                    >
                                        <Plus size={14} className="text-gray-500 group-hover:text-gray-300" />
                                        <span className="text-[10px] text-gray-500">その他</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowAssetLibrary(true)}
                                    className="w-full py-2 bg-[#3d3d3d] hover:bg-[#4d4d4d] rounded text-[11px] font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    画像アップロード
                                </button>

                                {backgroundEditSection && (
                                    <>
                                        {/* Display Mode Selection */}
                                        <div className="pt-2 border-t border-black/10">
                                            <span className="text-[10px] font-bold text-gray-400 block mb-2">表示調整</span>
                                            <div className="grid grid-cols-4 gap-1 p-1 bg-black/20 rounded">
                                                {[
                                                    { id: 'cover', label: '拡大' },
                                                    { id: 'contain', label: '全体' },
                                                    { id: 'tile', label: 'タイル' },
                                                    { id: 'center', label: '中央' },
                                                ].map(mode => (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { backgroundMode: mode.id as any })}
                                                        className={`py-1.5 text-[10px] rounded transition-colors ${(backgroundSettings[backgroundEditSection]?.backgroundMode || 'cover') === mode.id
                                                            ? 'bg-gray-600 text-white shadow-sm'
                                                            : 'text-gray-400 hover:text-gray-200'
                                                            }`}
                                                    >
                                                        {mode.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Text Color / Overlay Selection */}
                                        <div className="pt-2">
                                            <span className="text-[10px] font-bold text-gray-400 block mb-2">文字色・オーバーレイ（スモーク）</span>
                                            <div className="space-y-2">
                                                {/* Text Color */}
                                                <div className="bg-black/20 p-2 rounded">
                                                    <span className="text-[10px] text-gray-500 mb-1 block">文字色</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { textTheme: 'light' })}
                                                            className={`flex-1 py-1.5 rounded border text-[10px] font-bold transition-all ${backgroundSettings[backgroundEditSection]?.textTheme === 'light'
                                                                ? 'bg-white border-white text-black'
                                                                : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            白文字
                                                        </button>
                                                        <button
                                                            onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { textTheme: 'dark' })}
                                                            className={`flex-1 py-1.5 rounded border text-[10px] font-bold transition-all ${backgroundSettings[backgroundEditSection]?.textTheme === 'dark'
                                                                ? 'bg-black border-black text-white'
                                                                : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'
                                                                }`}
                                                        >
                                                            黒文字
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Overlay (Smoke) Toggle */}
                                                <div className="bg-black/20 p-2 rounded">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] text-gray-500">背景のスモーク（暗くする）</span>
                                                        <span className="text-[10px] font-bold text-white">
                                                            {(backgroundSettings[backgroundEditSection]?.overlayOpacity || 0) > 0 ? 'ON' : 'OFF'}
                                                        </span>
                                                    </div>

                                                    {(backgroundSettings[backgroundEditSection]?.overlayOpacity || 0) > 0 ? (
                                                        <button
                                                            onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { overlayOpacity: 0 })}
                                                            className="w-full py-2 bg-red-500/80 hover:bg-red-500 text-white rounded text-[11px] font-bold transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Trash2 size={12} />
                                                            スモークを削除する
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { overlayOpacity: 50 })}
                                                            className="w-full py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded text-[11px] font-bold transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Plus size={12} />
                                                            スモークを追加する
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {backgroundEditSection &&
                                    backgroundSettings[backgroundEditSection]?.originalUrl &&
                                    backgroundSettings[backgroundEditSection]?.value !== backgroundSettings[backgroundEditSection]?.originalUrl && (
                                        <button
                                            onClick={() => {
                                                const originalUrl = backgroundSettings[backgroundEditSection]?.originalUrl;
                                                if (originalUrl) {
                                                    updateBackground(backgroundEditSection, {
                                                        type: 'image',
                                                        value: originalUrl
                                                    });
                                                }
                                            }}
                                            className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-2 border border-blue-500/30"
                                        >
                                            <Undo size={14} />
                                            オリジナルに戻す
                                        </button>
                                    )}
                            </div>
                        )}

                        {activeBackgroundTab === 'video' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Concert/Crowd
                                        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // DJ/Music
                                        'https://images.unsplash.com/photo-1514525253440-b393452e3383?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Nightlife
                                        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'  // Party
                                    ].map((url, i) => (
                                        <div
                                            key={i}
                                            onClick={() => backgroundEditSection && updateBackground(backgroundEditSection, { type: 'video', value: url })}
                                            className={`aspect-video rounded bg-gray-800 border transition-all cursor-pointer relative group ${backgroundEditSection && backgroundSettings[backgroundEditSection]?.value === url ? 'border-blue-500 ring-1 ring-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-[#88c057] transition-colors">
                                                    <Video size={14} className="text-white fill-white" />
                                                </div>
                                            </div>
                                            {backgroundEditSection && backgroundSettings[backgroundEditSection]?.value === url && (
                                                <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center">
                                                    <span className="text-[8px] text-white">✓</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setShowAssetLibrary(true)}
                                        className="aspect-video rounded border border-dashed border-gray-700 flex flex-col items-center justify-center gap-1 hover:border-gray-500 bg-white/5 group"
                                    >
                                        <Plus size={14} className="text-gray-500 group-hover:text-gray-300" />
                                        <span className="text-[10px] text-gray-500">その他</span>
                                    </button>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-black/10">
                                    <label className="text-[10px] text-gray-400 font-bold flex items-center gap-2">
                                        <Video size={12} />
                                        動画を埋め込む
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="YouTube, Vimeo URL"
                                        className="w-full bg-[#1C1C1C] border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (backgroundEditSection && val) {
                                                updateBackground(backgroundEditSection, { type: 'video', value: val });
                                            }
                                        }}
                                        defaultValue={backgroundEditSection && backgroundSettings[backgroundEditSection]?.type === 'video' ? backgroundSettings[backgroundEditSection].value : ''}
                                    />
                                    <div className="text-[10px] text-gray-500 text-left">
                                        YouTube, Vimeo などのURLを貼り付けて動画を背景に設定できます。
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-[#252525] border-t border-black/10 space-y-2">
                        <div className="pb-2 border-b border-black/10">
                            <button className="w-full flex items-center justify-between p-2 rounded hover:bg-white/5 group text-left">
                                <div className="flex items-center gap-2">
                                    <Monitor size={14} className="text-gray-400" />
                                    <span className="text-[11px] text-gray-200">拡大</span>
                                </div>
                                <ChevronRight size={12} className="text-gray-600" />
                            </button>
                        </div>
                        <button
                            onClick={handleImageEdit}
                            className="w-full py-2 flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 hover:text-white transition-colors"
                        >
                            <ImageIcon size={14} />
                            画像を編集
                        </button>
                        <button
                            onClick={handleDeleteBackground}
                            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded text-[11px] font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={12} />
                            削除
                        </button>
                        <button
                            onClick={handleSaveBackground}
                            className="w-full py-2 bg-[#88c057] hover:bg-[#7ab04a] text-white rounded text-[11px] font-bold transition-colors shadow-lg"
                        >
                            保存
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 ${storeTheme.canvas}`}>
                {/* Top Bar */}
                <div className={`h-12 ${storeTheme.topBar} border-b ${storeTheme.topBarBorder} ${storeTheme.topBarText} flex items-center justify-between px-4 shadow-sm z-10`}>
                    {/* Left: Store + Page + Device */}
                    <div className="flex items-center gap-2">
                        {/* 編集中の店舗バッジ（取り違え防止） */}
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${storeTheme.badge} ${storeTheme.badgeText} whitespace-nowrap`}>
                            {STORE_CONFIGS[selectedStore].shortName}を編集中
                        </span>
                        <select
                            value={selectedStore}
                            onChange={(e) => handleStoreSwitch(e.target.value as StoreId)}
                            className={`text-xs font-bold ${storeTheme.topBarText} bg-transparent border ${storeTheme.topBarBorder} rounded-md px-2 py-1.5 cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            {(Object.values(STORE_CONFIGS) as Array<{ id: StoreId; displayName: string }>).map((store) => (
                                <option key={store.id} value={store.id} className="text-slate-900 bg-white">
                                    {store.shortName}
                                </option>
                            ))}
                        </select>
                        <div className="h-5 w-px bg-gray-200" />
                        <div className="flex bg-gray-100 p-0.5 rounded-md">
                            <button
                                onClick={() => setEditPage('landing')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${editPage === 'landing' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                JP
                            </button>
                            <button
                                onClick={() => setEditPage('traveler')}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${editPage === 'traveler' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                EN
                            </button>
                        </div>
                        <div className="flex bg-gray-100 p-0.5 rounded-md">
                            <button
                                onClick={() => setDevice('desktop')}
                                className={`p-1 rounded transition-all ${device === 'desktop' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                                title="デスクトップ"
                            >
                                <Monitor size={14} />
                            </button>
                            <button
                                onClick={() => setDevice('mobile')}
                                className={`p-1 rounded transition-all ${device === 'mobile' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                                title="モバイル"
                            >
                                <Smartphone size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Center: Info toggle */}
                    <button
                        onClick={() => setShowInfoPanel(!showInfoPanel)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${showInfoPanel ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        <Settings size={13} />
                        店舗情報
                    </button>

                    {/* Right: Undo/Redo + Save + More menu */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={undo}
                                disabled={past.length === 0}
                                className={`p-1.5 rounded-md transition-all ${past.length > 0 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                                title="元に戻す"
                            >
                                <Undo size={15} />
                            </button>
                            <button
                                onClick={redo}
                                disabled={future.length === 0}
                                className={`p-1.5 rounded-md transition-all ${future.length > 0 ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                                title="やり直す"
                            >
                                <Redo size={15} />
                            </button>
                        </div>
                        <button
                            onClick={async () => {
                                if (!canSave) { alert(blockedSaveMessage()); return; }
                                if (supabaseSaveTimerRef.current) {
                                    clearTimeout(supabaseSaveTimerRef.current);
                                    supabaseSaveTimerRef.current = undefined;
                                }
                                const storeId = selectedStoreRef.current;
                                const btnKeys = getStorageKeys(storeId);
                                localStorage.setItem(btnKeys.backgroundSettings, JSON.stringify(backgroundSettings));
                                localStorage.setItem(btnKeys.layoutSettings, JSON.stringify(layoutSettings));
                                localStorage.setItem(btnKeys.textSettings, JSON.stringify(textSettings));
                                window.dispatchEvent(new Event('storage'));
                                const result = await persistToSupabase(storeId, backgroundSettings, layoutSettings, textSettings);
                                if (result === 'ok') { alert('保存しました!'); return; }
                                if (result === 'conflict') { alert('他の端末で先に更新されていたため、保存を中止しました。\nページを再読み込みしてから編集し直してください。'); return; }
                                alert('保存に失敗しました。再度お試しください。');
                            }}
                            disabled={!canSave}
                            className={`px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-sm transition-colors ${canSave ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            保存
                        </button>
                        {supabaseSaveError && (
                            <span className="text-[10px] text-red-500 font-bold animate-pulse">!</span>
                        )}
                        {lastSavedTime && (
                            <span className="text-[10px] text-gray-400">{lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <div className="h-5 w-px bg-gray-200" />
                        <button
                            onClick={() => window.open('https://kabuki-sushi.co.jp/', '_blank')}
                            className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                            title="サイトを表示"
                        >
                            <ExternalLink size={15} />
                        </button>
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            title="使い方ガイド"
                        >
                            <HelpCircle size={15} />
                        </button>
                        <button
                            onClick={() => setShowMarketingTagGuide(true)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-all"
                            title="タグ埋め込み指示書"
                        >
                            <FileText size={15} />
                        </button>
                        <button
                            onClick={() => { logout(); navigate('/admin/login'); }}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="ログアウト"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>

                {/* Info Panel */}
                {showInfoPanel && (
                    <div className="bg-white border-b border-gray-200 px-6 py-4 overflow-y-auto max-h-[50vh]">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">店舗情報（{STORE_CONFIGS[selectedStore].displayName}）</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">電話番号（表示用）</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.phoneDisplay || STORE_CONFIGS[selectedStore].links.phoneDisplay}
                                        onChange={(e) => handleInlineTextChange('links', 'phoneDisplay', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="03-6457-6612"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">電話番号（発信用）</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.phone || STORE_CONFIGS[selectedStore].links.phone}
                                        onChange={(e) => handleInlineTextChange('links', 'phone', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0364576612"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">LINE</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.line || STORE_CONFIGS[selectedStore].links.line}
                                        onChange={(e) => handleInlineTextChange('links', 'line', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://line.me/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Instagram</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.instagram || STORE_CONFIGS[selectedStore].links.instagram}
                                        onChange={(e) => handleInlineTextChange('links', 'instagram', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Facebook</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.facebook || STORE_CONFIGS[selectedStore].links.facebook}
                                        onChange={(e) => handleInlineTextChange('links', 'facebook', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">TikTok</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.tiktok || STORE_CONFIGS[selectedStore].links.tiktok}
                                        onChange={(e) => handleInlineTextChange('links', 'tiktok', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.tiktok.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">YouTube</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.youtube || STORE_CONFIGS[selectedStore].links.youtube}
                                        onChange={(e) => handleInlineTextChange('links', 'youtube', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.youtube.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Google Map</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.mapsUrl || STORE_CONFIGS[selectedStore].links.mapsUrl}
                                        onChange={(e) => handleInlineTextChange('links', 'mapsUrl', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">予約URL</label>
                                    <input
                                        type="text"
                                        value={textSettings.links?.reserveUrl || STORE_CONFIGS[selectedStore].links.reserveUrl}
                                        onChange={(e) => handleInlineTextChange('links', 'reserveUrl', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://www.tablecheck.com/..."
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">変更後「保存」ボタンを押すとサイトに反映されます</p>
                        </div>
                    </div>
                )}

                {/* Preview Canvas */}
                <div className={`flex-1 overflow-hidden relative flex justify-center ${storeTheme.canvas} p-8`}>
                    <div
                        className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden relative ${device === 'mobile'
                            ? 'w-[375px] h-[667px] rounded-3xl border-8 border-gray-800'
                            : 'w-full h-full rounded-lg border border-gray-300'
                            }`}
                    >
                        {/* 
                          LandingPage is rendered here. 
                          We use a transform to scale it down if needed, or just let it scroll.
                          For this demo, we'll just render it inside a scrolling container.
                        */}
                        <div className="w-full h-full overflow-y-auto scrollbar-hide">
                            <div>
                                {editPage === 'landing' ? (
                                    <LandingPage
                                        storeId={selectedStore}
                                        isEditing={true}
                                        onSectionSelect={setActiveSection}
                                        onBackgroundEdit={handleBackgroundEdit}
                                        onTextEdit={handleTextEdit}
                                        onTextChange={handleInlineTextChange}
                                        onTextReset={handleTextReset}
                                        onAddMenuItem={handleAddMenuItem}
                                        onDeleteMenuItem={handleDeleteMenuItem}
                                        onMenuImageEdit={handleMenuImageEdit}
                                        onReorderMenuItem={handleReorderMenuItem}
                                        onLayoutChange={handleLayoutChange}
                                        activeSection={activeSection}
                                        backgroundSettings={backgroundSettings}
                                        layoutSettings={layoutSettings}
                                        textSettings={textSettings}
                                    />
                                ) : (
                                    <TravelerPage
                                        storeId={selectedStore}
                                        isEditing={true}
                                        onSectionSelect={setActiveSection}
                                        onBackgroundEdit={handleBackgroundEdit}
                                        activeSection={activeSection || undefined}
                                        backgroundSettings={backgroundSettings}
                                        layoutSettings={layoutSettings}
                                        onLayoutChange={handleLayoutChange}
                                        textSettings={textSettings}
                                        onTextChange={handleInlineTextChange}
                                        onMenuImageEdit={handleMenuImageEdit}
                                        onAddMenuItem={handleAddMenuItem}
                                        onDeleteMenuItem={handleDeleteMenuItem}
                                        onReorderMenuItem={handleReorderMenuItem}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Image Asset Library Modal */}
            <ImageAssetLibrary
                isOpen={showAssetLibrary}
                onClose={() => setShowAssetLibrary(false)}
                onSelect={handleImageSelect}
                mediaType={activeBackgroundTab === 'video' ? 'video' : 'image'}
                storeId={selectedStore}
                category={editingMenuImage?.category || backgroundEditSection || 'general'}
            />
            {/* Image Editor Modal */}
            <ImageEditorModal
                isOpen={showImageEditor}
                onClose={() => setShowImageEditor(false)}
                imageUrl={editingImage}
                onSave={handleImageSave}
            />

            {/* Text Editor Modal */}
            <TextEditorModal
                isOpen={showTextEditor}
                onClose={() => setShowTextEditor(false)}
                onSave={handleTextSave}
                sectionId={textEditSection || ''}
                currentContent={textEditSection ? textSettings[textEditSection] || {} : {}}
                sectionLabel={textEditSection ? sections.find(s => s.id === textEditSection)?.label || textEditSection : ''}
            />

            {/* Add Section Modal */}
            <AddSectionModal
                isOpen={showAddSectionModal}
                onClose={() => setShowAddSectionModal(false)}
                onAdd={(category, type) => {
                    console.log('Add section:', category, type);
                    setShowAddSectionModal(false);
                }}
            />

            {/* Help Modal */}
            <HelpModal
                isOpen={showHelpModal}
                onClose={() => setShowHelpModal(false)}
            />
            {/* Marketing Tag Guide Modal */}
            <MarketingTagGuideModal
                isOpen={showMarketingTagGuide}
                onClose={() => setShowMarketingTagGuide(false)}
            />

        </div>
    );
}
