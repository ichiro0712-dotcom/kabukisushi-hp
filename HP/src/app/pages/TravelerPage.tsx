import { useState, useEffect } from 'react';
import { Menu, X, MapPin, Phone, Clock, Image as ImageIcon, Layout, Settings2, ChevronDown, ArrowUpToLine, ArrowDownToLine, AlignCenterVertical, RotateCcw, Instagram, Music2, Facebook, Youtube, Link as LinkIcon, Globe, EyeOff, Ban, Plus } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { InlineEditableText, MenuItemControls, SectionToolbar, DEFAULT_TEXT_SETTINGS } from './LandingPage';
import type { BackgroundConfig, LayoutConfig } from '../admin/pages/EditorPage';

interface TravelerPageProps {
    isEditing?: boolean;
    onSectionSelect?: (id: string | null) => void;
    onBackgroundEdit?: (id: string) => void;
    activeSection?: string | null;
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
    home: { type: 'image', value: '/assets/home_hero_new.jpg' },
    about: { type: 'color', value: '#ffffff', textTheme: 'dark' },
    gallery: { type: 'color', value: '#E8EAEC' },
    access: { type: 'image', value: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080' },
    menu: { type: 'color', value: '#d4183d', textTheme: 'light' },
    affiliated: { type: 'image', value: '/assets/honten_hero.jpg' },
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
    const [localBackgroundSettings, setLocalBackgroundSettings] = useState<Record<string, BackgroundConfig> | undefined>(undefined);
    const [localLayoutSettings, setLocalLayoutSettings] = useState<Record<string, LayoutConfig> | undefined>(undefined);
    const [localTextSettings, setLocalTextSettings] = useState<Record<string, Record<string, string>> | undefined>(undefined);

    const backgroundSettings = propBackgroundSettings || (localBackgroundSettings ? { ...DEFAULT_BACKGROUND_SETTINGS, ...localBackgroundSettings } : DEFAULT_BACKGROUND_SETTINGS);
    const layoutSettings = propLayoutSettings || (localLayoutSettings ? { ...DEFAULT_LAYOUT_SETTINGS, ...localLayoutSettings } : DEFAULT_LAYOUT_SETTINGS);
    const textSettings = propTextSettings || (() => {
        const base = { ...DEFAULT_TEXT_SETTINGS };
        if (localTextSettings) {
            Object.keys(localTextSettings).forEach(sectionId => {
                base[sectionId] = { ...base[sectionId], ...localTextSettings[sectionId] };
            });
        }
        return base;
    })();

    useEffect(() => {
        if (!isEditing) {
            const savedBackgrounds = localStorage.getItem('site_background_settings_traveler');
            const savedLayouts = localStorage.getItem('site_layout_settings_traveler');
            const savedText = localStorage.getItem('site_text_settings');
            if (savedBackgrounds) try { setLocalBackgroundSettings(JSON.parse(savedBackgrounds)); } catch (e) { }
            if (savedLayouts) try { setLocalLayoutSettings(JSON.parse(savedLayouts)); } catch (e) { }
            if (savedText) try { setLocalTextSettings(JSON.parse(savedText)); } catch (e) { }
        }
    }, [isEditing]);

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

    return (
        <div className="min-h-screen bg-[#1C1C1C]">
            {/* Header / Nav */}
            <nav className="fixed top-0 w-full bg-[#1C1C1C]/95 backdrop-blur-sm z-50 border-b border-[#deb55a]/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => !isEditing && scrollToSection('home')}
                                style={{ fontFamily: "'Bad Script', cursive" }}
                                className="text-2xl text-[#fcebc5]"
                            >
                                KABUKI寿司 1番通り店
                            </button>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button onClick={() => scrollToSection('about')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">ABOUT</button>
                            <button onClick={() => scrollToSection('gallery')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">GALLERY</button>
                            <button onClick={() => scrollToSection('menu')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">MENU</button>
                            <button onClick={() => scrollToSection('access')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">ACCESS</button>

                            <div className="flex items-center gap-4 border-l border-white/20 pl-8">
                                <span className="text-[#fcebc5] text-xs font-bold flex items-center gap-1">▼ FOREIGN LANGUAGE MENU</span>
                                <a href="/" className="px-4 py-1.5 bg-[#deb55a] text-[#1C1C1C] rounded text-xs font-bold hover:bg-[#fcebc5] transition-colors uppercase">
                                    Japanese
                                </a>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden text-[#e8eaec]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#1C1C1C] border-t border-[#deb55a]/20 p-4 space-y-3">
                        <button onClick={() => scrollToSection('about')} className="block w-full text-left text-[#e8eaec] py-2">ABOUT</button>
                        <button onClick={() => scrollToSection('gallery')} className="block w-full text-left text-[#e8eaec] py-2">GALLERY</button>
                        <button onClick={() => scrollToSection('menu')} className="block w-full text-left text-[#e8eaec] py-2">MENU</button>
                        <button onClick={() => scrollToSection('access')} className="block w-full text-left text-[#e8eaec] py-2">ACCESS</button>
                        <div className="pt-4 border-t border-white/10">
                            <a href="/" className="block w-full text-center py-3 bg-[#deb55a] text-[#1C1C1C] rounded font-bold uppercase">Japanese</a>
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
                <div className="absolute inset-0 bg-black/60"></div>
                <div className={`relative z-10 text-center mx-auto ${getContainerWidthClass('home')}`}>
                    <div className="mb-12 flex justify-center">
                        <ImageWithFallback
                            src="/assets/logo.png"
                            alt="KABUKI Logo"
                            className="w-auto h-32 md:h-40 object-contain"
                        />
                    </div>
                    <div className="space-y-6">
                        <div>
                            <a href="/" className="inline-block px-6 py-2 text-sm text-[#e8eaec] hover:text-[#deb55a] transition-colors border border-[#e8eaec]/30 rounded hover:border-[#deb55a]">
                                Languages: 日本語
                            </a>
                        </div>
                        <div>
                            <button
                                onClick={() => scrollToSection('menu')}
                                style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                                className="px-12 py-4 bg-[#deb55a] text-[#1C1C1C] rounded-lg hover:bg-[#fcebc5] transition-colors font-bold text-lg"
                            >
                                MENU
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://www.tablecheck.com/shops/kabukisushi-ichiban/reserve"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                                className="px-8 py-3 text-[#886107] hover:text-[#1C1C1C] bg-white/90 hover:bg-white rounded transition-colors font-semibold"
                            >
                                RESERVATION
                            </a>
                            <a
                                href="https://maps.app.goo.gl/yC8c23nWvXpjYmoXA"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                                className="px-8 py-3 text-[#e8eaec] hover:text-[#deb55a] border-2 border-[#e8eaec] hover:border-[#deb55a] rounded transition-colors font-semibold"
                            >
                                Google Maps
                            </a>
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <a href="https://www.instagram.com/kabukizushi_ichiban?igsh=MWRzdmxuNzF1ODlzNA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="px-6 py-2 text-[#e8eaec] hover:text-[#deb55a] border border-[#e8eaec]/30 rounded hover:border-[#deb55a] transition-colors">Instagram</a>
                            <a href="https://www.tiktok.com/@kabukisushi1001?_t=8kzjmGapCuP&_r=1" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="px-6 py-2 text-[#e8eaec] hover:text-[#deb55a] border border-[#e8eaec]/30 rounded hover:border-[#deb55a] transition-colors">Tik Tok</a>
                            <a href="https://www.youtube.com/@KABUKI-ev3sy" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="px-6 py-2 text-[#e8eaec] hover:text-[#deb55a] border border-[#e8eaec]/30 rounded hover:border-[#deb55a] transition-colors">YouTube</a>
                            <a href="https://www.facebook.com/profile.php?id=100064940143541" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="px-6 py-2 text-[#e8eaec] hover:text-[#deb55a] border border-[#e8eaec]/30 rounded hover:border-[#deb55a] transition-colors">Facebook</a>
                        </div>
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
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-12 uppercase">ABOUT US</h2>
                    <div className="flex flex-col items-center gap-12">
                        <div className="w-full max-w-4xl">
                            <ImageWithFallback
                                src="/assets/about_content_new.jpg"
                                alt="Restaurant Interior"
                                className="rounded-lg shadow-xl w-full h-auto"
                            />
                        </div>
                        <div className="space-y-6 text-center max-w-3xl mx-auto text-lg leading-relaxed" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}>
                            <p>The up-and-coming manager, who learnt Edo-mae techniques at a famous restaurant that originated in the region and is part of the Ryukyu stream, has coloured Edo-mae sushi with the present in the hope that you will enjoy authentic Edo-mae sushi without any pretensions. Enjoy a dining experience that is both authentic and innovative.</p>
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
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-12 text-[#1C1C1C] uppercase">GALLERY</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            '/assets/gallery_2.jpg',
                            '/assets/gallery_4.jpg',
                            '/assets/gallery_3.jpg',
                            '/assets/gallery_5.jpg',
                            '/assets/gallery_1.jpg',
                            '/assets/gallery_6.jpg',
                            '/assets/gallery_7.jpg',
                            '/assets/gallery_8.jpg',
                            '/assets/gallery_9.jpg',
                            '/assets/gallery_10.jpg',
                        ].map((src, i) => (
                            <div key={i} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <ImageWithFallback src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SUSHI-COURSE Section */}
            <section
                id="menu"
                className="py-20 bg-[#d4183d] text-white"
            >
                <div className={`mx-auto ${getContainerWidthClass('menu')}`}>
                    <h2 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-5xl text-center mb-4 uppercase">MENU</h2>
                    <h3 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-6xl text-center mb-8 font-extrabold italic">SUSHI-COURSE</h3>

                    <div className="text-center space-y-2 mb-16 text-sm">
                        <p>※All listed prices are excluding tax</p>
                        <p>표시가격은 세금을 뺀 価格 입니다</p>
                        <p>表示的价格是不含税的</p>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-12 mb-20">
                        <div className="border-l-4 border-white pl-6">
                            <div className="flex justify-between items-end mb-2">
                                <h4 className="text-2xl font-bold">OMAKASE 8 pieces</h4>
                                <span className="text-2xl font-bold">4980yen</span>
                            </div>
                            <p className="text-gray-200 italic">8 recommended nigiri, 1 Appetizer, Miso soup</p>
                        </div>
                        <div className="border-l-4 border-white pl-6">
                            <div className="flex justify-between items-end mb-2">
                                <h4 className="text-2xl font-bold">SPECIAL OMAKASE 8 pieces</h4>
                                <span className="text-2xl font-bold">6980yen</span>
                            </div>
                            <p className="text-gray-200 italic">8 special recommended nigiri, 1 Appetizers, Miso soup</p>
                        </div>
                        <div className="border-l-4 border-white pl-6">
                            <div className="flex justify-between items-end mb-2">
                                <h4 className="text-2xl font-bold">SPECIAL OMAKASE 10 pieces</h4>
                                <span className="text-2xl font-bold">9900yen</span>
                            </div>
                            <p className="text-gray-200 italic">10 special recommended nigiri, 3 Pieces of Sashimi, 1 Appetizers, Miso soup</p>
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
                    <div className="mt-24">
                        <h3 className="text-4xl text-center mb-1 font-bold italic uppercase">Special Menu</h3>
                        <h3 className="text-6xl text-center mb-2 font-extrabold italic uppercase">NIGIRI</h3>
                        <p className="text-center text-2xl text-[#fcebc5] italic font-bold mb-16">Kindly order at least 5 items per person</p>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                            {(() => {
                                const section = textSettings.menu || {};
                                const nigiriIndices = Object.keys(section)
                                    .filter(key => key.startsWith('nigiri_') && key.endsWith('_name'))
                                    .map(key => parseInt(key.split('_')[1]))
                                    .filter((val, i, arr) => arr.indexOf(val) === i)
                                    .sort((a, b) => a - b);

                                return nigiriIndices.map(index => {
                                    const name_en = section[`nigiri_${index}_name_en`] || section[`nigiri_${index}_name`] || '';
                                    const name_ko = section[`nigiri_${index}_name_ko`] || '';
                                    const name_zh = section[`nigiri_${index}_name_zh`] || '';
                                    const name_sub = section[`nigiri_${index}_name_sub`] || '';
                                    const price = section[`nigiri_${index}_price`] || '0';
                                    const image = section[`nigiri_${index}_image`] || '/assets/placeholder.jpg';
                                    const isSoldOut = section[`nigiri_${index}_soldOut`] === 'true';
                                    const isHidden = section[`nigiri_${index}_hidden`] === 'true';

                                    if (!isEditing && isHidden) return null;

                                    return (
                                        <div key={index} className={`flex flex-col gap-4 relative ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                            {isEditing && (
                                                <MenuItemControls
                                                    onDelete={() => onDeleteMenuItem?.('menu', 'nigiri', index)}
                                                    isSoldOut={isSoldOut}
                                                    onToggleSoldOut={() => onTextChange?.('menu', `nigiri_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                    isHidden={isHidden}
                                                    onToggleHidden={() => onTextChange?.('menu', `nigiri_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                />
                                            )}
                                            <div className="relative group">
                                                <ImageWithFallback src={image} alt={name_en} className="w-full aspect-[4/3] object-cover rounded shadow-lg" />
                                                {isEditing && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center pointer-events-none">
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
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                                                        <span className="bg-black/80 text-white px-4 py-2 font-black text-xl tracking-tighter border-2 border-white transform -rotate-12 italic">SOLD OUT</span>
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
                                                <div className="text-[#d4183d] bg-white inline-block px-2 py-0.5 font-bold mb-2">
                                                    ¥<InlineEditableText
                                                        value={price}
                                                        onChange={(val) => onTextChange?.('menu', `nigiri_${index}_price`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </div>
                                                <h4 className="text-xl font-bold leading-tight uppercase font-archivo">
                                                    <InlineEditableText
                                                        value={name_en}
                                                        onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_en`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </h4>
                                                {name_sub && (
                                                    <p className="text-sm italic text-gray-200">
                                                        <InlineEditableText
                                                            value={name_sub}
                                                            onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_sub`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                )}
                                                <p className="text-sm font-medium">
                                                    <InlineEditableText
                                                        value={name_ko}
                                                        onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_ko`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </p>
                                                <p className="text-sm font-medium opacity-80">
                                                    <InlineEditableText
                                                        value={name_zh}
                                                        onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name_zh`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {/* MAKIMONO Section */}
                        <div className="mb-24">
                            <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 uppercase">MAKIMONO</h3>
                            <p className="text-center text-gray-200 mb-12 uppercase italic">Rolls</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                        const image = section[`makimono_${index}_image`] || '/assets/placeholder.jpg';
                                        const isSoldOut = section[`makimono_${index}_soldOut`] === 'true';
                                        const isHidden = section[`makimono_${index}_hidden`] === 'true';

                                        if (!isEditing && isHidden) return null;

                                        return (
                                            <div key={index} className={`flex flex-col gap-4 relative ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                                {isEditing && (
                                                    <MenuItemControls
                                                        onDelete={() => onDeleteMenuItem?.('menu', 'makimono', index)}
                                                        isSoldOut={isSoldOut}
                                                        onToggleSoldOut={() => onTextChange?.('menu', `makimono_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                        isHidden={isHidden}
                                                        onToggleHidden={() => onTextChange?.('menu', `makimono_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                    />
                                                )}
                                                <div className="relative group">
                                                    <ImageWithFallback src={image} alt={name_en} className="w-full aspect-[4/3] object-cover rounded shadow-lg" />
                                                    {isEditing && (
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center pointer-events-none">
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
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                                                            <span className="bg-black/80 text-white px-4 py-2 font-black text-xl tracking-tighter border-2 border-white transform -rotate-12 italic">SOLD OUT</span>
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
                                                    <div className="text-[#d4183d] bg-white inline-block px-2 py-0.5 font-bold mb-2">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                    <h4 className="text-xl font-bold uppercase font-archivo">
                                                        <InlineEditableText
                                                            value={name_en}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_name_en`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </h4>
                                                    <p className="text-sm font-medium">
                                                        <InlineEditableText
                                                            value={name_ko}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_name_ko`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                    <p className="text-sm font-medium opacity-80">
                                                        <InlineEditableText
                                                            value={name_zh}
                                                            onChange={(val) => onTextChange?.('menu', `makimono_${index}_name_zh`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* IPPIN Section */}
                        <div className="mb-24">
                            <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 uppercase">IPPIN</h3>
                            <p className="text-center text-gray-200 mb-12 uppercase italic">A La Carte</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                        const image = section[`ippin_${index}_image`] || '/assets/placeholder.jpg';
                                        const note_en = section[`ippin_${index}_note_en`] || section[`ippin_${index}_note`] || '';
                                        const isSoldOut = section[`ippin_${index}_soldOut`] === 'true';
                                        const isHidden = section[`ippin_${index}_hidden`] === 'true';

                                        if (!isEditing && isHidden) return null;

                                        return (
                                            <div key={index} className={`flex flex-col gap-4 relative ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                                {isEditing && (
                                                    <MenuItemControls
                                                        onDelete={() => onDeleteMenuItem?.('menu', 'ippin', index)}
                                                        isSoldOut={isSoldOut}
                                                        onToggleSoldOut={() => onTextChange?.('menu', `ippin_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                        isHidden={isHidden}
                                                        onToggleHidden={() => onTextChange?.('menu', `ippin_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                    />
                                                )}
                                                <div className="relative group">
                                                    <ImageWithFallback src={image} alt={name_en} className="w-full aspect-[4/3] object-cover rounded shadow-lg" />
                                                    {isEditing && (
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center pointer-events-none">
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
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                                                            <span className="bg-black/80 text-white px-4 py-2 font-black text-xl tracking-tighter border-2 border-white transform -rotate-12 italic">SOLD OUT</span>
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
                                                    <div className="text-[#d4183d] bg-white inline-block px-2 py-0.5 font-bold mb-2">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                    <h4 className="text-xl font-bold uppercase font-archivo">
                                                        <InlineEditableText
                                                            value={name_en}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_name_en`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </h4>
                                                    <p className="text-sm font-medium">
                                                        <InlineEditableText
                                                            value={name_ko}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_name_ko`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                    <p className="text-sm font-medium opacity-80">
                                                        <InlineEditableText
                                                            value={name_zh}
                                                            onChange={(val) => onTextChange?.('menu', `ippin_${index}_name_zh`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </p>
                                                    {note_en && (
                                                        <p className="text-xs text-gray-200 mt-2 italic">
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
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-4 text-[#fcebc5] uppercase tracking-wider">DRINK</h2>
                    <p className="text-center text-xl text-[#deb55a] italic mb-20 uppercase tracking-widest">Beverage Menu</p>

                    <div className="space-y-24">
                        {/* NIHONSHU */}
                        <div>
                            <div className="flex items-center gap-4 mb-12">
                                <div className="h-[2px] flex-1 bg-[#deb55a] opacity-30"></div>
                                <h3 className="text-3xl font-bold uppercase tracking-wider text-[#deb55a]">NIHONSHU</h3>
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
                                        const image = section[`nihonshu_${index}_image`] || '/assets/placeholder.jpg';
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
                                <h3 className="text-2xl font-bold uppercase tracking-widest text-[#deb55a] border-b border-[#deb55a]/30 pb-4 mb-8">ALCOHOL</h3>
                                <div className="space-y-8">
                                    {(() => {
                                        const section = textSettings.drink || {};
                                        const indices = Object.keys(section)
                                            .filter(key => key.startsWith('alcohol_') && key.endsWith('_name'))
                                            .map(key => parseInt(key.split('_')[1]))
                                            .filter((val, i, arr) => arr.indexOf(val) === i)
                                            .sort((a, b) => a - b);

                                        return indices.map(index => {
                                            const name_en = section[`alcohol_${index}_name_en`] || section[`alcohol_${index}_name`] || '';
                                            const name_ko = section[`alcohol_${index}_name_ko`] || '';
                                            const name_zh = section[`alcohol_${index}_name_zh`] || '';
                                            const price = section[`alcohol_${index}_price`] || '0';
                                            const isSoldOut = section[`alcohol_${index}_soldOut`] === 'true';
                                            const isHidden = section[`alcohol_${index}_hidden`] === 'true';

                                            if (!isEditing && isHidden) return null;

                                            return (
                                                <div key={index} className={`flex justify-between items-start border-b border-white/5 pb-4 relative ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                                    {isEditing && (
                                                        <div className="absolute -left-12 top-0">
                                                            <MenuItemControls
                                                                onDelete={() => onDeleteMenuItem?.('drink', 'alcohol', index)}
                                                                isSoldOut={isSoldOut}
                                                                onToggleSoldOut={() => onTextChange?.('drink', `alcohol_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                                isHidden={isHidden}
                                                                onToggleHidden={() => onTextChange?.('drink', `alcohol_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold flex items-center gap-2">
                                                            <InlineEditableText
                                                                value={name_en}
                                                                onChange={(val) => onTextChange?.('drink', `alcohol_${index}_name_en`, val)}
                                                                isEditing={isEditing}
                                                            />
                                                            {isSoldOut && <span className="bg-[#d4183d] text-white text-[10px] px-1.5 py-0.5 rounded uppercase">Sold Out</span>}
                                                            {isEditing && isHidden && <EyeOff size={12} className="text-gray-400" />}
                                                        </h4>
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="text-xs text-gray-400 font-medium">
                                                                <InlineEditableText
                                                                    value={name_ko}
                                                                    onChange={(val) => onTextChange?.('drink', `alcohol_${index}_name_ko`, val)}
                                                                    isEditing={isEditing}
                                                                />
                                                            </p>
                                                            <p className="text-xs text-gray-400 font-medium opacity-80">
                                                                <InlineEditableText
                                                                    value={name_zh}
                                                                    onChange={(val) => onTextChange?.('drink', `alcohol_${index}_name_zh`, val)}
                                                                    isEditing={isEditing}
                                                                />
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-[#deb55a] font-bold text-right ml-4">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('drink', `alcohol_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                    {isEditing && (
                                        <button
                                            onClick={() => onAddMenuItem?.('drink', 'alcohol')}
                                            className="w-full h-12 flex items-center justify-center border-2 border-dashed border-[#deb55a]/30 rounded-lg hover:border-[#deb55a]/60 hover:bg-[#deb55a]/5 transition-all text-[#deb55a]"
                                        >
                                            <Plus size={20} strokeWidth={1} />
                                            <span className="text-sm font-bold ml-2">項目を追加</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* SHOCHU */}
                            <div>
                                <h3 className="text-2xl font-bold uppercase tracking-widest text-[#deb55a] border-b border-[#deb55a]/30 pb-4 mb-8">SHOCHU</h3>
                                <div className="space-y-8">
                                    {(() => {
                                        const section = textSettings.drink || {};
                                        const indices = Object.keys(section)
                                            .filter(key => key.startsWith('shochu_') && key.endsWith('_name'))
                                            .map(key => parseInt(key.split('_')[1]))
                                            .filter((val, i, arr) => arr.indexOf(val) === i)
                                            .sort((a, b) => a - b);

                                        return indices.map(index => {
                                            const name_en = section[`shochu_${index}_name_en`] || section[`shochu_${index}_name`] || '';
                                            const name_ko = section[`shochu_${index}_name_ko`] || '';
                                            const name_zh = section[`shochu_${index}_name_zh`] || '';
                                            const price = section[`shochu_${index}_price`] || '0';
                                            const isSoldOut = section[`shochu_${index}_soldOut`] === 'true';
                                            const isHidden = section[`shochu_${index}_hidden`] === 'true';

                                            if (!isEditing && isHidden) return null;

                                            return (
                                                <div key={index} className={`flex justify-between items-start border-b border-white/5 pb-4 relative ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                                    {isEditing && (
                                                        <div className="absolute -left-12 top-0">
                                                            <MenuItemControls
                                                                onDelete={() => onDeleteMenuItem?.('drink', 'shochu', index)}
                                                                isSoldOut={isSoldOut}
                                                                onToggleSoldOut={() => onTextChange?.('drink', `shochu_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                                isHidden={isHidden}
                                                                onToggleHidden={() => onTextChange?.('drink', `shochu_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold flex items-center gap-2">
                                                            <InlineEditableText
                                                                value={name_en}
                                                                onChange={(val) => onTextChange?.('drink', `shochu_${index}_name_en`, val)}
                                                                isEditing={isEditing}
                                                            />
                                                            {isSoldOut && <span className="bg-[#d4183d] text-white text-[10px] px-1.5 py-0.5 rounded uppercase">Sold Out</span>}
                                                            {isEditing && isHidden && <EyeOff size={12} className="text-gray-400" />}
                                                        </h4>
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="text-xs text-gray-400 font-medium">
                                                                <InlineEditableText
                                                                    value={name_ko}
                                                                    onChange={(val) => onTextChange?.('drink', `shochu_${index}_name_ko`, val)}
                                                                    isEditing={isEditing}
                                                                />
                                                            </p>
                                                            <p className="text-xs text-gray-400 font-medium opacity-80">
                                                                <InlineEditableText
                                                                    value={name_zh}
                                                                    onChange={(val) => onTextChange?.('drink', `shochu_${index}_name_zh`, val)}
                                                                    isEditing={isEditing}
                                                                />
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-[#deb55a] font-bold text-right ml-4">
                                                        ¥<InlineEditableText
                                                            value={price}
                                                            onChange={(val) => onTextChange?.('drink', `shochu_${index}_price`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                    {isEditing && (
                                        <button
                                            onClick={() => onAddMenuItem?.('drink', 'shochu')}
                                            className="w-full h-12 flex items-center justify-center border-2 border-dashed border-[#deb55a]/30 rounded-lg hover:border-[#deb55a]/60 hover:bg-[#deb55a]/5 transition-all text-[#deb55a]"
                                        >
                                            <Plus size={20} strokeWidth={1} />
                                            <span className="text-sm font-bold ml-2">項目を追加</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* OTHER */}
                        <div>
                            <h3 className="text-2xl font-bold uppercase tracking-widest text-[#deb55a] border-b border-[#deb55a]/30 pb-4 mb-8">SOFT DRINKS</h3>
                            <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                                {(() => {
                                    const section = textSettings.drink || {};
                                    const indices = Object.keys(section)
                                        .filter(key => key.startsWith('other_') && key.endsWith('_name'))
                                        .map(key => parseInt(key.split('_')[1]))
                                        .filter((val, i, arr) => arr.indexOf(val) === i)
                                        .sort((a, b) => a - b);

                                    return indices.map(index => {
                                        const name_en = section[`other_${index}_name_en`] || section[`other_${index}_name`] || '';
                                        const name_ko = section[`other_${index}_name_ko`] || '';
                                        const name_zh = section[`other_${index}_name_zh`] || '';
                                        const price = section[`other_${index}_price`] || '0';
                                        const isSoldOut = section[`other_${index}_soldOut`] === 'true';
                                        const isHidden = section[`other_${index}_hidden`] === 'true';

                                        if (!isEditing && isHidden) return null;

                                        return (
                                            <div key={index} className={`flex justify-between items-start border-b border-white/5 pb-4 relative ${isSoldOut ? 'menu-item-sold-out' : ''} ${isEditing && isHidden ? 'menu-item-hidden-editor' : ''}`}>
                                                {isEditing && (
                                                    <div className="absolute -left-12 top-0">
                                                        <MenuItemControls
                                                            onDelete={() => onDeleteMenuItem?.('drink', 'other', index)}
                                                            isSoldOut={isSoldOut}
                                                            onToggleSoldOut={() => onTextChange?.('drink', `other_${index}_soldOut`, isSoldOut ? 'false' : 'true')}
                                                            isHidden={isHidden}
                                                            onToggleHidden={() => onTextChange?.('drink', `other_${index}_hidden`, isHidden ? 'false' : 'true')}
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-1">
                                                    <h4 className="font-bold flex items-center gap-2">
                                                        <InlineEditableText
                                                            value={name_en}
                                                            onChange={(val) => onTextChange?.('drink', `other_${index}_name_en`, val)}
                                                            isEditing={isEditing}
                                                        />
                                                        {isSoldOut && <span className="bg-[#d4183d] text-white text-[10px] px-1.5 py-0.5 rounded uppercase">Sold Out</span>}
                                                        {isEditing && isHidden && <EyeOff size={12} className="text-gray-400" />}
                                                    </h4>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-xs text-gray-400 font-medium">
                                                            <InlineEditableText
                                                                value={name_ko}
                                                                onChange={(val) => onTextChange?.('drink', `other_${index}_name_ko`, val)}
                                                                isEditing={isEditing}
                                                            />
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-medium opacity-80">
                                                            <InlineEditableText
                                                                value={name_zh}
                                                                onChange={(val) => onTextChange?.('drink', `other_${index}_name_zh`, val)}
                                                                isEditing={isEditing}
                                                            />
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-[#deb55a] font-bold text-right ml-4">
                                                    ¥<InlineEditableText
                                                        value={price}
                                                        onChange={(val) => onTextChange?.('drink', `other_${index}_price`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                {isEditing && (
                                    <button
                                        onClick={() => onAddMenuItem?.('drink', 'other')}
                                        className="w-full h-12 flex items-center justify-center border-2 border-dashed border-[#deb55a]/30 rounded-lg hover:border-[#deb55a]/60 hover:bg-[#deb55a]/5 transition-all text-[#deb55a]"
                                    >
                                        <Plus size={20} strokeWidth={1} />
                                        <span className="text-sm font-bold ml-2">項目を追加</span>
                                    </button>
                                )}
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
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-12 text-[#1C1C1C] uppercase">ACCESS</h2>
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-8 text-lg text-[#1C1C1C]">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-[#deb55a] shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold">160-0021</p>
                                    <p>GEST34 Bldg 4F, 2-45-16 Kabukicho,</p>
                                    <p>Shinjuku-ku, Tokyo</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="text-[#deb55a]" />
                                <p>03-6302-1477</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Clock className="text-[#deb55a]" />
                                <p>OPEN : 18:00 - 24:00</p>
                            </div>
                            <a href="https://maps.app.goo.gl/yC8c23nWvXpjYmoXA" target="_blank" className="inline-block px-8 py-3 bg-[#1C1C1C] text-white rounded hover:bg-[#deb55a] transition-colors font-bold uppercase tracking-wider">Open in Google Maps</a>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-2xl">
                            <ImageWithFallback src="/assets/access_map.jpg" alt="Map" className="w-full h-auto" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Affiliated Store Section */}
            <section id="affiliated" className="py-20 bg-[#1C1C1C] relative overflow-hidden">
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
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 text-[#fcebc5] uppercase">Affiliated store of KABUKI SUSHI</h2>
                    <p className="text-center text-xl mb-12 text-gray-400 italic uppercase">Sister Stores</p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#271c02] rounded-lg p-6 border border-[#deb55a]/30">
                            <ImageWithFallback src="/assets/honten_card_new.jpg" alt="KABUKI Sushi Main Store" className="w-full aspect-[3/2] object-cover rounded-lg mb-6" />
                            <h3 className="text-2xl font-bold mb-4 text-[#fcebc5] uppercase font-archivo">■KABUKI Sushi Main Store</h3>
                            <div className="space-y-2 text-gray-300 font-archivo">
                                <p>Eco Place Shinjuku 1F, 2-25-8 Kabukicho, Shinjuku-ku, Tokyo</p>
                                <p>TEL：03-6457-6612 | OPEN：18:00-4:00</p>
                                <p>Gluten-free options available</p>
                            </div>
                        </div>

                        <div className="bg-[#271c02] rounded-lg p-6 border border-[#deb55a]/30">
                            <ImageWithFallback src="/assets/soba_card_new.jpg" alt="KABUKI SOBA" className="w-full aspect-[3/2] object-cover rounded-lg mb-6" />
                            <h3 className="text-2xl font-bold mb-4 text-[#fcebc5] uppercase font-archivo">■KABUKI SOBA</h3>
                            <div className="space-y-2 text-gray-300 font-archivo">
                                <p>Lee2 Bldg 1F, 2-27-12 Kabukicho, Shinjuku-ku, Tokyo</p>
                                <p>TEL：03-6457-3112 | OPEN：19:00-6:00</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 rounded-lg overflow-hidden shadow-2xl max-w-4xl mx-auto">
                        <ImageWithFallback src="/assets/affiliated_map.jpg" alt="Stores Map" className="w-full h-auto" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1C1C1C] py-16 border-t border-[#deb55a]/20">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <div className="flex justify-center gap-6 mb-10">
                        <a href="https://www.instagram.com/kabukizushi_ichiban" target="_blank" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#deb55a] text-white transition-all"><Instagram /></a>
                        <a href="https://www.tiktok.com/@kabukisushi1" target="_blank" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#deb55a] text-white transition-all"><Music2 /></a>
                        <a href="https://www.facebook.com/profile.php?id=100068484907117" target="_blank" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#deb55a] text-white transition-all"><Facebook /></a>
                        <a href="https://www.youtube.com/@KABUKI-ev3sy" target="_blank" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#deb55a] text-white transition-all"><Youtube /></a>
                        <a href="https://maps.app.goo.gl/yC8c23nWvXpjYmoXA" target="_blank" className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#deb55a] text-white transition-all"><LinkIcon /></a>
                    </div>
                    <div className="flex flex-col items-center gap-4 mb-10 text-[#e8eaec]">
                        <div className="flex items-center gap-2">
                            <Phone size={18} className="text-[#deb55a]" />
                            <span className="text-xl font-bold tracking-widest">0363021477</span>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm tracking-widest uppercase">Restaurant © 2019</p>
                </div>
            </footer>
        </div>
    );
}
