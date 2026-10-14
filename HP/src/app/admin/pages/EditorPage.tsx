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
import { type StoreId, STORE_CONFIGS } from '../../../utils/storeConfig';
import { loadStoreSettings, saveAllSettings, type SettingsVersions } from '../../../lib/settingsService';
import { connectedProjectRef, isProductionDb, isLocalReadOnly } from '../../../lib/supabase';
import { mergeTextSettingsWithDefaults, PLACEHOLDER_IMAGE } from '../../../lib/textSettingsUtils';
import ImageAssetLibrary from '../components/editor/ImageAssetLibrary';
import ImageEditorModal from '../components/editor/ImageEditorModal';
import AddSectionModal from '../components/editor/AddSectionModal';
import TextEditorModal from '../components/editor/TextEditorModal';
import { TravelerPage } from '../../pages/TravelerPage';
import HelpModal from '../components/editor/HelpModal';
import MarketingTagGuideModal from '../components/editor/MarketingTagGuideModal';

type SettingsRow = 'background' | 'layout' | 'text';

/** キーの順番に左右されない比較用の文字列（DB の jsonb はキーの順番が入れ替わるため） */
function stableStringify(value: unknown): string {
    const sortDeep = (v: any): any => {
        if (Array.isArray(v)) return v.map(sortDeep);
        if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, sortDeep(v[k])]));
        return v;
    };
    return JSON.stringify(sortDeep(value ?? null));
}

