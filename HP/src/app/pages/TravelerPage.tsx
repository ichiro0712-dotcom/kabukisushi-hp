import { useState, useEffect } from 'react';
import { Menu, X, MapPin, Phone, Clock, Image as ImageIcon, Layout, Settings2, ChevronDown, ArrowUpToLine, ArrowDownToLine, AlignCenterVertical, RotateCcw, Instagram, Music2, Facebook, Youtube, Link as LinkIcon, Globe, EyeOff, Ban, Plus } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { InlineEditableText, MenuItemControls, SectionToolbar, DEFAULT_TEXT_SETTINGS, getDefaultTextSettings } from './LandingPage';
import type { BackgroundConfig, LayoutConfig } from '../admin/pages/EditorPage';
import { type StoreId, getStorageKeys, STORE_CONFIGS } from '../../utils/storeConfig';
import { loadStoreSettings } from '../../lib/settingsService';
import { mergeTextSettingsWithDefaults, migrateBackgroundSettings } from '../../lib/textSettingsUtils';

interface TravelerPageProps {
    storeId?: StoreId;
    isEditing?: boolean;
    onSectionSelect?: (id: string | undefined) => void;
    onBackgroundEdit?: (id: string) => void;
    activeSection?: string | undefined;
    backgroundSettings?: Record<string, BackgroundConfig>;
    layoutSettings?: Record<string, LayoutConfig>;
    onLayoutChange?: (sectionId: string, config: Partial<LayoutConfig>) => void;
    textSettings?: Record<string, Record<string, string>>;
    onTextChange?: (sectionId: string, field: string, value: string) => void;
    onMenuImageEdit?: (sectionId: string, category: string, index: number) => void;
    onAddMenuItem?: (sectionId: string, category: string) => void;
    onDeleteMenuItem?: (sectionId: string, category: string, index: number) => void;
}

