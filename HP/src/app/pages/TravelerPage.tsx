import { useState, useEffect } from 'react';
import { Menu, X, MapPin, Phone, Clock, Image as ImageIcon, Layout, Settings2, ChevronDown, ArrowUpToLine, ArrowDownToLine, AlignCenterVertical, RotateCcw, Instagram, Music2, Facebook, Youtube, Link as LinkIcon, Globe } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { BackgroundConfig, LayoutConfig } from '../admin/pages/EditorPage';

interface TravelerPageProps {
    isEditing?: boolean;
    onSectionSelect?: (id: string) => void;
    onBackgroundEdit?: (id: string) => void;
    activeSection?: string;
    backgroundSettings?: Record<string, BackgroundConfig>;
    layoutSettings?: Record<string, LayoutConfig>;
    onLayoutChange?: (sectionId: string, config: Partial<LayoutConfig>) => void;
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

export function TravelerPage({ isEditing = false, onSectionSelect, onBackgroundEdit, activeSection, backgroundSettings: propBackgroundSettings, layoutSettings: propLayoutSettings, onLayoutChange }: TravelerPageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [localBackgroundSettings, setLocalBackgroundSettings] = useState<Record<string, BackgroundConfig> | undefined>(undefined);
    const [localLayoutSettings, setLocalLayoutSettings] = useState<Record<string, LayoutConfig> | undefined>(undefined);

    const backgroundSettings = propBackgroundSettings || (localBackgroundSettings ? { ...DEFAULT_BACKGROUND_SETTINGS, ...localBackgroundSettings } : DEFAULT_BACKGROUND_SETTINGS);
    const layoutSettings = propLayoutSettings || (localLayoutSettings ? { ...DEFAULT_LAYOUT_SETTINGS, ...localLayoutSettings } : DEFAULT_LAYOUT_SETTINGS);

    useEffect(() => {
        if (!isEditing) {
            const savedBackgrounds = localStorage.getItem('site_background_settings_traveler');
            const savedLayouts = localStorage.getItem('site_layout_settings_traveler');
            if (savedBackgrounds) try { setLocalBackgroundSettings(JSON.parse(savedBackgrounds)); } catch (e) { }
            if (savedLayouts) try { setLocalLayoutSettings(JSON.parse(savedLayouts)); } catch (e) { }
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
            <section id="gallery" className="py-20 bg-[#E8EAEC]">
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
            <section className="py-20 bg-[#1C1C1C] text-white">
                <div className={`mx-auto ${getContainerWidthClass('menu')}`}>
                    <div className="mt-24">
                        <h3 className="text-4xl text-center mb-1 font-bold italic uppercase">Special Menu</h3>
                        <h3 className="text-6xl text-center mb-2 font-extrabold italic uppercase">NIGIRI</h3>
                        <p className="text-center text-2xl text-[#fcebc5] italic font-bold mb-16">Kindly order at least 5 items per person</p>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                            {[
                                { name_en: 'Lean Tuna', name_ko: '다랑어붉은살', name_zh: '鮪魚（魚身瘦肉部分）', price: '550yen', image: '/assets/nigiri_akami.jpg' },
                                { name_en: 'Chutoro', name_sub: '(medium fatty tuna)', name_ko: '다랑어중뱃살', name_zh: '鮪魚（油脂中等部位）', price: '780yen', image: '/assets/nigiri_chutoro.jpg' },
                                { name_en: 'Otoro', name_sub: '(super fatty tuna)', name_ko: '다랑어대뱃살', name_zh: '鮪魚（油脂較多部位）', price: '880yen', image: '/assets/nigiri_otoro.jpg' },
                                { name_en: 'Seared Otoro', name_ko: '다랑어대뱃살구이', name_zh: '炙燒鮪魚（油脂較多部位）', price: '880yen', image: '/assets/nigiri_otoroaburi.jpg' },
                                { name_en: 'Tuna And Sea Grapes Hand Roll', name_ko: '바다 포도 참치 손말이', name_zh: '海葡萄金槍魚手卷', price: '880yen', image: '/assets/nigiri_budo_toro_maki.jpg' },
                                { name_en: 'Snapper', name_ko: '도미', name_zh: '鯛魚', price: '480yen', image: '/assets/nigiri_tai.jpg' },
                                { name_en: 'Spanish Mackerel', name_ko: '삼치', name_zh: '鰆魚', price: '550yen', image: '/assets/nigiri_sawara.jpg' },
                                { name_en: 'Yellow Tail', name_ko: '방어', name_zh: '鰤魚', price: '550yen', image: '/assets/nigiri_buri.jpg' },
                                { name_en: 'Horse Mackerel', name_sub: '(Aji)', name_ko: '전갱이', name_zh: '竹莢魚', price: '450yen', image: '/assets/nigiri_aji.jpg' },
                                { name_en: 'Salmon', name_ko: '연어', name_zh: '鮭魚', price: '450yen', image: '/assets/nigiri_samon.jpg' },
                                { name_en: 'Seared Salmon', name_ko: '구운 연어', name_zh: '炙燒鮭魚', price: '450yen', image: '/assets/nigiri_aburisamon.jpg' },
                                { name_en: 'Japanese Tiger Prawn', name_ko: '왕새우', name_zh: '車海老', price: '980yen', image: '/assets/nigiri_ebi.jpg' },
                                { name_en: 'Fried Japanese Tiger Prawn', name_ko: '새우튀김', name_zh: '炸车海虾', price: '1300yen', image: '/assets/nigiri_ebidokku.jpeg' },
                                { name_en: 'Shrimp', name_ko: '새우', name_zh: '蝦子', price: '480yen', image: '/assets/nigiri_ebiduke.jpg' },
                                { name_en: 'Squid', name_ko: '뼈오징어', name_zh: '墨水烏賊', price: '550yen', image: '/assets/nigiri_ika.jpg' },
                                { name_en: 'Octopus', name_ko: '문어', name_zh: '章魚', price: '550yen', image: '/assets/nigiri_tako.jpg' },
                                { name_en: 'Scallop', name_sub: '(Hotate)', name_ko: '가리비', name_zh: '扇貝', price: '600yen', image: '/assets/nigiri_hotate.jpg' },
                                { name_en: 'Ark Shell', name_ko: '홍합', name_zh: '红贝', price: '850yen', image: '/assets/nigiri_akagai.jpg' },
                                { name_en: 'Seared Flounder Fin', name_ko: '광어 지느러미', name_zh: '鳍边肉', price: '550yen', image: '/assets/nigiri_engawa.jpg' },
                                { name_en: 'Eel', name_sub: '(Unagi)', name_ko: '장어', name_zh: '鳗', price: '700yen', image: '/assets/nigiri_unagi.jpg' },
                                { name_en: 'Conger Eel', name_ko: '홀자', name_zh: '星鳗', price: '680yen', image: '/assets/nigiri_anago.jpg' },
                                { name_en: 'Blackthroat Seaperch', name_ko: '눈볼대', name_zh: '红喉鱼', price: '900yen', image: '/assets/nigiri_nodogurodokku.jpg' },
                                { name_en: 'Cutlassfish', name_ko: '갈치', name_zh: '刀鱼', price: '700yen', image: '/assets/nigiri_tachiuodokku.jpg' },
                                { name_en: 'Tobiko', name_sub: '(flying fish roe)', name_ko: '날치알', name_zh: '飛魚卵', price: '400yen', image: '/assets/nigiri_tobikko.jpg' },
                                { name_en: 'Shirako gunkan', name_sub: '(Cod milt)', name_ko: '곤이', name_zh: '鱼白', price: '550yen', image: '/assets/nigiri_shirako.jpg' },
                                { name_en: 'Ikura', name_sub: '(Salmon roe)', name_ko: '연어알', name_zh: '鮭魚卵', price: '600yen', image: '/assets/nigiri_ikura.jpg' },
                                { name_en: 'Tamago', name_sub: '(Japanese Omelet)', name_ko: '달걀', name_zh: '鸡蛋', price: '350yen', image: '/assets/nigiri_tamago.jpg' },
                                { name_en: 'Green Onion Shoots', name_ko: '싹눈파', name_zh: '嫩葱', price: '350yen', image: '/assets/nigiri_menegi.jpg' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-4">
                                    <ImageWithFallback src={item.image} alt={item.name_en} className="w-full aspect-[4/3] object-cover rounded shadow-lg" />
                                    <div className="space-y-1">
                                        <p className="text-[#d4183d] bg-white inline-block px-2 py-0.5 font-bold mb-2">{item.price}</p>
                                        <h4 className="text-xl font-bold leading-tight uppercase font-archivo">{item.name_en}</h4>
                                        {item.name_sub && <p className="text-sm italic text-gray-200">{item.name_sub}</p>}
                                        <p className="text-sm font-medium">{item.name_ko}</p>
                                        <p className="text-sm font-medium opacity-80">{item.name_zh}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MAKIMONO Section */}
                        <div className="mb-24">
                            <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 uppercase">MAKIMONO</h3>
                            <p className="text-center text-gray-200 mb-12 uppercase italic">Rolls</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[
                                    { name_en: 'Tuna And Pickled Radish Sushi Roll', name_ko: '도로 타쿠 김밥', name_zh: '鮪魚腌萝卜卷', price: '1200yen', image: '/assets/makimono_torotaku.jpg' },
                                    { name_en: 'Tuna And Green Onion Sushi Roll', name_ko: '네기토로 김밥', name_zh: '葱鮪鱼卷', price: '1200yen', image: '/assets/makimono_negitoro.jpg' },
                                    { name_en: 'Tuna Sushi Roll', name_ko: '참치 김밥', name_zh: '铁火卷（新鲜金枪鱼卷）', price: '1200yen', image: '/assets/makimono_tekka.jpg' },
                                    { name_en: 'Cucumber Sushi Roll', name_ko: '오이 김밥', name_zh: '河童卷（小黄瓜寿司卷）', price: '650yen', image: '/assets/makimono_kappa.jpg' },
                                    { name_en: 'Kanpyo Sushi Roll', name_ko: '나나시 김밥', name_zh: '瓠瓜干寿司卷', price: '650yen', image: '/assets/makimono_kanpyou.jpg' },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-4">
                                        <ImageWithFallback src={item.image} alt={item.name_en} className="w-full aspect-[4/3] object-cover rounded shadow-lg" />
                                        <div className="space-y-1">
                                            <p className="text-[#d4183d] bg-white inline-block px-2 py-0.5 font-bold mb-2">{item.price}</p>
                                            <h4 className="text-xl font-bold uppercase font-archivo">{item.name_en}</h4>
                                            <p className="text-sm font-medium">{item.name_ko}</p>
                                            <p className="text-sm font-medium opacity-80">{item.name_zh}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* IPPIN Section */}
                        <div className="mb-24">
                            <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 uppercase">IPPIN</h3>
                            <p className="text-center text-gray-200 mb-12 uppercase italic">A La Carte</p>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[
                                    { name_en: 'Miso Soup', name_ko: '된장국', name_zh: '味噌汤', price: '350yen', image: '/assets/ippin_misoshiru.jpg' },
                                    { name_en: 'Steamed Egg (Chawan-mushi)', name_ko: '차완무시', name_zh: '茶碗蒸', price: '650yen', image: '/assets/ippin_chawanmushi.jpg' },
                                    { name_en: '6 Kinds of Sashimi', name_ko: '사시미 5가지 모듬', name_zh: '生鱼片什锦拼盘', price: '2000yen', note: '※We can also accommodate other requests such as 3 servings of lean meat only, 2 servings of 3 types of chef\'s choice, etc. Please feel free to ask.', image: '/assets/ippin_sashimori.jpg' },
                                    { name_en: 'Crab', name_ko: '게', name_zh: '蟹', price: '980yen', image: '/assets/ippin_kanitsuami.jpg' },
                                    { name_en: 'Shirako (With Ponzu or Tempura)', name_ko: '흰자', name_zh: '白子', price: '1300yen', image: '/assets/ippin_shirapon.jpg' },
                                    { name_en: 'Oyster', name_ko: '진주 굴', name_zh: '盐牡蛎', price: '750yen', image: '/assets/ippin_namagaki.jpg' },
                                    { name_en: 'Seafood Yukhoe', name_ko: '해산물 육회', name_zh: '海鲜生鱼片', price: '980yen', image: '/assets/ippin_kaisenyukke.jpg' },
                                    { name_en: 'Grilled Bluefin Tuna Collar', name_ko: '참치 카마 구이', name_zh: '烤金枪鱼领肉', price: '3200yen', image: '/assets/ippin_kamayai.jpg' },
                                    { name_en: 'Grilled Salmon Belly', name_ko: '연어 배 구이', name_zh: '烤三文鱼腩', price: '1800yen', image: '/assets/ippin_harasuyaki.jpg' },
                                    { name_en: 'Grilled Cutlassfish', name_ko: '갈치', name_zh: '刀鱼', price: '980yen', image: '/assets/ippin_tachiuoyaki.jpg' },
                                    { name_en: 'Tamago (Japanese Omelet)', name_ko: '달걀', name_zh: '鸡蛋', price: '680yen', image: '/assets/ippin_tsumatama.jpg' },
                                    { name_en: 'Mochi with icecream', name_ko: '', name_zh: '', price: '500yen', image: '/assets/ippin_ice.jpg' },
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col gap-4">
                                        <ImageWithFallback src={item.image} alt={item.name_en} className="w-full aspect-[4/3] object-cover rounded shadow-lg" />
                                        <div className="space-y-1">
                                            <p className="text-[#d4183d] bg-white inline-block px-2 py-0.5 font-bold mb-2">{item.price}</p>
                                            <h4 className="text-xl font-bold uppercase font-archivo">{item.name_en}</h4>
                                            <p className="text-sm font-medium">{item.name_ko}</p>
                                            <p className="text-sm font-medium opacity-80">{item.name_zh}</p>
                                            {item.note && <p className="text-xs text-gray-200 mt-2 italic">{item.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DRINK Section */}
            <section id="drink" className="py-20 bg-white text-[#1C1C1C]">
                <div className="max-w-4xl mx-auto px-4">
                    <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-12 uppercase">Drink</h3>

                    <div className="max-w-4xl mx-auto space-y-12">
                        {/* ALCOHOL Section */}
                        <div>
                            <h4 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-6 uppercase">ALCOHOL</h4>
                            <ul className="space-y-4 font-archivo">
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">DRAFT BEER 생맥주 生啤酒</p>
                                            <p className="text-sm text-gray-600">(SUNTORY THE PREMIUM MALTS)</p>
                                        </div>
                                        <span className="font-bold">880YEN</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">BOTTLED BEER 병맥주 瓶装啤酒</p>
                                            <p className="text-sm text-gray-600">(SAPPORO LAGER BEER 500ml)</p>
                                        </div>
                                        <span className="font-bold">900YEN</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">PREMIUM JAPANESE WHISKY 일본 위스키 日本威士忌</p>
                                            <p className="text-sm text-gray-600 ml-4">-Yamazaki (山崎) <span className="font-bold">1800YEN</span></p>
                                            <p className="text-sm text-gray-600 ml-4">-Hakushu (白州) <span className="font-bold">1800YEN</span></p>
                                            <p className="text-sm text-gray-600 ml-4">-Chita (知多) <span className="font-bold">1800YEN</span></p>
                                            <p className="text-xs text-gray-500 italic mt-1">*Please choose how to drink(on the rocks/with soda/with water)</p>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex justify-between"><span>HIGHBALL 하이볼 高球酒 (SUNTORY Kaku 角)</span><span className="font-bold">770YEN</span></li>
                                <li className="flex justify-between"><span>LEMON SOUR 레몬 사와 柠檬酒</span><span className="font-bold">770YEN</span></li>
                                <li className="flex justify-between"><span>GARI SOUR/GINGER VINE/GARI 가리 사와/생강 소스 사와 雪1沙瓦1沙瓦</span><span className="font-bold">770YEN</span></li>
                                <li className="flex justify-between"><span>SNAKE WINE/Sho 뱀술 蛇酒 蛇酒</span><span className="font-bold">1000YEN</span></li>
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">PLUM WINE 매실주 梅酒</p>
                                            <p className="text-xs text-gray-500 italic">*Please choose how to drink(on the rocks/with soda/with water)</p>
                                        </div>
                                        <span className="font-bold">880YEN</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">YUZU WINE 유자주 柚子酒</p>
                                            <p className="text-xs text-gray-500 italic">*Please choose how to drink(on the rocks/with soda/with water)</p>
                                        </div>
                                        <span className="font-bold">880YEN</span>
                                    </div>
                                </li>
                                <li className="flex justify-between"><span>SWEET POTATO SHOCHU 고구마소주 地瓜烧酒</span><span className="font-bold">880YEN</span></li>
                                <li className="flex justify-between"><span>BARLEY SHOCHU 보리소주 麦烧酒</span><span className="font-bold">880YEN</span></li>
                                <li className="flex justify-between"><span>RICE SHOCHU 쌀소주 米烧酒</span><span className="font-bold">880YEN</span></li>
                            </ul>
                        </div>

                        {/* JAPANESE SAKE Section */}
                        <div>
                            <h4 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-6 uppercase">JAPANESE SAKE</h4>
                            <ul className="space-y-3 font-archivo">
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">JAPANESE SAKE (Pot of 180ml) 일본주 日本酒</p>
                                            <p className="text-xs text-gray-500 italic">※Today's recommendations.</p>
                                        </div>
                                        <span className="font-bold">1500~2000YEN</span>
                                    </div>
                                </li>
                                <li className="flex justify-between"><span>PREMIUM JAPANESE SAKE (Pot of 180ml)</span><span className="font-bold">3500〜YEN</span></li>
                                <li className="flex justify-between"><span>GLASS OF WINE (Red/White)</span><span className="font-bold">1000〜1300YEN</span></li>
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">BOTTLE OF WINE</p>
                                            <p className="text-sm text-gray-600">WHITE　Vermentino Guado al Tasso</p>
                                        </div>
                                        <span className="font-bold">10000YEN</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">BOTTLE OF CHAMPAGNE</p>
                                            <p className="text-sm text-gray-600">Perrier Jouët Grand Brut</p>
                                        </div>
                                        <span className="font-bold">25000YEN</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* ALCOHOL-FREE Section */}
                        <div>
                            <h4 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-6 uppercase">ALCOHOL-FREE</h4>
                            <ul className="space-y-3 font-archivo">
                                <li className="flex justify-between"><span>OOLONG TEA 우롱차 乌龙茶</span><span className="font-bold">500YEN</span></li>
                                <li className="flex justify-between"><span>GREEN TEA 녹차 绿茶</span><span className="font-bold">500YEN</span></li>
                                <li className="flex justify-between"><span>JASMINE TEA 재스민차 茉莉花茶</span><span className="font-bold">500YEN</span></li>
                                <li className="flex justify-between"><span>COKE 콜라/코카콜라 可口可乐</span><span className="font-bold">500YEN</span></li>
                                <li className="flex justify-between"><span>SPARKLING WATER 탄산수 碳酸水</span><span className="font-bold">500YEN</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Access Section */}
            < section id="access" className="py-20 bg-white" >
                <div className="max-w-6xl mx-auto px-4">
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
            </section >

            {/* Affiliated Store Section */}
            < section id="affiliated" className="py-20 bg-[#1C1C1C]" >
                <div className="max-w-6xl mx-auto px-4">
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 text-[#fcebc5] uppercase">Affiliated store of KABUKI SUSHI</h2>
                    <p className="text-center text-xl mb-12 text-gray-400 italic uppercase">Sister Stores</p>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#271c02] rounded-lg p-6 border border-[#deb55a]/30">
                            <ImageWithFallback src="/assets/honten_card_new.jpg" alt="KABUKI寿司 本店" className="w-full aspect-[3/2] object-cover rounded-lg mb-6" />
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
            </section >

            {/* Footer */}
            < footer className="bg-[#1C1C1C] py-16 border-t border-[#deb55a]/20" >
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
            </footer >
        </div >
    );
}