/** 管理画面「店舗情報」の入力欄。打っている途中は保存せず、欄を離れた時（Enter でも）に確定する */
function PanelInput({ value, onCommit, placeholder }: { value: string; onCommit: (v: string) => void; placeholder?: string }) {
    const [draft, setDraft] = useState(value);
    const focusedRef = useRef(false);
    useEffect(() => { if (!focusedRef.current) setDraft(value); }, [value]);
    return (
        <input
            type="text"
            value={draft}
            onFocus={() => { focusedRef.current = true; }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
                focusedRef.current = false;
                const next = draft.trim();
                if (next !== value) onCommit(next);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
        />
    );
}

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
        /** 写真を選び始めた時の店。終わる前に店を切り替えたら反映しない */
        storeId: StoreId;
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

    // 最新の状態（非同期の処理や古い画面のクロージャから参照しても、今の店・今の中身を指すように）
    const latestBgRef = useRef(backgroundSettings);
    const latestLayoutRef = useRef(layoutSettings);
    const latestTextRef = useRef(textSettings);
    latestBgRef.current = backgroundSettings;
    latestLayoutRef.current = layoutSettings;
    latestTextRef.current = textSettings;

    const pushToHistory = () => {
        // 画面の古い描画のときの値ではなく、今の値を積む。写真のアップロードなど時間のかかる処理が
        // 店を切り替えた後に終わると、前の店の中身が履歴に入り「元に戻す」で今の店に上書きされていた
        const currentState = {
            backgroundSettings: latestBgRef.current,
            layoutSettings: latestLayoutRef.current,
            textSettings: { ...latestTextRef.current }
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
            backgroundSettings: latestBgRef.current,
            layoutSettings: latestLayoutRef.current,
            textSettings: { ...latestTextRef.current }
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
            backgroundSettings: latestBgRef.current,
            layoutSettings: latestLayoutRef.current,
            textSettings: { ...latestTextRef.current }
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

    /**
     * 入力中の欄があれば確定させる。欄の中身は「欄を離れて約0.1秒後」に渡る作りなので、
     * 保存ボタンや店の切り替えの前に確定させないと、打った内容を含まずに保存していた
     */
    const flushActiveEdit = async () => {
        const el = document.activeElement as HTMLElement | null;
        if (el && el.isContentEditable) el.blur();
        // ボタンを押した時点で欄はもう離れている（確定は0.1秒後）ので、いつも少し待ってから読む
        await new Promise(r => setTimeout(r, 180));
    };

    const [isSwitchingStore, setIsSwitchingStore] = useState(false);

    const handleStoreSwitch = async (newStoreId: StoreId) => {
        if (newStoreId === selectedStoreRef.current || isSwitchingStore) return;
        setIsSwitchingStore(true);
        try {
            await flushActiveEdit();
            // 待っている自動保存は止め、今の店を（変わっていれば）保存してから切り替える
            if (supabaseSaveTimerRef.current) {
                clearTimeout(supabaseSaveTimerRef.current);
                supabaseSaveTimerRef.current = undefined;
            }
            const saved = await persistRef.current(selectedStoreRef.current, latestBgRef.current, latestLayoutRef.current, latestTextRef.current);
            if (saved === 'conflict') {
                alert('他の端末で先に更新されているため、この画面の変更は保存できませんでした。\n店舗の切り替えを中止します。ページを再読み込みしてから編集し直してください。');
                return;
            }
            if (saved === 'error') {
                alert('保存に失敗したため、店舗の切り替えを中止しました。通信状況を確認してください。');
                return;
            }

            // Switch store
            const seq = ++loadSeqRef.current;
            setLoadState('loading');
            loadStateRef.current = 'loading';
            setSelectedStore(newStoreId);
            selectedStoreRef.current = newStoreId;
            clearRetry();
            setSupabaseSaveError(false);

            // Load new store data from Supabase（読めなければ編集させない。localStorage は使わない）
            const newDefaults = getDefaultTextSettings(newStoreId);
            const loaded = await loadStoreSettings(newStoreId);
            // 待っている間にさらに切り替えた場合、古い読み込み結果は使わない
            if (seq !== loadSeqRef.current) return;

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
            dbSnapshotRef.current = { background: loaded.backgroundSettings, layout: loaded.layoutSettings, text: loaded.textSettings };
            setLoadState('ready');
            loadStateRef.current = 'ready';

            // Clear undo/redo history
            setPast([]);
            setFuture([]);
            setLastSavedTime(null);
        } finally {
            setIsSwitchingStore(false);
        }
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
            const { sectionId, category, index, storeId } = editingMenuImage;
            if (storeId !== selectedStoreRef.current) {
                // アップロード中に店を切り替えた。別の店の同じ番号の品に入ってしまうので反映しない
                setEditingMenuImage(null);
                setShowAssetLibrary(false);
                alert('店舗が切り替わったため、この写真は反映しませんでした。もう一度選び直してください。');
                return;
            }
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
                        [`image_${nextIndex}`]: PLACEHOLDER_IMAGE,
                    }
                };
            } else {
                const existingIndices = Object.keys(currentSection)
                    .filter(key => key.startsWith(`${category}_`) && key.endsWith('_name'))
                    .map(key => parseInt(key.split('_')[1]))
                    .filter(num => !isNaN(num));
                nextIndex = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0;

                const nextSection: Record<string, string> = {
                    ...currentSection,
                    [`${category}_${nextIndex}_name`]: '新しいメニュー',
                    // 英語・韓国語・中国語は空で作る。以前は「New Menu Item／새 메뉴／新菜单」が入っていて、
                    // 直し忘れるとそのまま英語ページに出ていた（空なら英語は日本語名、韓中は行ごと出ない）
                    [`${category}_${nextIndex}_name_en`]: '',
                    [`${category}_${nextIndex}_name_ko`]: '',
                    [`${category}_${nextIndex}_name_zh`]: '',
                    [`${category}_${nextIndex}_price`]: '0',
                    [`${category}_${nextIndex}_image`]: PLACEHOLDER_IMAGE,
                    [`${category}_${nextIndex}_note`]: '',
                    [`${category}_${nextIndex}_soldOut`]: 'false',
                    // 追加した瞬間はまだ準備中。2秒後の自動保存で「新しいメニュー ¥0」が公開されないよう、
                    // 非表示で作る。目のアイコンで表示に切り替えるまで公開ページには出ない
                    [`${category}_${nextIndex}_hidden`]: 'true'
                };
                // 並び順があれば一番最後に足す（消した品の番号が残っていても、その位置に割り込まない）
                const orderKey = `${category}_order`;
                if (currentSection[orderKey]) {
                    const order = currentSection[orderKey].split(',').map(x => x.trim()).filter(x => x !== '' && x !== String(nextIndex));
                    nextSection[orderKey] = [...order, String(nextIndex)].join(',');
                }

                return {
                    ...prev,
                    [sectionId]: nextSection
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
            // 並び順からも番号を消す。残っていると、次に追加した品が消した品の位置に出ていた
            const orderKey = `${category}_order`;
            if (currentSection[orderKey]) {
                currentSection[orderKey] = currentSection[orderKey].split(',').map(x => x.trim()).filter(x => x !== '' && x !== String(index)).join(',');
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
        setEditingMenuImage({ sectionId, category, index, storeId: selectedStoreRef.current });
        setShowAssetLibrary(true);
    };

    const handleSaveBackground = () => {
        // 背景の変更は自動保存される。このボタンはパネルを閉じるだけ
        setShowBackgroundPanel(false);
    };

    /** 保存できない状態のとき、その理由をユーザー向けの文言で返す */
    const blockedSaveMessage = () => {
        if (isLocalReadOnly) {
            return 'ローカル環境（開発サーバー）では本番データを変更できません。\n本番の内容を編集する場合は kabuki-sushi.co.jp/admin から行ってください。';
        }
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
    const canSave = loadState === 'ready' && !isLocalReadOnly;
    /** 各行の updated_at。保存時に「読み込んだ時から変わっていないか」の照合に使う */
    const versionsRef = useRef<SettingsVersions>({});
    /** 最後にDBへ書いた（または読み込んだ）内容のシグネチャ。無変更保存を防ぐ */
    const lastPersistedRef = useRef<string>('');

    const signatureOf = (
        bg: Record<string, any>,
        layout: Record<string, any>,
        text: Record<string, Record<string, string>>
    ) => JSON.stringify({ bg, layout, text });

    /** 読み込みの通し番号。開いてすぐ・素早く店を切り替えたとき、古い読み込み結果を捨てるために使う */
    const loadSeqRef = useRef(0);
    /** DB に入っていると分かっている中身（行ごと）。保存が食い違ったとき、自分の書き込みのせいかを見分ける */
    const dbSnapshotRef = useRef<Record<SettingsRow, any>>({ background: null, layout: null, text: null });
    /** 通信エラーで終わった保存の中身。実はDBに届いていた場合の見分けに使う */
    const failedAttemptRef = useRef<Record<SettingsRow, any> | null>(null);

    // Initialize from Supabase on mount
    useEffect(() => {
        async function initSettings() {
            const seq = ++loadSeqRef.current;
            const storeId = selectedStoreRef.current;
            const storeDefaults = getDefaultTextSettings(storeId);
            const loaded = await loadStoreSettings(storeId);
            // 読み込み中に店を切り替えていたら、この結果は使わない（バッジと中身の店が食い違うのを防ぐ）
            if (seq !== loadSeqRef.current) return;

            if (!loaded.ok) {
                // 読み込めていない = 手元の状態が最新とは限らない。編集・保存を止める
                setLoadErrorMessage(loaded.errorMessage || '設定の読み込みに失敗しました');
                setLoadState('failed');
                loadStateRef.current = 'failed';
                return;
            }

            const nextBg = loaded.backgroundSettings || latestBgRef.current;
            const nextLayout = loaded.layoutSettings || latestLayoutRef.current;
            const nextText = loaded.textSettings
                ? mergeTextWithDefaults(loaded.textSettings, storeDefaults)
                : storeDefaults;

            setBackgroundSettings(nextBg);
            setLayoutSettings(nextLayout);
            setTextSettings(nextText);

            versionsRef.current = loaded.versions;
            lastPersistedRef.current = signatureOf(nextBg, nextLayout, nextText);
            dbSnapshotRef.current = { background: loaded.backgroundSettings, layout: loaded.layoutSettings, text: loaded.textSettings };
            // 読み込みが終わる前の画面（コード内の古い初期メニュー）は履歴に残さない。
            // 残っていると「元に戻す」で全メニューが古い初期値に戻り、2秒後にそのまま保存されていた
            setPast([]);
            setFuture([]);
            setLoadState('ready');
            loadStateRef.current = 'ready';
        }
        initSettings();
    }, []);

    // Central persistence effect - uses ref to avoid stale store on rapid switching
    const supabaseSaveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [supabaseSaveError, setSupabaseSaveError] = useState(false);

    // 非同期処理の中から最新の loadState を参照するための ref
    const loadStateRef = useRef<LoadState>(loadState);
    loadStateRef.current = loadState;

    type PersistResult = 'ok' | 'conflict' | 'error' | 'blocked' | 'readonly';

    /** 保存は1本ずつ順番に行う。同時に走ると、2本目が古い版のまま照合して「他の端末で先に更新」と誤判定していた */
    const saveChainRef = useRef<Promise<unknown>>(Promise.resolve());
    const savingCountRef = useRef(0);
    const [isSaving, setIsSaving] = useState(false);

    /** 保存に失敗したら、少しずつ間をあけて自動でやり直す */
    const RETRY_DELAYS_MS = [3000, 10000, 30000, 60000];
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const retryCountRef = useRef(0);
    const clearRetry = () => {
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = undefined;
        retryCountRef.current = 0;
    };
    const scheduleRetry = () => {
        if (retryTimerRef.current) return;
        const delay = RETRY_DELAYS_MS[Math.min(retryCountRef.current, RETRY_DELAYS_MS.length - 1)];
        retryCountRef.current += 1;
        retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = undefined;
            if (loadStateRef.current !== 'ready') return;
            persistRef.current(selectedStoreRef.current, latestBgRef.current, latestLayoutRef.current, latestTextRef.current);
        }, delay);
    };

    /** 1回分の保存。ガードと楽観ロックの後始末をここに集約する */
    const doPersist = async (
        storeId: StoreId,
        bg: Record<string, any>,
        layout: Record<string, any>,
        text: Record<string, Record<string, string>>
    ): Promise<PersistResult> => {
        if (isLocalReadOnly) return 'readonly';
        if (loadStateRef.current !== 'ready') return 'blocked';
        if (storeId !== selectedStoreRef.current) return 'blocked';
        // 読み込んだ（または最後に保存した）内容と同じなら書かない。店の切り替えや保存ボタンのたびに
        // 中身の同じ書き込みをしていたため、別の端末で開いている画面がうその競合になっていた
        if (signatureOf(bg, layout, text) === lastPersistedRef.current) return 'ok';

        const attempt: Record<SettingsRow, any> = { background: bg, layout, text };
        const noteWritten = (before: SettingsVersions, after: SettingsVersions) => {
            (['background', 'layout', 'text'] as SettingsRow[]).forEach(row => {
                if (after[row] && after[row] !== before[row]) dbSnapshotRef.current = { ...dbSnapshotRef.current, [row]: attempt[row] };
            });
        };

        let before = { ...versionsRef.current };
        let result = await saveAllSettings(storeId, bg, layout, text, versionsRef.current);
        noteWritten(before, result.versions);
        // 途中まで書けた行の版は、失敗しても覚えておく（次の保存の照合を正しくする）
        versionsRef.current = { ...versionsRef.current, ...result.versions };

        if (result.status === 'conflict') {
            // 食い違いが「自分の書き込み（応答が届かなかった分など）」だけなら、版を取り直してもう一度書く。
            // 他の人が直していた時だけ止める
            const fresh = await loadStoreSettings(storeId);
            if (fresh.ok && isOwnState(fresh, attempt)) {
                versionsRef.current = fresh.versions;
                dbSnapshotRef.current = { background: fresh.backgroundSettings, layout: fresh.layoutSettings, text: fresh.textSettings };
                before = { ...versionsRef.current };
                result = await saveAllSettings(storeId, bg, layout, text, versionsRef.current);
                noteWritten(before, result.versions);
                versionsRef.current = { ...versionsRef.current, ...result.versions };
            }
        }

        if (result.status === 'ok') {
            lastPersistedRef.current = signatureOf(bg, layout, text);
            failedAttemptRef.current = null;
            setSupabaseSaveError(false);
            clearRetry();
            updateLastSaved();
            return 'ok';
        }

        if (result.status === 'readonly') return 'readonly';

        if (result.status === 'conflict') {
            // 他端末が先に更新している。これ以上書き込ませない
            loadStateRef.current = 'stale';
            setLoadState('stale');
            setSupabaseSaveError(true);
            clearRetry();
            return 'conflict';
        }

        failedAttemptRef.current = attempt;
        setSupabaseSaveError(true);
        scheduleRetry();
        return 'error';
    };

    /** DB の今の中身が、自分の知っている中身・今回・前回失敗した保存の中身のどれかと行ごとに一致するか */
    const isOwnState = (fresh: { backgroundSettings: any; layoutSettings: any; textSettings: any }, attempt: Record<SettingsRow, any>) => {
        const now: Record<SettingsRow, any> = { background: fresh.backgroundSettings, layout: fresh.layoutSettings, text: fresh.textSettings };
        return (['background', 'layout', 'text'] as SettingsRow[]).every(row => {
            const v = stableStringify(now[row]);
            return v === stableStringify(dbSnapshotRef.current[row])
                || v === stableStringify(attempt[row])
                || (failedAttemptRef.current !== null && v === stableStringify(failedAttemptRef.current[row]));
        });
    };

    /** 保存の唯一の入口。1本ずつ順番に実行する */
    const persistToSupabase = (
        storeId: StoreId,
        bg: Record<string, any>,
        layout: Record<string, any>,
        text: Record<string, Record<string, string>>
    ): Promise<PersistResult> => {
        const run = async () => {
            savingCountRef.current += 1;
            setIsSaving(true);
            try {
                return await doPersist(storeId, bg, layout, text);
            } finally {
                savingCountRef.current -= 1;
                if (savingCountRef.current === 0) setIsSaving(false);
            }
        };
        const p = saveChainRef.current.then(run, run);
        saveChainRef.current = p.catch(() => undefined);
        return p;
    };
    /** タイマーや画面を閉じる時の処理から、いつも最新の保存処理を呼ぶための ref */
    const persistRef = useRef(persistToSupabase);
    persistRef.current = persistToSupabase;

    /** まだ保存していない変更があるか */
    const hasUnsavedChanges = () =>
        loadStateRef.current === 'ready'
        && signatureOf(latestBgRef.current, latestLayoutRef.current, latestTextRef.current) !== lastPersistedRef.current;

    useEffect(() => {
        if (loadState !== 'ready') return;

        // 読み込んだ内容から変わっていなければ保存しない（開いただけで上書きしない）
        if (signatureOf(backgroundSettings, layoutSettings, textSettings) === lastPersistedRef.current) return;

        // Debounced Supabase save (2 seconds)
        if (supabaseSaveTimerRef.current) clearTimeout(supabaseSaveTimerRef.current);
        supabaseSaveTimerRef.current = setTimeout(() => {
            supabaseSaveTimerRef.current = undefined;
            persistRef.current(selectedStoreRef.current, latestBgRef.current, latestLayoutRef.current, latestTextRef.current);
        }, 2000);

        return () => { if (supabaseSaveTimerRef.current) clearTimeout(supabaseSaveTimerRef.current); };
    }, [backgroundSettings, layoutSettings, textSettings, loadState]);

    // 画面内の移動（ログアウト等）で閉じる時、保存していない変更があれば保存する
    useEffect(() => {
        return () => {
            if (hasUnsavedChanges()) {
                persistRef.current(selectedStoreRef.current, latestBgRef.current, latestLayoutRef.current, latestTextRef.current);
            }
        };
    }, []);

    // タブを閉じる・再読み込みの前に、保存していない変更があれば引き止める（2秒待ちの間に閉じると消えていた）
    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            const unsaved = hasUnsavedChanges();
            if (!unsaved && savingCountRef.current === 0) return;
            if (unsaved && savingCountRef.current === 0) {
                // 引き止めている間に保存を始める（閉じるのをやめれば、そのまま保存が終わる）
                if (supabaseSaveTimerRef.current) {
                    clearTimeout(supabaseSaveTimerRef.current);
                    supabaseSaveTimerRef.current = undefined;
                }
                persistRef.current(selectedStoreRef.current, latestBgRef.current, latestLayoutRef.current, latestTextRef.current);
            }
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
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

            {/* ローカル開発サーバーから本番DBを見ている時。閲覧はできるが保存は全面停止 */}
            {isLocalReadOnly && (
                <div className="absolute inset-x-0 bottom-0 z-[100] bg-sky-600 text-white px-6 py-2 shadow-lg">
                    <div className="max-w-4xl mx-auto text-xs font-bold text-center">
                        🔒 ローカル環境（閲覧専用）— 本番データを表示していますが、変更は保存されません。
                        編集する場合は kabuki-sushi.co.jp/admin から行ってください。
                    </div>
                </div>
            )}

            {/* 本番以外のDBに繋がっている時の警告。ここでの編集は公開サイトに反映されない */}
            {!isProductionDb && (
                <div className="absolute inset-x-0 bottom-0 z-[100] bg-amber-500 text-amber-950 px-6 py-2 shadow-lg">
                    <div className="max-w-4xl mx-auto text-xs font-bold text-center">
                        ⚠️ 本番ではないデータベースに接続しています（{connectedProjectRef || '未設定'}）。
                        ここでの編集は kabuki-sushi.co.jp には反映されません。
                    </div>
                </div>
            )}

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
                            title="背景の変更は自動で保存されます"
                        >
                            閉じる
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
                            disabled={isSwitchingStore || loadState === 'loading'}
                            onChange={(e) => handleStoreSwitch(e.target.value as StoreId)}
                            className={`text-xs font-bold ${storeTheme.topBarText} bg-transparent border ${storeTheme.topBarBorder} rounded-md px-2 py-1.5 cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            {(Object.values(STORE_CONFIGS) as Array<{ id: StoreId; displayName: string; shortName: string }>).map((store) => (
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
                                // 打った直後に押しても、その内容を含めて保存する
                                await flushActiveEdit();
                                if (supabaseSaveTimerRef.current) {
                                    clearTimeout(supabaseSaveTimerRef.current);
                                    supabaseSaveTimerRef.current = undefined;
                                }
                                const result = await persistRef.current(selectedStoreRef.current, latestBgRef.current, latestLayoutRef.current, latestTextRef.current);
                                if (result === 'ok') { alert('保存しました!'); return; }
                                if (result === 'conflict') { alert('他の端末で先に更新されていたため、保存を中止しました。\nページを再読み込みしてから編集し直してください。'); return; }
                                if (result === 'blocked' || result === 'readonly') { alert(blockedSaveMessage()); return; }
                                alert('保存に失敗しました。自動でやり直しています。\n「保存できていません」の表示が消えない時は、通信状況を確認してください。');
                            }}
                            disabled={!canSave}
                            className={`px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-sm transition-colors ${canSave ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            保存
                        </button>
                        {supabaseSaveError && loadState === 'ready' && (
                            <span className="text-[11px] text-white bg-red-600 font-bold px-2 py-1 rounded whitespace-nowrap">保存できていません（自動でやり直しています）</span>
                        )}
                        {isSaving && !supabaseSaveError && (
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">保存中…</span>
                        )}
                        {lastSavedTime && (
                            <span className="text-[10px] text-gray-400">{lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <div className="h-5 w-px bg-gray-200" />
                        <button
                            onClick={() => window.open(`https://kabuki-sushi.co.jp${editPage === 'traveler' ? STORE_CONFIGS[selectedStore].travelerPath : STORE_CONFIGS[selectedStore].basePath}`, '_blank')}
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
                                {([
                                    ['phoneDisplay', '電話番号（表示用）', '03-6457-6612'],
                                    ['phone', '電話番号（発信用）', '0364576612'],
                                    ['line', 'LINE', 'https://line.me/...'],
                                    ['instagram', 'Instagram', 'https://www.instagram.com/...'],
                                    ['facebook', 'Facebook', 'https://www.facebook.com/...'],
                                    ['tiktok', 'TikTok', 'https://www.tiktok.com/...'],
                                    ['youtube', 'YouTube', 'https://www.youtube.com/...'],
                                    ['mapsUrl', 'Google Map', 'https://maps.app.goo.gl/...'],
                                    ['reserveUrl', '予約URL', 'https://www.tablecheck.com/...'],
                                ] as const).map(([key, label, ph]) => (
                                    <div key={`${selectedStore}-${key}`}>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
                                        <PanelInput
                                            value={textSettings.links?.[key] || STORE_CONFIGS[selectedStore].links[key]}
                                            onCommit={(v) => handleInlineTextChange('links', key, v)}
                                            placeholder={ph}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3">入力して欄を離れると、約2秒後に自動で保存され、日本語・英語ページの両方に反映されます</p>
                        </div>
                    </div>
                )}

                {/* Preview Canvas */}
                <div className={`flex-1 overflow-hidden relative flex justify-center ${storeTheme.canvas} p-8`}>
                    {/* 読み込みが終わるまでは触れない。以前は読み込み中もコード内の古い初期メニューが表示されて触れたため、
                        そこで触った内容が「元に戻す」の履歴に残り、全メニューが古い初期値に戻る事故の元になっていた */}
                    {(loadState === 'loading' || isSwitchingStore) && (
                        <div data-editor-loading className="absolute inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-sm font-bold text-gray-600">読み込み中…</div>
                        </div>
                    )}
                    {/* 読み込めない・他の端末で先に更新された時は、この画面では編集させない（直しても保存されないため） */}
                    {(loadState === 'failed' || loadState === 'stale') && (
                        <div className="absolute inset-0 z-[60] bg-black/40 flex items-center justify-center">
                            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm text-center space-y-3">
                                <div className="text-sm font-bold text-gray-800">
                                    {loadState === 'failed' ? '設定を読み込めませんでした' : '他の端末で先に更新されました'}
                                </div>
                                <div className="text-xs text-gray-500 leading-relaxed">
                                    {loadState === 'failed'
                                        ? 'この状態では保存できません。ページを再読み込みしてください。'
                                        : '相手の変更を消さないよう、この画面からの保存を止めています。再読み込みすると最新の内容で編集できます。'}
                                </div>
                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-bold">
                                    再読み込み
                                </button>
                            </div>
                        </div>
                    )}
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
                onClose={() => { setShowAssetLibrary(false); setEditingMenuImage(null); }}
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