const DEFAULT_BACKGROUND_SETTINGS: Record<string, BackgroundConfig> = {
    home: { type: 'image', value: '/assets/home_hero_new.webp' },
    about: { type: 'color', value: '#ffffff', textTheme: 'dark' },
    gallery: { type: 'color', value: '#E8EAEC' },
    access: { type: 'image', value: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080' },
    menu: { type: 'color', value: '#d4183d', textTheme: 'light' },
    affiliated: { type: 'image', value: '/assets/honten_hero.webp' },
    footer: { type: 'color', value: '#1C1C1C' }
};

const DEFAULT_LAYOUT_SETTINGS: Record<string, LayoutConfig> = {
    home: { width: 'full', alignment: 'center', fullHeight: true, topSpace: false, bottomSpace: false },
    about: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
    gallery: { width: 'wide', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
    access: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
    menu: { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
    affiliated: { width: 'full', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true },
    footer: { width: 'wide', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true }
};

export function TravelerPage({
    storeId = 'honten',
    isEditing = false,
    onSectionSelect,
    onBackgroundEdit,
    activeSection,
    backgroundSettings: propBackgroundSettings,
    layoutSettings: propLayoutSettings,
    onLayoutChange,
    textSettings: propTextSettings,
    onTextChange,
    onMenuImageEdit,
    onAddMenuItem,
    onDeleteMenuItem
}: TravelerPageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const links = STORE_CONFIGS[storeId].links;
    const [localBackgroundSettings, setLocalBackgroundSettings] = useState<Record<string, BackgroundConfig> | undefined>(undefined);
    const [localLayoutSettings, setLocalLayoutSettings] = useState<Record<string, LayoutConfig> | undefined>(undefined);
    const [localTextSettings, setLocalTextSettings] = useState<Record<string, Record<string, string>> | undefined>(undefined);
    const [isSettingsLoaded, setIsSettingsLoaded] = useState(isEditing);

    const backgroundSettings = propBackgroundSettings || (localBackgroundSettings ? { ...DEFAULT_BACKGROUND_SETTINGS, ...localBackgroundSettings } : DEFAULT_BACKGROUND_SETTINGS);
    const layoutSettings = propLayoutSettings || (localLayoutSettings ? { ...DEFAULT_LAYOUT_SETTINGS, ...localLayoutSettings } : DEFAULT_LAYOUT_SETTINGS);
    const textSettings = propTextSettings || (() => {
        const defaults = getDefaultTextSettings(storeId);
        return localTextSettings ? mergeTextSettingsWithDefaults(localTextSettings, defaults) : defaults;
    })();

    useEffect(() => {
        if (!isEditing) {
            let cancelled = false;
            async function loadSettings() {
                const supabaseData = await loadStoreSettings(storeId);
                if (cancelled) return;
                const hasSupabaseData = supabaseData.backgroundSettings || supabaseData.layoutSettings || supabaseData.textSettings;
                if (hasSupabaseData) {
                    if (supabaseData.backgroundSettings) setLocalBackgroundSettings(migrateBackgroundSettings(supabaseData.backgroundSettings));
                    if (supabaseData.layoutSettings) setLocalLayoutSettings(supabaseData.layoutSettings);
                    if (supabaseData.textSettings) setLocalTextSettings(supabaseData.textSettings);
                    setIsSettingsLoaded(true);
                    return;
                }
                // Fallback to localStorage
                const keys = getStorageKeys(storeId);
                const savedBackgrounds = localStorage.getItem(keys.backgroundSettings);
                const savedLayouts = localStorage.getItem(keys.layoutSettings);
                const savedText = localStorage.getItem(keys.textSettings);
                if (savedBackgrounds) try { setLocalBackgroundSettings(migrateBackgroundSettings(JSON.parse(savedBackgrounds))); } catch (e) { }
                if (savedLayouts) try { setLocalLayoutSettings(JSON.parse(savedLayouts)); } catch (e) { }
                if (savedText) try { setLocalTextSettings(JSON.parse(savedText)); } catch (e) { }
                setIsSettingsLoaded(true);
            }
            loadSettings();
            return () => { cancelled = true; };
        }
    }, [isEditing, storeId]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const getBackgroundStyle = (sectionId: string) => {
        const config = backgroundSettings?.[sectionId];
        if (!config) return {};
        if (config.type === 'color') return { backgroundColor: config.value, color: config.textTheme === 'dark' ? '#000000' : '#ffffff' };
        if (config.type === 'image') return { backgroundImage: `url('${config.value}')`, backgroundSize: 'cover', backgroundPosition: 'center', color: config.textTheme === 'dark' ? '#000000' : '#ffffff' };
        return {};
    };

    const getLayoutStyle = (sectionId: string) => {
        const config = layoutSettings?.[sectionId];
        if (!config) return 'w-full';
        let classes = config.fullHeight ? ' min-h-screen' : '';
        classes += config.topSpace ? ' pt-20' : ' pt-0';
        classes += config.bottomSpace ? ' pb-20' : ' pb-0';
        classes += config.alignment === 'top' ? ' justify-start' : config.alignment === 'bottom' ? ' justify-end' : ' justify-center';
        return classes + ' w-full';
    };

    const getContainerWidthClass = (sectionId: string) => {
        const config = layoutSettings?.[sectionId];
        const width = config?.width || 'normal';
        switch (width) {
            case 'auto': return 'container mx-auto px-4';
            case 'full': return 'w-full px-4';
            case 'wide': return 'max-w-7xl w-full px-4';
            case 'small': return 'max-w-2xl w-full px-4';
            default: return 'max-w-4xl w-full px-4';
        }
    };

    // Prevent FOUC: don't render until settings are loaded from Supabase
    if (!isSettingsLoaded) {
        return <div className="min-h-screen bg-[#1C1C1C]" />;
    }

    return (
        <div className="min-h-screen bg-[#1C1C1C]">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full bg-[#1C1C1C]/95 backdrop-blur-sm z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => !isEditing && scrollToSection('home')}
                                className="group transition-all duration-300 hover:opacity-80"
                            >
                                <div className="flex items-baseline gap-1">
                                    <span style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }} className="text-xl tracking-wider text-[#fcebc5] font-medium">
                                        {textSettings.home?.title || 'KABUKI寿司'}
                                    </span>
                                    <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm tracking-widest text-[#deb55a]/80 font-light">
                                        {textSettings.home?.subtitle || '本店'}
                                    </span>
                                </div>
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6">
                            {/* Social Icons */}
                            <div className="flex items-center gap-3 mr-2">
                                <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Instagram size={14} /></a>
                                <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Facebook size={14} /></a>
                                <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Music2 size={14} /></a>
                                <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Youtube size={14} /></a>
                            </div>

                            <span className="text-[#e8eaec]/20">|</span>

                            {/* Phone Button */}
                            <a href={`tel:${links.phone}`} className="flex items-center gap-1 text-[#e8eaec]/70 hover:text-[#deb55a] transition-colors">
                                <Phone size={12} />
                                <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] tracking-wide">{links.phoneDisplay}</span>
                            </a>

                            <span className="text-[#e8eaec]/20">|</span>

                            <button onClick={() => scrollToSection('about')} style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] tracking-[0.15em] text-[#e8eaec]/70 hover:text-[#deb55a] transition-all duration-300 uppercase">About</button>
                            <button onClick={() => scrollToSection('gallery')} style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] tracking-[0.15em] text-[#e8eaec]/70 hover:text-[#deb55a] transition-all duration-300 uppercase">Gallery</button>
                            <button onClick={() => scrollToSection('menu')} style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] tracking-[0.15em] text-[#e8eaec]/70 hover:text-[#deb55a] transition-all duration-300 uppercase">Menu</button>
                            <button onClick={() => scrollToSection('access')} style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] tracking-[0.15em] text-[#e8eaec]/70 hover:text-[#deb55a] transition-all duration-300 uppercase">Access</button>

                            {/* Reserve Button */}
                            <a
                                href={links.reserveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                className="ml-2 px-4 py-1.5 text-[10px] tracking-[0.1em] text-[#1C1C1C] bg-[#deb55a] hover:bg-[#fcebc5] transition-all duration-300 uppercase font-medium"
                            >
                                Reserve
                            </a>

                            <span className="text-[#e8eaec]/20">|</span>

                            <a href={STORE_CONFIGS[storeId].basePath} style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] tracking-[0.15em] text-[#fcebc5] hover:text-[#deb55a] transition-all duration-300 uppercase">
                                日本語
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden text-[#e8eaec] p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#1C1C1C]/95 backdrop-blur-md border-t border-white/5">
                        <div className="px-6 py-6 space-y-4">
                            {/* Phone Button - Mobile */}
                            <a href={`tel:${links.phone}`} className="flex items-center gap-2 text-[#e8eaec]/80 hover:text-[#deb55a] transition-colors py-2">
                                <Phone size={16} />
                                <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm tracking-wide">{links.phoneDisplay}</span>
                            </a>

                            <div className="border-t border-white/10 my-3"></div>

                            <button onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }} style={{ fontFamily: "'Inter', sans-serif" }} className="block w-full text-left text-xs tracking-[0.15em] text-[#e8eaec]/80 hover:text-[#deb55a] transition-colors py-2 uppercase">About</button>
                            <button onClick={() => { scrollToSection('gallery'); setIsMobileMenuOpen(false); }} style={{ fontFamily: "'Inter', sans-serif" }} className="block w-full text-left text-xs tracking-[0.15em] text-[#e8eaec]/80 hover:text-[#deb55a] transition-colors py-2 uppercase">Gallery</button>
                            <button onClick={() => { scrollToSection('menu'); setIsMobileMenuOpen(false); }} style={{ fontFamily: "'Inter', sans-serif" }} className="block w-full text-left text-xs tracking-[0.15em] text-[#e8eaec]/80 hover:text-[#deb55a] transition-colors py-2 uppercase">Menu</button>
                            <button onClick={() => { scrollToSection('access'); setIsMobileMenuOpen(false); }} style={{ fontFamily: "'Inter', sans-serif" }} className="block w-full text-left text-xs tracking-[0.15em] text-[#e8eaec]/80 hover:text-[#deb55a] transition-colors py-2 uppercase">Access</button>

                            {/* Social Icons - Mobile */}
                            <div className="flex items-center gap-4 py-3">
                                <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Instagram size={18} /></a>
                                <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Facebook size={18} /></a>
                                <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Music2 size={18} /></a>
                                <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Youtube size={18} /></a>
                            </div>

                            <a
                                href={links.reserveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "'Inter', sans-serif" }}
                                className="block w-full text-center py-3 text-xs tracking-[0.1em] text-[#1C1C1C] bg-[#deb55a] hover:bg-[#fcebc5] transition-all duration-300 uppercase font-medium mt-4"
                            >
                                Reserve
                            </a>

                            <a href={STORE_CONFIGS[storeId].basePath} style={{ fontFamily: "'Inter', sans-serif" }} className="block w-full text-center py-2 text-xs tracking-[0.15em] text-[#fcebc5] hover:text-[#deb55a] transition-all duration-300 uppercase mt-2">
                                日本語
                            </a>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section
                id="home"
                className={`flex flex-col relative bg-cover bg-center ${getLayoutStyle('home')}`}
                style={getBackgroundStyle('home')}
            >
                {isEditing && (
                    <SectionToolbar
                        sectionId="home"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange || (() => { })}
                        onSectionSelect={(id) => onSectionSelect?.(id)}
                        onBackgroundEdit={onBackgroundEdit || (() => { })}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
                <div className={`relative z-10 text-center mx-auto ${getContainerWidthClass('home')}`}>
                    {/* Logo */}
                    <div className="mb-12 flex justify-center">
                        <ImageWithFallback
                            src="/assets/logo.webp"
                            alt={`${textSettings.home?.title || 'KABUKI寿司'} ${textSettings.home?.subtitle || '本店'} ロゴ`}
                            className="w-auto h-28 md:h-36 object-contain"
                        />
                    </div>

                    {/* Tagline */}
                    <p style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }} className="text-sm md:text-base text-[#e8eaec]/80 mb-12 max-w-md mx-auto leading-relaxed">
                        <InlineEditableText
                            value={textSettings.home?.tagline_en || 'Authentic Edo-mae sushi in Shinjuku'}
                            onChange={(val) => onTextChange?.('home', 'tagline_en', val)}
                            isEditing={isEditing}
                        />
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center justify-center gap-6 mb-8">
                        <button onClick={() => scrollToSection('menu')} style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs tracking-[0.15em] text-[#e8eaec]/90 hover:text-[#deb55a] transition-all duration-300 uppercase border-b border-transparent hover:border-[#deb55a] pb-1">Menu</button>
                        <span className="text-[#e8eaec]/30">|</span>
                        <a
                            href={links.reserveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            className="text-xs tracking-[0.15em] text-[#deb55a] hover:text-[#fcebc5] transition-all duration-300 uppercase border-b border-[#deb55a] hover:border-[#fcebc5] pb-1"
                        >
                            Reserve
                        </a>
                        <span className="text-[#e8eaec]/30">|</span>
                        <a
                            href={links.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            className="text-xs tracking-[0.15em] text-[#e8eaec]/90 hover:text-[#deb55a] transition-all duration-300 uppercase border-b border-transparent hover:border-[#deb55a] pb-1"
                        >
                            Access
                        </a>
                    </div>

                    {/* Language Switcher */}
                    <a
                        href={STORE_CONFIGS[storeId].basePath}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="mt-8 inline-flex items-center gap-2 px-6 py-2 border border-[#e8eaec]/40 text-xs tracking-[0.1em] text-[#e8eaec]/80 hover:text-[#deb55a] hover:border-[#deb55a] transition-all duration-300"
                    >
                        <Globe size={14} />
                        <span>日本語</span>
                    </a>

                    {/* Social Icons */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Instagram size={14} /></a>
                        <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Facebook size={14} /></a>
                        <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Music2 size={14} /></a>
                        <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="text-[#e8eaec]/60 hover:text-[#deb55a] transition-colors"><Youtube size={14} /></a>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section
                id="about"
                className={`flex flex-col relative bg-white py-20 ${getLayoutStyle('about')}`}
                style={getBackgroundStyle('about')}
            >
                {isEditing && (
                    <SectionToolbar
                        sectionId="about"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange || (() => { })}
                        onSectionSelect={(id) => onSectionSelect?.(id)}
                        onBackgroundEdit={onBackgroundEdit || (() => { })}
                    />
                )}
                <div className={`mx-auto ${getContainerWidthClass('about')}`}>
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-12 uppercase"><InlineEditableText value={textSettings.about?.title_en || textSettings.about?.title || 'ABOUT US'} onChange={(val) => onTextChange?.('about', 'title_en', val)} isEditing={isEditing} /></h2>
                    <div className="flex flex-col items-center gap-12">
                        <div className="w-full max-w-4xl relative group">
                            <ImageWithFallback
                                src={textSettings.about?.content_image || '/assets/about_content_new.webp'}
                                alt="Restaurant Interior"
                                className="rounded-lg shadow-xl w-full h-auto"
                            />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={(e) => { e.stopPropagation(); onMenuImageEdit?.('about', 'content_image', 0); }} className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg"><ImageIcon size={20} /></button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-6 text-center max-w-3xl mx-auto text-lg leading-relaxed" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}>
                            <p><InlineEditableText value={textSettings.about?.content_en || 'The up-and-coming manager, who learnt Edo-mae techniques at a famous restaurant that originated in the region and is part of the Ryukyu stream, has coloured Edo-mae sushi with the present in the hope that you will enjoy authentic Edo-mae sushi without any pretensions. Enjoy a dining experience that is both authentic and innovative.'} onChange={(val) => onTextChange?.('about', 'content_en', val)} isEditing={isEditing} multiline={true} /></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="py-20 bg-[#E8EAEC] relative">
                {isEditing && (
                    <SectionToolbar
                        sectionId="gallery"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange || (() => { })}
                        onSectionSelect={(id) => onSectionSelect?.(id)}
                        onBackgroundEdit={onBackgroundEdit || (() => { })}
                    />
                )}
                <div className="max-w-7xl mx-auto px-4">
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-12 text-[#1C1C1C] uppercase"><InlineEditableText value={textSettings.gallery?.title_en || textSettings.gallery?.title || 'GALLERY'} onChange={(val) => onTextChange?.('gallery', 'title_en', val)} isEditing={isEditing} /></h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {(() => {
                            const galleryIndices = Object.keys(textSettings.gallery || {})
                                .filter(key => key.startsWith('image_') && !key.includes('_order'))
                                .map(key => parseInt(key.split('_')[1]))
                                .filter(num => !isNaN(num))
                                .sort((a, b) => a - b);
                            return galleryIndices.map(index => (
                                <div key={index} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow relative group">
                                    <ImageWithFallback src={textSettings.gallery![`image_${index}`]} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={(e) => { e.stopPropagation(); onMenuImageEdit?.('gallery', 'image', index); }} className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg"><ImageIcon size={20} /></button>
                                        </div>
                                    )}
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </section>

            {/* SUSHI-COURSE Section */}
            <section
                id="menu"
                className="bg-[#1C1C1C] text-white"
            >
                <div className={`mx-auto ${getContainerWidthClass('menu')}`}>
                    <div className="py-8 px-4 -mx-4 bg-[#1C1C1C]">
                        <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-4 text-[#e8eaec]"><InlineEditableText value={textSettings.menu?.title_en || textSettings.menu?.title || 'Menu'} onChange={(val) => onTextChange?.('menu', 'title_en', val)} isEditing={isEditing} /></h2>
                    </div>
                    {/* Course Section */}
                    <div className="py-16 px-4 -mx-4 bg-[#1C1C1C]">
                        <div className="text-center text-xl mb-4 text-[#deb55a]" style={{ fontFamily: "'Bad Script', cursive" }}><InlineEditableText value={textSettings.menu?.subtitle_en || textSettings.menu?.subtitle || 'Course'} onChange={(val) => onTextChange?.('menu', 'subtitle_en', val)} isEditing={isEditing} /></div>
                        <div className="text-center text-[#e8eaec]/70 mb-12"><InlineEditableText value={textSettings.menu?.description_en || 'Please select from our recommended courses'} onChange={(val) => onTextChange?.('menu', 'description_en', val)} isEditing={isEditing} /></div>

                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            <div className="group border border-[#e8eaec]/20 p-6 hover:border-[#deb55a]/50 transition-all duration-300">
                                <div className="text-[#deb55a]/60 text-xs tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "'Inter', sans-serif" }}><InlineEditableText value={textSettings.menu?.course_0_label_en || textSettings.menu?.course_0_label || 'Standard'} onChange={(val) => onTextChange?.('menu', 'course_0_label_en', val)} isEditing={isEditing} /></div>
                                <h3 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }} className="text-xl font-medium mb-3 text-[#e8eaec]"><InlineEditableText value={textSettings.menu?.course_0_name_en || 'OMAKASE 8 pieces'} onChange={(val) => onTextChange?.('menu', 'course_0_name_en', val)} isEditing={isEditing} /></h3>
                                <p className="text-2xl text-[#deb55a] font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}><InlineEditableText value={textSettings.menu?.course_0_price || '¥4,980'} onChange={(val) => onTextChange?.('menu', 'course_0_price', val)} isEditing={isEditing} /></p>
                                <p className="text-[#e8eaec]/60 text-sm leading-relaxed"><InlineEditableText value={textSettings.menu?.course_0_desc_en || '8 recommended nigiri, 1 Appetizer, Miso soup'} onChange={(val) => onTextChange?.('menu', 'course_0_desc_en', val)} isEditing={isEditing} /></p>
                            </div>
                            <div className="group border border-[#e8eaec]/20 p-6 hover:border-[#deb55a]/50 transition-all duration-300">
                                <div className="text-[#deb55a]/60 text-xs tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "'Inter', sans-serif" }}><InlineEditableText value={textSettings.menu?.course_1_label_en || textSettings.menu?.course_1_label || 'Premium'} onChange={(val) => onTextChange?.('menu', 'course_1_label_en', val)} isEditing={isEditing} /></div>
                                <h3 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }} className="text-xl font-medium mb-3 text-[#e8eaec]"><InlineEditableText value={textSettings.menu?.course_1_name_en || 'SPECIAL OMAKASE 8 pieces'} onChange={(val) => onTextChange?.('menu', 'course_1_name_en', val)} isEditing={isEditing} /></h3>
                                <p className="text-2xl text-[#deb55a] font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}><InlineEditableText value={textSettings.menu?.course_1_price || '¥6,980'} onChange={(val) => onTextChange?.('menu', 'course_1_price', val)} isEditing={isEditing} /></p>
                                <p className="text-[#e8eaec]/60 text-sm leading-relaxed"><InlineEditableText value={textSettings.menu?.course_1_desc_en || '8 special recommended nigiri, 1 Appetizer, Miso soup'} onChange={(val) => onTextChange?.('menu', 'course_1_desc_en', val)} isEditing={isEditing} /></p>
                            </div>
                            <div className="group border border-[#deb55a]/40 p-6 hover:border-[#deb55a] transition-all duration-300 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#deb55a] text-[#1C1C1C] text-[10px] tracking-[0.15em] uppercase px-3 py-1" style={{ fontFamily: "'Inter', sans-serif" }}><InlineEditableText value={textSettings.menu?.course_2_badge_en || textSettings.menu?.course_2_badge || 'Deluxe'} onChange={(val) => onTextChange?.('menu', 'course_2_badge_en', val)} isEditing={isEditing} /></div>
                                <div className="text-[#deb55a]/60 text-xs tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "'Inter', sans-serif" }}><InlineEditableText value={textSettings.menu?.course_2_label_en || textSettings.menu?.course_2_label || 'Special'} onChange={(val) => onTextChange?.('menu', 'course_2_label_en', val)} isEditing={isEditing} /></div>
                                <h3 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif" }} className="text-xl font-medium mb-3 text-[#e8eaec]"><InlineEditableText value={textSettings.menu?.course_2_name_en || 'SPECIAL OMAKASE 10 pieces'} onChange={(val) => onTextChange?.('menu', 'course_2_name_en', val)} isEditing={isEditing} /></h3>
                                <p className="text-2xl text-[#deb55a] font-bold mb-4" style={{ fontFamily: "'Inter', sans-serif" }}><InlineEditableText value={textSettings.menu?.course_2_price || '¥9,900'} onChange={(val) => onTextChange?.('menu', 'course_2_price', val)} isEditing={isEditing} /></p>
                                <p className="text-[#e8eaec]/60 text-sm leading-relaxed"><InlineEditableText value={textSettings.menu?.course_2_desc_en || '10 special recommended nigiri, 3 Pieces of Sashimi, 1 Appetizer, Miso soup'} onChange={(val) => onTextChange?.('menu', 'course_2_desc_en', val)} isEditing={isEditing} /></p>
                            </div>
                        </div>

                        <div className="text-center space-y-1 text-xs text-[#e8eaec]/50">
                            <p><InlineEditableText value={textSettings.menu?.tax_note_en || '※All listed prices are excluding tax'} onChange={(val) => onTextChange?.('menu', 'tax_note_en', val)} isEditing={isEditing} /></p>
                            <p><InlineEditableText value={textSettings.menu?.tax_note_multi || '표시가격은 세금을 뺀 가격 입니다 / 表示的价格是不含税的'} onChange={(val) => onTextChange?.('menu', 'tax_note_multi', val)} isEditing={isEditing} /></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Special Menu Section - NIGIRI, MAKIMONO, IPPIN */}
            <section className="py-20 bg-[#1C1C1C] text-white relative">
                {isEditing && (
                    <SectionToolbar
                        sectionId="menu"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange || (() => { })}
                        onSectionSelect={(id) => onSectionSelect?.(id)}
                        onBackgroundEdit={onBackgroundEdit || (() => { })}
                    />
                )}
                <div className={`mx-auto ${getContainerWidthClass('menu')}`}>
                    <div className="py-16 px-4 -mx-4 bg-[#1C1C1C]">
                        <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-8 text-[#e8eaec]"><InlineEditableText value={textSettings.menu?.nigiri_title_en || textSettings.menu?.nigiri_title || 'NIGIRI'} onChange={(val) => onTextChange?.('menu', 'nigiri_title_en', val)} isEditing={isEditing} /></h3>
                        <div className="text-center text-xl mb-8 text-[#deb55a]" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}><InlineEditableText value={textSettings.menu?.nigiri_subtitle_en || textSettings.menu?.nigiri_subtitle || 'Fish in Season'} onChange={(val) => onTextChange?.('menu', 'nigiri_subtitle_en', val)} isEditing={isEditing} /></div>
                        <p className="text-center text-[#e8eaec]/70 mb-8"><InlineEditableText value={textSettings.menu?.nigiri_description_en || 'Kindly order at least 5 items per person'} onChange={(val) => onTextChange?.('menu', 'nigiri_description_en', val)} isEditing={isEditing} /></p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-24">
                            {(() => {
                                const section = textSettings.menu || {};
                                const nigiriIndices = Object.keys(section)
                                    .filter(key => key.startsWith('nigiri_') && key.endsWith('_name'))
                                    .map(key => parseInt(key.split('_')[1]))
                                    .filter((val, i, arr) => arr.indexOf(val) === i)
                                    .sort((a, b) => a - b);

                                return nigiriIndices.map(index => {
                                    const name_en = section[`nigiri_${index}_name_en`] || section[`nigiri_${index}_name`] || '';
                                    const name_sub = section[`nigiri_${index}_name_sub`] || '';
                                    const name_ko = section[`nigiri_${index}_name_ko`] || '';
                                    const name_zh = section[`nigiri_${index}_name_zh`] || '';
                                    const price = section[`nigiri_${index}_price`] || '0';
                                    const image = section[`nigiri_${index}_image`] || '/assets/placeholder.webp';
                                    const isSoldOut = section[`nigiri_${index}_soldOut`] === 'true';
                                    const isHidden = section[`nigiri_${index}_hidden`] === 'true';

                                    if (!isEditing && isHidden) return null;

                                    return (
                                        <div key={index} className={`flex flex-col ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                            <div className="relative group aspect-square">
                                                {isEditing && (
                                                    <MenuItemControls
                                                        onDelete={() => onDeleteMenuItem?.('menu', 'nigiri', index)}
                                                        isSoldOut={isSoldOut}
                                                        onToggleSoldOut={() => onTextChange?.('menu', `nigiri_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                        isHidden={isHidden}
                                                        onToggleHidden={() => onTextChange?.('menu', `nigiri_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                    />
                                                )}
                                                <ImageWithFallback src={image} alt={name_en} className="w-full h-full object-cover" />
                                                {isEditing && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onMenuImageEdit?.('menu', 'nigiri', index);
                                                            }}
                                                            className="px-3 py-1.5 bg-white text-gray-800 rounded text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1 pointer-events-auto"
                                                        >
                                                            <ImageIcon size={14} />
                                                            編集
                                                        </button>
                                                    </div>
                                                )}
                                                {isSoldOut && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <span className="bg-black/80 text-white px-4 py-2 font-black text-xl tracking-tighter border-2 border-white transform -rotate-12 italic">SOLD OUT</span>
                                                    </div>
                                                )}
                                                {isEditing && isHidden && (
                                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 z-30">
                                                        <EyeOff size={10} />
                                                        非表示中
                                                    </div>
                                                )}
                                                {/* Overlay with English name and price */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 pt-8">
                                                    <h4 style={{ fontFamily: "'Archivo Narrow', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)' }} className="font-bold text-sm text-white uppercase">
                                                        <InlineEditableText
                                                            value={name_en}
                                                            onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_en`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </h4>
                                                    <div style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }} className="text-[#deb55a] font-bold text-xs">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('menu', `nigiri_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Sub name, Korean and Chinese below the image */}
                                            <div className="p-2 space-y-0.5">
                                                {name_sub && (
                                                    <p className="text-xs text-[#e8eaec]/80 italic">
                                                        <InlineEditableText
                                                            value={name_sub}
                                                            onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_sub`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                                {name_ko && (
                                                    <p className="text-xs text-[#e8eaec]/70">
                                                        <InlineEditableText
                                                            value={name_ko}
                                                            onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_ko`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                                {name_zh && (
                                                    <p className="text-xs text-[#e8eaec]/50">
                                                        <InlineEditableText
                                                            value={name_zh}
                                                            onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_zh`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* MAKIMONO Section */}
                    <div className="py-16 px-4 -mx-4 bg-[#1C1C1C]">
                        <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-8 text-[#e8eaec]"><InlineEditableText value={textSettings.menu?.makimono_title_en || textSettings.menu?.makimono_title || 'MAKIMONO'} onChange={(val) => onTextChange?.('menu', 'makimono_title_en', val)} isEditing={isEditing} /></h3>
                        <div className="text-center text-xl mb-8 text-[#deb55a]" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}><InlineEditableText value={textSettings.menu?.makimono_subtitle_en || textSettings.menu?.makimono_subtitle || 'Rolls'} onChange={(val) => onTextChange?.('menu', 'makimono_subtitle_en', val)} isEditing={isEditing} /></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(() => {
                                const section = textSettings.menu || {};
                                const makimonoIndices = Object.keys(section)
                                    .filter(key => key.startsWith('makimono_') && key.endsWith('_name'))
                                    .map(key => parseInt(key.split('_')[1]))
                                    .filter((val, i, arr) => arr.indexOf(val) === i)
                                    .sort((a, b) => a - b);

                                return makimonoIndices.map(index => {
                                    const name_en = section[`makimono_${index}_name_en`] || section[`makimono_${index}_name`] || '';
                                    const name_ko = section[`makimono_${index}_name_ko`] || '';
                                    const name_zh = section[`makimono_${index}_name_zh`] || '';
                                    const price = section[`makimono_${index}_price`] || '0';
                                    const image = section[`makimono_${index}_image`] || '/assets/placeholder.webp';
                                    const isSoldOut = section[`makimono_${index}_soldOut`] === 'true';
                                    const isHidden = section[`makimono_${index}_hidden`] === 'true';

                                    if (!isEditing && isHidden) return null;

                                    return (
                                        <div key={index} className={`flex flex-col ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                            <div className="relative group aspect-square">
                                                {isEditing && (
                                                    <MenuItemControls
                                                        onDelete={() => onDeleteMenuItem?.('menu', 'makimono', index)}
                                                        isSoldOut={isSoldOut}
                                                        onToggleSoldOut={() => onTextChange?.('menu', `makimono_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                        isHidden={isHidden}
                                                        onToggleHidden={() => onTextChange?.('menu', `makimono_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                    />
                                                )}
                                                <ImageWithFallback src={image} alt={name_en} className="w-full h-full object-cover" />
                                                {isEditing && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onMenuImageEdit?.('menu', 'makimono', index);
                                                            }}
                                                            className="px-3 py-1.5 bg-white text-gray-800 rounded text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1 pointer-events-auto"
                                                        >
                                                            <ImageIcon size={14} />
                                                            編集
                                                        </button>
                                                    </div>
                                                )}
                                                {isSoldOut && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <span className="bg-black/80 text-white px-4 py-2 font-black text-xl tracking-tighter border-2 border-white transform -rotate-12 italic">SOLD OUT</span>
                                                    </div>
                                                )}
                                                {isEditing && isHidden && (
                                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 z-30">
                                                        <EyeOff size={10} />
                                                        非表示中
                                                    </div>
                                                )}
                                                {/* Overlay with English name and price */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 pt-8">
                                                    <h4 style={{ fontFamily: "'Archivo Narrow', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)' }} className="font-bold text-sm text-white uppercase">
                                                        <InlineEditableText
                                                            value={name_en}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_name_en`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </h4>
                                                    <div style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }} className="text-[#deb55a] font-bold text-xs">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Korean and Chinese below the image */}
                                            <div className="p-2 space-y-0.5">
                                                {name_ko && (
                                                    <p className="text-xs text-[#e8eaec]/70">
                                                        <InlineEditableText
                                                            value={name_ko}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_name_ko`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                                {name_zh && (
                                                    <p className="text-xs text-[#e8eaec]/50">
                                                        <InlineEditableText
                                                            value={name_zh}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_name_zh`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* IPPIN Section */}
                    <div className="py-16 px-4 -mx-4 bg-[#1C1C1C]">
                        <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-8 text-[#e8eaec]"><InlineEditableText value={textSettings.menu?.ippin_title_en || textSettings.menu?.ippin_title || 'IPPIN'} onChange={(val) => onTextChange?.('menu', 'ippin_title_en', val)} isEditing={isEditing} /></h3>
                        <div className="text-center text-xl mb-8 text-[#deb55a]" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}><InlineEditableText value={textSettings.menu?.ippin_subtitle_en || textSettings.menu?.ippin_subtitle || 'A La Carte'} onChange={(val) => onTextChange?.('menu', 'ippin_subtitle_en', val)} isEditing={isEditing} /></div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(() => {
                                const section = textSettings.menu || {};
                                const ippinIndices = Object.keys(section)
                                    .filter(key => key.startsWith('ippin_') && key.endsWith('_name'))
                                    .map(key => parseInt(key.split('_')[1]))
                                    .filter((val, i, arr) => arr.indexOf(val) === i)
                                    .sort((a, b) => a - b);

                                return ippinIndices.map(index => {
                                    const name_en = section[`ippin_${index}_name_en`] || section[`ippin_${index}_name`] || '';
                                    const name_ko = section[`ippin_${index}_name_ko`] || '';
                                    const name_zh = section[`ippin_${index}_name_zh`] || '';
                                    const price = section[`ippin_${index}_price`] || '0';
                                    const image = section[`ippin_${index}_image`] || '/assets/placeholder.webp';
                                    const note_en = section[`ippin_${index}_note_en`] || section[`ippin_${index}_note`] || '';
                                    const isSoldOut = section[`ippin_${index}_soldOut`] === 'true';
                                    const isHidden = section[`ippin_${index}_hidden`] === 'true';

                                    if (!isEditing && isHidden) return null;

                                    return (
                                        <div key={index} className={`flex flex-col ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                            <div className="relative group aspect-square">
                                                {isEditing && (
                                                    <MenuItemControls
                                                        onDelete={() => onDeleteMenuItem?.('menu', 'ippin', index)}
                                                        isSoldOut={isSoldOut}
                                                        onToggleSoldOut={() => onTextChange?.('menu', `ippin_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                        isHidden={isHidden}
                                                        onToggleHidden={() => onTextChange?.('menu', `ippin_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                    />
                                                )}
                                                <ImageWithFallback src={image} alt={name_en} className="w-full h-full object-cover" />
                                                {isEditing && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onMenuImageEdit?.('menu', 'ippin', index);
                                                            }}
                                                            className="px-3 py-1.5 bg-white text-gray-800 rounded text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1 pointer-events-auto"
                                                        >
                                                            <ImageIcon size={14} />
                                                            編集
                                                        </button>
                                                    </div>
                                                )}
                                                {isSoldOut && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <span className="bg-black/80 text-white px-4 py-2 font-black text-xl tracking-tighter border-2 border-white transform -rotate-12 italic">SOLD OUT</span>
                                                    </div>
                                                )}
                                                {isEditing && isHidden && (
                                                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 z-30">
                                                        <EyeOff size={10} />
                                                        非表示中
                                                    </div>
                                                )}
                                                {/* Overlay with English name and price */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 pt-8">
                                                    <h4 style={{ fontFamily: "'Archivo Narrow', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)' }} className="font-bold text-sm text-white uppercase">
                                                        <InlineEditableText
                                                            value={name_en}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_name_en`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </h4>
                                                    <div style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }} className="text-[#deb55a] font-bold text-xs">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Korean, Chinese and note below the image */}
                                            <div className="p-2 space-y-0.5">
                                                {name_ko && (
                                                    <p className="text-xs text-[#e8eaec]/70">
                                                        <InlineEditableText
                                                            value={name_ko}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_name_ko`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                                {name_zh && (
                                                    <p className="text-xs text-[#e8eaec]/50">
                                                        <InlineEditableText
                                                            value={name_zh}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_name_zh`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                                {note_en && (
                                                    <p className="text-xs text-[#e8eaec]/60 italic mt-1">
                                                        <InlineEditableText
                                                            value={note_en}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_note_en`, val)}
                                                            isEditing={isEditing}
                                                            multiline={true}
                                                        />
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </section>

            {/* DRINK Section */}
            <section id="drink" className="py-20 bg-[#1C1C1C] text-white overflow-hidden relative">
                {isEditing && (
                    <SectionToolbar
                        sectionId="drink"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange || (() => { })}
                        onSectionSelect={(id) => onSectionSelect?.(id)}
                        onBackgroundEdit={onBackgroundEdit || (() => { })}
                    />
                )}
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-4 text-[#fcebc5] uppercase tracking-wider"><InlineEditableText value={textSettings.drink?.title_en || textSettings.drink?.title || 'DRINK'} onChange={(val) => onTextChange?.('drink', 'title_en', val)} isEditing={isEditing} /></h2>
                    <p className="text-center text-xl text-[#deb55a] italic mb-20 uppercase tracking-widest"><InlineEditableText value={textSettings.drink?.subtitle_en || textSettings.drink?.subtitle || 'Beverage Menu'} onChange={(val) => onTextChange?.('drink', 'subtitle_en', val)} isEditing={isEditing} /></p>

                    <div className="space-y-24">
                        {/* NIHONSHU */}
                        <div>
                            <div className="flex items-center gap-4 mb-12">
                                <div className="h-[2px] flex-1 bg-[#deb55a] opacity-30"></div>
                                <h3 className="text-3xl font-bold uppercase tracking-wider text-[#deb55a]"><InlineEditableText value={textSettings.drink?.nihonshu_title_en || textSettings.drink?.nihonshu_title || 'NIHONSHU'} onChange={(val) => onTextChange?.('drink', 'nihonshu_title_en', val)} isEditing={isEditing} /></h3>
                                <div className="h-[2px] flex-1 bg-[#deb55a] opacity-30"></div>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {(() => {
                                    const section = textSettings.drink || {};
                                    const indices = Object.keys(section)
                                        .filter(key => key.startsWith('nihonshu_') && key.endsWith('_name'))
                                        .map(key => parseInt(key.split('_')[1]))
                                        .filter((val, i, arr) => arr.indexOf(val) === i)
                                        .sort((a, b) => a - b);

                                    return indices.map(index => {
                                        const name_en = section[`nihonshu_${index}_name_en`] || section[`nihonshu_${index}_name`] || '';
                                        const name_ko = section[`nihonshu_${index}_name_ko`] || '';
                                        const name_zh = section[`nihonshu_${index}_name_zh`] || '';
                                        const price = section[`nihonshu_${index}_price`] || '0';
                                        const image = section[`nihonshu_${index}_image`] || '/assets/placeholder.webp';
                                        const isSoldOut = section[`nihonshu_${index}_soldOut`] === 'true';
                                        const isHidden = section[`nihonshu_${index}_hidden`] === 'true';

                                        if (!isEditing && isHidden) return null;

                                        return (
                                            <div key={index} className={`flex flex-col items-center text-center relative ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                                {isEditing && (
                                                    <MenuItemControls
                                                        onDelete={() => onDeleteMenuItem?.('drink', 'nihonshu', index)}
                                                        isSoldOut={isSoldOut}
                                                        onToggleSoldOut={() => onTextChange?.('drink', `nihonshu_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                        isHidden={isHidden}
                                                        onToggleHidden={() => onTextChange?.('drink', `nihonshu_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                    />
                                                )}
                                                <div className="w-full aspect-[3/4] relative group mb-4">
                                                    <ImageWithFallback src={image} alt={name_en} className="w-full h-full object-cover rounded shadow-lg border border-white/10" />
                                                    {isEditing && (
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center pointer-events-none">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onMenuImageEdit?.('drink', 'nihonshu', index);
                                                                }}
                                                                className="px-3 py-1.5 bg-white text-gray-800 rounded text-xs font-bold hover:bg-gray-100 transition-colors flex items-center gap-1 pointer-events-auto"
                                                            >
                                                                <ImageIcon size={14} />
                                                                編集
                                                            </button>
                                                        </div>
                                                    )}
                                                    {isSoldOut && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                                                            <span className="bg-black/80 text-white px-4 py-2 font-black text-lg tracking-tighter border-2 border-white transform -rotate-12 italic">SOLD OUT</span>
                                                        </div>
                                                    )}
                                                    {isEditing && isHidden && (
                                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 z-30">
                                                            <EyeOff size={10} />
                                                            非表示中
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-lg font-bold">
                                                        <InlineEditableText
                                                            value={name_en}
                                                            onChange={(val) => onTextChange?.('drink', `nihonshu_${index}_name_en`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </h4>
                                                    <div className="text-[#deb55a] font-bold">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('drink', `nihonshu_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        <InlineEditableText
                                                            value={name_ko}
                                                            onChange={(val) => onTextChange?.('drink', `nihonshu_${index}_name_ko`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-medium opacity-80">
                                                        <InlineEditableText
                                                            value={name_zh}
                                                            onChange={(val) => onTextChange?.('drink', `nihonshu_${index}_name_zh`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                {isEditing && (
                                    <button
                                        onClick={() => onAddMenuItem?.('drink', 'nihonshu')}
                                        className="aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-[#deb55a]/30 rounded-lg hover:border-[#deb55a]/60 hover:bg-[#deb55a]/5 transition-all text-[#deb55a]"
                                    >
                                        <Plus size={32} strokeWidth={1} />
                                        <span className="text-sm font-bold mt-2">日本酒を追加</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* BEER, HIGHBALL, SOUR, WINE */}
                        <div className="grid md:grid-cols-2 gap-16">
                            {/* ALCOHOL */}
                            <div>
                                <h3 className="text-2xl font-bold uppercase tracking-widest text-[#deb55a] border-b border-[#deb55a]/30 pb-4 mb-8"><InlineEditableText value={textSettings.drink?.alcohol_title_en || textSettings.drink?.alcohol_title || 'ALCOHOL'} onChange={(val) => onTextChange?.('drink', 'alcohol_title_en', val)} isEditing={isEditing} /></h3>
                                <div className="space-y-8">
                                    <InlineEditableText
                                        value={textSettings.drink?.alcohol_content_en || textSettings.drink?.alcohol_content || ''}
                                        onChange={(val) => onTextChange?.('drink', 'alcohol_content_en', val)}
                                        isEditing={isEditing}
                                        multiline={true}
                                        className="text-[#e8eaec] text-lg"
                                    />
                                </div>
                            </div>

                            {/* SHOCHU */}
                            <div>
                                <h3 className="text-2xl font-bold uppercase tracking-widest text-[#deb55a] border-b border-[#deb55a]/30 pb-4 mb-8"><InlineEditableText value={textSettings.drink?.shochu_title_en || textSettings.drink?.shochu_title || 'SHOCHU'} onChange={(val) => onTextChange?.('drink', 'shochu_title_en', val)} isEditing={isEditing} /></h3>
                                <div className="space-y-8">
                                    <InlineEditableText
                                        value={textSettings.drink?.shochu_content_en || textSettings.drink?.shochu_content || ''}
                                        onChange={(val) => onTextChange?.('drink', 'shochu_content_en', val)}
                                        isEditing={isEditing}
                                        multiline={true}
                                        className="text-[#e8eaec] text-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* OTHER */}
                        <div>
                            <h3 className="text-2xl font-bold uppercase tracking-widest text-[#deb55a] border-b border-[#deb55a]/30 pb-4 mb-8"><InlineEditableText value={textSettings.drink?.other_title_en || textSettings.drink?.other_title || 'SOFT DRINKS'} onChange={(val) => onTextChange?.('drink', 'other_title_en', val)} isEditing={isEditing} /></h3>
                            <div className="space-y-8">
                                <InlineEditableText
                                    value={textSettings.drink?.other_content_en || textSettings.drink?.other_content || ''}
                                    onChange={(val) => onTextChange?.('drink', 'other_content_en', val)}
                                    isEditing={isEditing}
                                    multiline={true}
                                    className="text-[#e8eaec] text-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Access Section */}
            <section id="access" className="py-20 bg-white relative overflow-hidden">
                {isEditing && (
                    <SectionToolbar
                        sectionId="access"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange || (() => { })}
                        onSectionSelect={(id) => onSectionSelect?.(id)}
                        onBackgroundEdit={onBackgroundEdit || (() => { })}
                    />
                )}
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-12 text-[#1C1C1C] uppercase"><InlineEditableText value={textSettings.access?.title_en || textSettings.access?.title || 'ACCESS'} onChange={(val) => onTextChange?.('access', 'title_en', val)} isEditing={isEditing} /></h2>
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-8 text-lg text-[#1C1C1C]">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-[#deb55a] shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold"><InlineEditableText value={textSettings.access?.zip_en || textSettings.access?.zip || '160-0021'} onChange={(val) => onTextChange?.('access', 'zip_en', val)} isEditing={isEditing} /></p>
                                    <InlineEditableText value={textSettings.access?.address_en || 'GEST34 Bldg 4F, 2-45-16 Kabukicho, Shinjuku-ku, Tokyo'} onChange={(val) => onTextChange?.('access', 'address_en', val)} isEditing={isEditing} multiline={true} />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="text-[#deb55a]" />
                                <p>{links.phoneDisplay}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Clock className="text-[#deb55a]" />
                                <p><InlineEditableText value={textSettings.access?.hours_en || textSettings.access?.hours || 'OPEN : 18:00 - 24:00'} onChange={(val) => onTextChange?.('access', 'hours_en', val)} isEditing={isEditing} /></p>
                            </div>
                            <a href={links.mapsUrl} target="_blank" className="inline-block px-8 py-3 bg-[#1C1C1C] text-white rounded hover:bg-[#deb55a] transition-colors font-bold uppercase tracking-wider">Open in Google Maps</a>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-2xl relative group">
                            <ImageWithFallback src={textSettings.access?.map_image || '/assets/access_map.webp'} alt="Map" className="w-full h-auto" />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={(e) => { e.stopPropagation(); onMenuImageEdit?.('access', 'map_image', 0); }} className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg"><ImageIcon size={20} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Affiliated Store Section */}
            <section id="affiliated" className="pt-32 pb-20 bg-[#1C1C1C] relative overflow-hidden">
                {isEditing && (
                    <SectionToolbar
                        sectionId="affiliated"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange || (() => { })}
                        onSectionSelect={(id) => onSectionSelect?.(id)}
                        onBackgroundEdit={onBackgroundEdit || (() => { })}
                    />
                )}
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 text-[#fcebc5] uppercase"><InlineEditableText value={textSettings.affiliated?.title_en || textSettings.affiliated?.title || 'Affiliated store of KABUKI SUSHI'} onChange={(val) => onTextChange?.('affiliated', 'title_en', val)} isEditing={isEditing} /></h2>
                    <p className="text-center text-xl mb-12 text-gray-400 italic uppercase"><InlineEditableText value={textSettings.affiliated?.subtitle_en || textSettings.affiliated?.subtitle || 'Sister Stores'} onChange={(val) => onTextChange?.('affiliated', 'subtitle_en', val)} isEditing={isEditing} /></p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#271c02] rounded-lg p-6 border border-[#deb55a]/30">
                            <div className="relative group">
                                <ImageWithFallback src={textSettings.affiliated?.store1_image || '/assets/honten_card_new.webp'} alt="KABUKI Sushi Main Store" className="w-full aspect-[3/2] object-cover rounded-lg mb-6" />
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); onMenuImageEdit?.('affiliated', 'store1_image', 0); }} className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg"><ImageIcon size={20} /></button>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-[#fcebc5] uppercase font-archivo"><InlineEditableText value={textSettings.affiliated?.store1_name_en || textSettings.affiliated?.store1_name || '■KABUKI Sushi Main Store'} onChange={(val) => onTextChange?.('affiliated', 'store1_name_en', val)} isEditing={isEditing} /></h3>
                            <div className="space-y-2 text-gray-300 font-archivo">
                                <p><InlineEditableText value={textSettings.affiliated?.store1_address_en || 'Eco Place Shinjuku 1F, 2-25-8 Kabukicho, Shinjuku-ku, Tokyo'} onChange={(val) => onTextChange?.('affiliated', 'store1_address_en', val)} isEditing={isEditing} /></p>
                                <p><InlineEditableText value={textSettings.affiliated?.store1_phone_en || textSettings.affiliated?.store1_phone || 'TEL：03-6457-6612 | OPEN：18:00-4:00'} onChange={(val) => onTextChange?.('affiliated', 'store1_phone_en', val)} isEditing={isEditing} /></p>
                                <p><InlineEditableText value={textSettings.affiliated?.store1_note_en || textSettings.affiliated?.store1_note || 'Gluten-free options available'} onChange={(val) => onTextChange?.('affiliated', 'store1_note_en', val)} isEditing={isEditing} /></p>
                            </div>
                        </div>

                        <div className="bg-[#271c02] rounded-lg p-6 border border-[#deb55a]/30">
                            <div className="relative group">
                                <ImageWithFallback src={textSettings.affiliated?.store2_image || '/assets/soba_card_new.webp'} alt="KABUKI SOBA" className="w-full aspect-[3/2] object-cover rounded-lg mb-6" />
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={(e) => { e.stopPropagation(); onMenuImageEdit?.('affiliated', 'store2_image', 0); }} className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg"><ImageIcon size={20} /></button>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-[#fcebc5] uppercase font-archivo"><InlineEditableText value={textSettings.affiliated?.store2_name_en || textSettings.affiliated?.store2_name || '■KABUKI SOBA'} onChange={(val) => onTextChange?.('affiliated', 'store2_name_en', val)} isEditing={isEditing} /></h3>
                            <div className="space-y-2 text-gray-300 font-archivo">
                                <p><InlineEditableText value={textSettings.affiliated?.store2_address_en || 'Lee2 Bldg 1F, 2-27-12 Kabukicho, Shinjuku-ku, Tokyo'} onChange={(val) => onTextChange?.('affiliated', 'store2_address_en', val)} isEditing={isEditing} /></p>
                                <p><InlineEditableText value={textSettings.affiliated?.store2_phone_en || textSettings.affiliated?.store2_phone || 'TEL：03-6457-3112 | OPEN：19:00-6:00'} onChange={(val) => onTextChange?.('affiliated', 'store2_phone_en', val)} isEditing={isEditing} /></p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto relative group">
                        <ImageWithFallback src={textSettings.affiliated?.map_image || '/assets/affiliated_map.webp'} alt="Stores Map" className="w-full h-auto" />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={(e) => { e.stopPropagation(); onMenuImageEdit?.('affiliated', 'map_image', 0); }} className="p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-lg"><ImageIcon size={20} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1C1C1C] py-16 border-t border-white/5">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <div className="flex justify-center gap-6 mb-8">
                        <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Instagram size={20} />
                        </a>
                        <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Facebook size={20} />
                        </a>
                        <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Music2 size={20} />
                        </a>
                        <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Youtube size={20} />
                        </a>
                        <a href={links.mapsUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <MapPin size={20} />
                        </a>
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 text-[#e8eaec]">
                            <Phone size={18} className="text-[#deb55a]" />
                            <span className="text-lg font-semibold">{links.phoneDisplay}</span>
                        </div>
                    </div>

                    <div className="text-sm text-gray-400 space-y-4">
                        <p><InlineEditableText value={textSettings.footer?.copyright_en || textSettings.footer?.copyright || 'Restaurant © 2019'} onChange={(val) => onTextChange?.('footer', 'copyright_en', val)} isEditing={isEditing} /></p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
