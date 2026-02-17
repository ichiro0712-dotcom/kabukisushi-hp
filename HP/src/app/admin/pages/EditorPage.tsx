import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Layout,
    Type,
    Palette,
    ShoppingBag,
    ChevronLeft,
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
    BarChart3
} from 'lucide-react';
import { LandingPage, DEFAULT_TEXT_SETTINGS, getDefaultTextSettings } from '../../pages/LandingPage';
import { type StoreId, STORE_CONFIGS, getStorageKeys } from '../../../utils/storeConfig';
import ImageAssetLibrary from '../components/editor/ImageAssetLibrary';
import ImageEditorModal from '../components/editor/ImageEditorModal';
import AddSectionModal from '../components/editor/AddSectionModal';
import TextEditorModal from '../components/editor/TextEditorModal';
import { TravelerPage } from '../../pages/TravelerPage';
import HelpModal from '../components/editor/HelpModal';

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
    const [activeTab, setActiveTab] = useState('sections');
    const [activeSection, setActiveSection] = useState<string | null>('home');
    const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
    const [backgroundEditSection, setBackgroundEditSection] = useState<string | null>(null);
    const [activeBackgroundTab, setActiveBackgroundTab] = useState<BackgroundType>('image');
    const [showAssetLibrary, setShowAssetLibrary] = useState(false);
    const [showImageEditor, setShowImageEditor] = useState(false);
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [editingImage, setEditingImage] = useState<string>('');
    const [showTextEditor, setShowTextEditor] = useState(false);
    const [textEditSection, setTextEditSection] = useState<string | null>(null);
    const [editingMenuImage, setEditingMenuImage] = useState<{
        sectionId: string;
        category: string;
        index: number;
    } | null>(null);
    const [editPage, setEditPage] = useState<'landing' | 'traveler'>('landing');
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreId>('honten');
    const selectedStoreRef = useRef<StoreId>(selectedStore);

    // Background settings state
    const [backgroundSettings, setBackgroundSettings] = useState<Record<string, BackgroundConfig>>({
        home: { type: 'image', value: '/assets/home_hero_new.jpg' },
        about: { type: 'color', value: '#ffffff', textTheme: 'dark' },
        gallery: { type: 'color', value: '#E8EAEC' },
        access: { type: 'image', value: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080' },
        menu: { type: 'color', value: '#f5f5f5' },
        affiliated: { type: 'image', value: '/assets/honten_hero.jpg' },
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

        // Restore state
        setBackgroundSettings(previousState.backgroundSettings);
        setLayoutSettings(previousState.layoutSettings);
        setTextSettings(previousState.textSettings);

        // Persist to localStorage
        const keys = getStorageKeys(selectedStore);
        localStorage.setItem(keys.backgroundSettings, JSON.stringify(previousState.backgroundSettings));
        localStorage.setItem(keys.layoutSettings, JSON.stringify(previousState.layoutSettings));
        localStorage.setItem(keys.textSettings, JSON.stringify(previousState.textSettings));
        window.dispatchEvent(new Event('storage'));
        updateLastSaved();
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

        // Restore state
        setBackgroundSettings(nextState.backgroundSettings);
        setLayoutSettings(nextState.layoutSettings);
        setTextSettings(nextState.textSettings);

        // Persist to localStorage
        const redoKeys = getStorageKeys(selectedStore);
        localStorage.setItem(redoKeys.backgroundSettings, JSON.stringify(nextState.backgroundSettings));
        localStorage.setItem(redoKeys.layoutSettings, JSON.stringify(nextState.layoutSettings));
        localStorage.setItem(redoKeys.textSettings, JSON.stringify(nextState.textSettings));
        window.dispatchEvent(new Event('storage'));
        updateLastSaved();
    };

    // Default background/layout settings for resetting
    const DEFAULT_BG: Record<string, BackgroundConfig> = {
        home: { type: 'image', value: '/assets/home_hero_new.jpg' },
        about: { type: 'color', value: '#ffffff', textTheme: 'dark' },
        gallery: { type: 'color', value: '#E8EAEC' },
        access: { type: 'image', value: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080' },
        menu: { type: 'color', value: '#f5f5f5' },
        affiliated: { type: 'image', value: '/assets/honten_hero.jpg' },
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

    const handleStoreSwitch = (newStoreId: StoreId) => {
        // Save current store data
        const currentKeys = getStorageKeys(selectedStore);
        localStorage.setItem(currentKeys.backgroundSettings, JSON.stringify(backgroundSettings));
        localStorage.setItem(currentKeys.layoutSettings, JSON.stringify(layoutSettings));
        localStorage.setItem(currentKeys.textSettings, JSON.stringify(textSettings));

        // Switch store
        setSelectedStore(newStoreId);
        selectedStoreRef.current = newStoreId;

        // Load new store data
        const newKeys = getStorageKeys(newStoreId);
        const newDefaults = getDefaultTextSettings(newStoreId);

        const savedBg = localStorage.getItem(newKeys.backgroundSettings);
        const savedLayout = localStorage.getItem(newKeys.layoutSettings);
        const savedText = localStorage.getItem(newKeys.textSettings);

        setBackgroundSettings(savedBg ? JSON.parse(savedBg) : { ...DEFAULT_BG });
        setLayoutSettings(savedLayout ? JSON.parse(savedLayout) : { ...DEFAULT_LAYOUT });
        setTextSettings(savedText ? JSON.parse(savedText) : newDefaults);

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
            const field = sectionId === 'gallery' ? `${category}_${index}` : `${category}_${index}_image`;
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

    const handlePublish = () => {
        handleSaveBackground();
        alert('公開しました！');
    };

    // Initialize from localStorage on mount
    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {
        const initKeys = getStorageKeys(selectedStore);
        const savedBackgrounds = localStorage.getItem(initKeys.backgroundSettings);
        const savedLayouts = localStorage.getItem(initKeys.layoutSettings);
        const savedText = localStorage.getItem(initKeys.textSettings);

        if (savedBackgrounds) {
            try { setBackgroundSettings(JSON.parse(savedBackgrounds)); } catch (e) { console.error(e); }
        }
        if (savedLayouts) {
            try { setLayoutSettings(JSON.parse(savedLayouts)); } catch (e) { console.error(e); }
        }
        if (savedText) {
            try {
                let parsed = JSON.parse(savedText);
                // Proactive correction for "reversed text" issue
                const storeDefaults = getDefaultTextSettings(selectedStore);
                if (parsed && typeof parsed === 'object') {
                    Object.keys(parsed).forEach(sectionId => {
                        const section = parsed[sectionId];
                        if (section && typeof section === 'object') {
                            Object.keys(section).forEach(field => {
                                const val = section[field];
                                if (typeof val === 'string' && (val.toLowerCase().includes('ihsus enilni') || val.toLowerCase().includes('ih su s enilni'))) {
                                    parsed[sectionId][field] = storeDefaults?.[sectionId]?.[field] || val;
                                }
                            });
                        }
                    });
                }
                const mergedText = { ...storeDefaults };
                if (parsed && typeof parsed === 'object') {
                    Object.keys(parsed).forEach(sectionId => {
                        const savedSection = parsed[sectionId];
                        const defaultSection = storeDefaults[sectionId] || {};

                        // Logic: If the saved section has ANY dynamic items (keys starting with image_ or category_),
                        // we treat the saved dynamic items as the source of truth for that section.
                        const isDynamicKey = (k: string) =>
                            (k.startsWith('image_') ||
                                ['nigiri_', 'makimono_', 'ippin_', 'nihonshu_', 'alcohol_', 'shochu_', 'other_'].some(p => k.startsWith(p))) &&
                            !k.includes('_content'); // _content fields are not considered dynamic items for this check

                        const hasSavedDynamic = Object.keys(savedSection).some(isDynamicKey);

                        if (hasSavedDynamic) {
                            // Start with default static fields
                            const sectionWithStaticDefaults: Record<string, string> = {};
                            Object.keys(defaultSection).forEach(k => {
                                if (!isDynamicKey(k)) { // Copy non-dynamic fields from default
                                    sectionWithStaticDefaults[k] = defaultSection[k];
                                }
                            });

                            // Merge with saved section, allowing saved dynamic items and _content fields to override
                            mergedText[sectionId] = { ...sectionWithStaticDefaults, ...savedSection };
                        } else {
                            // No dynamic items in saved section, merge default and saved
                            mergedText[sectionId] = { ...defaultSection, ...savedSection };
                        }
                    });
                }
                setTextSettings(mergedText);
            } catch (e) { console.error(e); }
        }
        setIsInitialized(true);
    }, []);

    // Central persistence effect - uses ref to avoid stale store on rapid switching
    useEffect(() => {
        if (!isInitialized) return;
        const persistKeys = getStorageKeys(selectedStoreRef.current);
        localStorage.setItem(persistKeys.backgroundSettings, JSON.stringify(backgroundSettings));
        localStorage.setItem(persistKeys.layoutSettings, JSON.stringify(layoutSettings));
        localStorage.setItem(persistKeys.textSettings, JSON.stringify(textSettings));
        window.dispatchEvent(new Event('storage'));
    }, [backgroundSettings, layoutSettings, textSettings, isInitialized]);

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

    return (
        <div className="flex h-screen bg-[#e0e0e0] overflow-hidden font-sans">

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
                                        <span className="10px] text-gray-500">その他</span>
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
            <div className="flex-1 flex flex-col min-w-0 bg-[#e0e0e0]">
                {/* Top Bar */}
                <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <select
                                value={selectedStore}
                                onChange={(e) => handleStoreSwitch(e.target.value as StoreId)}
                                className="text-xs font-bold text-gray-900 bg-transparent border border-gray-200 rounded px-2 py-1 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {(Object.values(STORE_CONFIGS) as Array<{ id: StoreId; displayName: string }>).map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.displayName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="h-4 w-px bg-gray-300" />
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setEditPage('landing')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${editPage === 'landing' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <FileText size={14} />
                                    日本語
                                </button>
                                <button
                                    onClick={() => setEditPage('traveler')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${editPage === 'traveler' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Globe size={14} />
                                    Foreign (English)
                                </button>
                            </div>

                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setDevice('desktop')}
                                    className={`p-1.5 rounded-md transition-all ${device === 'desktop' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                                >
                                    <Monitor size={18} />
                                </button>
                                <button
                                    onClick={() => setDevice('mobile')}
                                    className={`p-1.5 rounded-md transition-all ${device === 'mobile' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                                >
                                    <Smartphone size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/analytics')}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all shadow-md font-bold text-sm"
                            title="アクセス解析"
                        >
                            <BarChart3 size={18} />
                            Analytics
                        </button>

                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#deb55a] to-[#c9a347] text-[#1C1C1C] rounded-md hover:from-[#c9a347] to-[#b89236] transition-all shadow-md font-bold text-sm"
                            title="使い方ガイド"
                        >
                            <HelpCircle size={18} />
                            使い方
                        </button>

                        <div className="flex items-center gap-2 bg-gray-50 rounded-md p-1">
                            <button
                                onClick={undo}
                                disabled={past.length === 0}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${past.length > 0 ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'text-gray-300 cursor-not-allowed'}`}
                                title="元に戻す (Undo)"
                            >
                                <Undo size={16} />
                                <span className="text-[11px] font-bold">戻る</span>
                            </button>
                            <button
                                onClick={redo}
                                disabled={future.length === 0}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${future.length > 0 ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'text-gray-300 cursor-not-allowed'}`}
                                title="やり直す (Redo)"
                            >
                                <span className="text-[11px] font-bold">進む</span>
                                <Redo size={16} />
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                const btnKeys = getStorageKeys(selectedStore);
                                localStorage.setItem(btnKeys.backgroundSettings, JSON.stringify(backgroundSettings));
                                localStorage.setItem(btnKeys.layoutSettings, JSON.stringify(layoutSettings));
                                localStorage.setItem(btnKeys.textSettings, JSON.stringify(textSettings));
                                window.dispatchEvent(new Event('storage'));
                                updateLastSaved();
                                alert('保存しました!');
                            }}
                            className="px-5 py-1.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded shadow transition-colors"
                        >
                            保存
                        </button>

                        <span className="text-[10px] text-gray-400 italic">
                            最終保存: {lastSavedTime ? lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '未保存'}
                        </span>
                    </div>
                </div>

                {/* Preview Canvas */}
                <div className="flex-1 overflow-hidden relative flex justify-center bg-[#e0e0e0] p-8">
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
        </div>
    );
}
