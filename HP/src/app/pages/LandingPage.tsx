import { useState, useEffect, useRef } from 'react';
import { Menu, X, MapPin, Phone, Clock, Image as ImageIcon, Layout, Settings2, ChevronDown, ArrowUpToLine, ArrowDownToLine, AlignCenter, AlignCenterVertical, RotateCcw, Instagram, Music2, Facebook, Youtube, Link as LinkIcon, FileText } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { BackgroundConfig, LayoutConfig } from '../admin/pages/EditorPage';

interface LandingPageProps {
    isEditing?: boolean;
    onSectionSelect?: (id: string) => void;
    onBackgroundEdit?: (id: string) => void;
    onTextEdit?: (id: string) => void;
    onTextChange?: (sectionId: string, field: string, value: string) => void;
    onTextReset?: (sectionId: string) => void;
    onAddMenuItem?: (sectionId: string, category: 'nigiri' | 'makimono' | 'ippin') => void;
    onDeleteMenuItem?: (sectionId: string, category: string, index: number) => void;
    activeSection?: string;
    backgroundSettings?: Record<string, BackgroundConfig>;
    layoutSettings?: Record<string, LayoutConfig>;
    textSettings?: Record<string, Record<string, string>>;
    onLayoutChange?: (sectionId: string, config: Partial<LayoutConfig>) => void;
    onMenuImageEdit?: (sectionId: string, category: string, index: number) => void;
}



const DEFAULT_BACKGROUND_SETTINGS: Record<string, BackgroundConfig> = {
    home: { type: 'image', value: '/assets/home_hero_new.jpg' },
    about: { type: 'color', value: '#ffffff', textTheme: 'dark' },
    gallery: { type: 'color', value: '#E8EAEC' },
    access: { type: 'image', value: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=1080' },
    menu: { type: 'color', value: '#f5f5f5' },
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

export const DEFAULT_TEXT_SETTINGS: Record<string, Record<string, string>> = {
    home: {
        title: 'KABUKI寿司',
        subtitle: '1番通り店'
    },
    about: {
        title: 'ABOUT US',
        content: 'KABUKI寿司の2号店となる 「KABUKI寿司 1番通り店」 をオープンいたしました。\n\n1番通り店では、これまでの伝統を受け継ぎながらも、さらなる進化を目指しています。\n\n店主を務めるのは、新進気鋭の若手寿司職人増田。\n\n繊細な技術と斬新なアイデアで、新しい「KABUKI寿司」の世界を皆さまにお届けいたします。\n\nお店の特徴の一つは、カウンター付きの個室です。職人の技を間近で堪能しながら、ゆったりとしたプライベート空間でお食事をお楽しみいただけます。特別な日のお祝いから接待まで、幅広いシーンでご利用いただけます。\n\n伝統と革新が融合したKABUKI寿司 1番通り店で、特別なひとときをお過ごしください。'
    },
    gallery: {
        title: 'Gallery',
        subtitle: 'Photos from our restaurant.'
    },
    access: {
        title: 'ACCESS',
        zip: '〒160-0021',
        address: '東京都新宿区歌舞伎町2丁目45−16',
        building: 'GEST34ビル4F',
        phone: '03-6302-1477',
        hours: 'OPEN : 18:00-24:00'
    },
    menu: {
        title: 'Menu',
        subtitle: 'Course',
        description: 'まずは当店お勧めのコースからお選びください',
        nigiri_title: 'NIGIRI',
        nigiri_subtitle: 'Fish in Season',
        nigiri_description: '季節の魚',
        makimono_title: 'MAKIMONO',
        makimono_subtitle: '巻物',
        ippin_title: 'IPPIN',
        ippin_subtitle: '一品料理',
        // NIGIRI items
        nigiri_0_name: '赤身', nigiri_0_price: '550', nigiri_0_image: '/assets/nigiri_akami.jpg',
        nigiri_1_name: '中トロ', nigiri_1_price: '780', nigiri_1_image: '/assets/nigiri_chutoro.jpg',
        nigiri_2_name: '大トロ', nigiri_2_price: '880', nigiri_2_image: '/assets/nigiri_otoro.jpg',
        nigiri_3_name: '大トロ炙り', nigiri_3_price: '880', nigiri_3_image: '/assets/nigiri_otoroaburi.jpg',
        nigiri_4_name: '海ぶどうトロ手巻き', nigiri_4_price: '880', nigiri_4_image: '/assets/nigiri_budo_toro_maki.jpg',
        nigiri_5_name: 'タイ', nigiri_5_price: '480', nigiri_5_image: '/assets/nigiri_tai.jpg',
        nigiri_6_name: 'サワラ', nigiri_6_price: '550', nigiri_6_image: '/assets/nigiri_sawara.jpg',
        nigiri_7_name: 'ブリ', nigiri_7_price: '550', nigiri_7_image: '/assets/nigiri_buri.jpg',
        nigiri_8_name: 'アジ', nigiri_8_price: '450', nigiri_8_image: '/assets/nigiri_aji.jpg',
        nigiri_9_name: 'サーモン', nigiri_9_price: '450', nigiri_9_image: '/assets/nigiri_samon.jpg',
        nigiri_10_name: '炙りサーモン', nigiri_10_price: '450', nigiri_10_image: '/assets/nigiri_aburisamon.jpg',
        nigiri_11_name: '車海老', nigiri_11_price: '980', nigiri_11_image: '/assets/nigiri_ebi.jpg',
        nigiri_12_name: '車海老カダイフ揚げ', nigiri_12_price: '1300', nigiri_12_image: '/assets/nigiri_ebidokku.jpeg',
        nigiri_13_name: '生海老漬け', nigiri_13_price: '480', nigiri_13_image: '/assets/nigiri_ebiduke.jpg',
        nigiri_14_name: 'イカ', nigiri_14_price: '550', nigiri_14_image: '/assets/nigiri_ika.jpg',
        nigiri_15_name: '水タコ', nigiri_15_price: '550', nigiri_15_image: '/assets/nigiri_tako.jpg',
        nigiri_16_name: 'ホタテ', nigiri_16_price: '600', nigiri_16_image: '/assets/nigiri_hotate.jpg',
        nigiri_17_name: '赤貝', nigiri_17_price: '850', nigiri_17_image: '/assets/nigiri_akagai.jpg',
        nigiri_18_name: 'えんがわ', nigiri_18_price: '550', nigiri_18_image: '/assets/nigiri_engawa.jpg',
        nigiri_19_name: 'ウナギドック', nigiri_19_price: '680', nigiri_19_image: '/assets/nigiri_unagi.jpg',
        nigiri_20_name: '穴子', nigiri_20_price: '680', nigiri_20_image: '/assets/nigiri_anago.jpg',
        nigiri_21_name: 'ノドグロドック', nigiri_21_price: '900', nigiri_21_image: '/assets/nigiri_nodogurodokku.jpg',
        nigiri_22_name: 'タチウオドック', nigiri_22_price: '700', nigiri_22_image: '/assets/nigiri_tachiuodokku.jpg',
        nigiri_23_name: 'とびっこ', nigiri_23_price: '400', nigiri_23_image: '/assets/nigiri_tobikko.jpg',
        nigiri_24_name: '白子軍艦', nigiri_24_price: '550', nigiri_24_image: '/assets/nigiri_shirako.jpg',
        nigiri_25_name: 'いくら', nigiri_25_price: '600', nigiri_25_image: '/assets/nigiri_ikura.jpg',
        nigiri_26_name: '玉子', nigiri_26_price: '350', nigiri_26_image: '/assets/nigiri_tamago.jpg',
        nigiri_27_name: '芽ネギ', nigiri_27_price: '350', nigiri_27_image: '/assets/nigiri_menegi.jpg',
        // MAKIMONO items
        makimono_0_name: 'トロたく巻き', makimono_0_price: '1200', makimono_0_image: '/assets/makimono_torotaku.jpg',
        makimono_1_name: 'ネギトロ巻き', makimono_1_price: '1000', makimono_1_image: '/assets/makimono_negitoro.jpg',
        makimono_2_name: '鉄火巻き', makimono_2_price: '1200', makimono_2_image: '/assets/makimono_tekka.jpg',
        makimono_3_name: 'カッパ巻き', makimono_3_price: '650', makimono_3_image: '/assets/makimono_kappa.jpg',
        makimono_4_name: 'かんぴょう巻き', makimono_4_price: '650', makimono_4_image: '/assets/makimono_kanpyou.jpg',
        // IPPIN items
        ippin_0_name: '味噌汁', ippin_0_price: '350', ippin_0_image: '/assets/ippin_misoshiru.jpg',
        ippin_1_name: '茶碗蒸し', ippin_1_price: '650', ippin_1_image: '/assets/ippin_chawanmushi.jpg',
        ippin_2_name: '刺身盛り合わせ', ippin_2_price: '2000', ippin_2_note: '※その他(赤身だけ3人前、おまかせ3種類2人前)など、お客様のご要望あれば、お気軽にお申し付けください。', ippin_2_image: '/assets/ippin_sashimori.jpg',
        ippin_3_name: 'カニつまみ', ippin_3_price: '980', ippin_3_image: '/assets/ippin_kanitsuami.jpg',
        ippin_4_name: '白子（ポン酢・天ぷら）', ippin_4_price: '1300', ippin_4_image: '/assets/ippin_shirapon.jpg',
        ippin_5_name: '生牡蠣', ippin_5_price: '750', ippin_5_image: '/assets/ippin_namagaki.jpg',
        ippin_6_name: '海鮮ユッケ', ippin_6_price: '980', ippin_6_image: '/assets/ippin_kaisenyukke.jpg',
        ippin_7_name: 'マグロカマ焼き', ippin_7_price: '3200', ippin_7_image: '/assets/ippin_kamayai.jpg',
        ippin_8_name: 'サーモンハラス焼き', ippin_8_price: '1800', ippin_8_image: '/assets/ippin_harasuyaki.jpg',
        ippin_9_name: 'タチウオ塩焼き', ippin_9_price: '980', ippin_9_image: '/assets/ippin_tachiuoyaki.jpg',
        ippin_10_name: 'つまみ玉子', ippin_10_price: '680', ippin_10_image: '/assets/ippin_tsumatama.jpg',
        ippin_11_name: '大福アイス', ippin_11_price: '580', ippin_11_image: '/assets/ippin_ice.jpg'
    },
    affiliated: {
        title: 'Affiliated store of KABUKI SUSHI',
        subtitle: '姉妹店',
        store1_name: 'KABUKI寿司 本店',
        store1_address: '〒160-0021 東京都新宿区歌舞伎町2丁目25-8 エコプレイス新宿1F',
        store1_phone: 'TEL：03-6457-6612',
        store1_hours: 'OPEN：18:00-4:00',
        store1_note: 'グルテンフリー対応可',
        store2_name: 'KABUKI SOBA',
        store2_address: '〒160-0021 東京都新宿区歌舞伎町２丁目２７ １２Lee２ビル １F',
        store2_phone: 'TEL：03-6457-3112',
        store2_hours: 'OPEN：19:00-6:00'
    }
};

interface InlineEditableTextProps {
    value: string;
    onChange: (newValue: string) => void;
    isEditing: boolean;
    className?: string;
    style?: React.CSSProperties;
    multiline?: boolean;
    placeholder?: string;
}

function InlineEditableText({ value, onChange, isEditing, className = '', style, multiline = false, placeholder = '' }: InlineEditableTextProps) {
    const [isFocused, setIsFocused] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync ref value with prop value only when not focused
    useEffect(() => {
        if (editorRef.current && !isFocused) {
            editorRef.current.innerHTML = value || (isFocused ? '' : placeholder);
        }
    }, [value, isFocused, placeholder]);

    if (!isEditing) {
        return (
            <span
                className={className}
                style={{ ...style, whiteSpace: multiline ? 'pre-line' : 'normal' }}
                dangerouslySetInnerHTML={{ __html: value || '' }}
            />
        );
    }

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        const newValue = e.target.innerHTML;
        // Use timeout to check if the relatedTarget is part of the toolbar
        setTimeout(() => {
            if (!document.activeElement?.closest('.inline-toolbar')) {
                setIsFocused(false);
                onChange(newValue);
            }
        }, 100);
    };

    const handleCommand = (command: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (!editorRef.current.contains(range.commonAncestorContainer)) {
                    const newRange = document.createRange();
                    newRange.selectNodeContents(editorRef.current);
                    newRange.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            }
            document.execCommand(command, false, value);
            onChange(editorRef.current.innerHTML);
        }
    };

    const WrapperElement = multiline ? 'div' : 'span';
    const EditableElement = multiline ? 'div' : 'span';

    return (
        <WrapperElement className="relative group/editable inline-block w-full">
            <EditableElement
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                className={`${className} outline-none transition-all duration-200 min-h-[1em] min-w-[20px] 
                    ${isFocused ? 'ring-2 ring-blue-500/50 bg-white/5 rounded-sm p-1 -m-1 shadow-inner relative z-30' : 'hover:bg-white/5 rounded-sm cursor-text'}
                    ${multiline ? 'whitespace-pre-line block' : 'inline-block'}`}
                style={style}
            />

            {isFocused && (
                <div
                    className="inline-toolbar absolute -top-12 left-0 z-[100] flex items-center bg-[#1c1c1c] border border-white/10 rounded shadow-2xl p-1 gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking toolbar
                >
                    {([
                        { icon: 'B', label: '太字', command: 'bold' },
                        { icon: 'I', label: '斜体', command: 'italic' },
                        { icon: 'U', label: '下線', command: 'underline' },
                        {
                            icon: <LinkIcon size={12} />,
                            label: 'リンク',
                            onClick: () => {
                                const url = window.prompt('URLを入力してください (Enter URL):', 'https://');
                                if (url) handleCommand('createLink', url);
                            }
                        },
                        {
                            icon: <AlignCenter size={12} />,
                            label: '揃え',
                            onClick: () => {
                                const isCenter = document.queryCommandState('justifyCenter');
                                handleCommand(isCenter ? 'justifyLeft' : 'justifyCenter');
                            }
                        },
                    ] as { icon: string | React.ReactNode, label: string, command?: string, onClick?: () => void }[]).map((tool, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (tool.onClick) {
                                    tool.onClick();
                                } else if (tool.command) {
                                    handleCommand(tool.command);
                                }
                            }}
                            className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title={tool.label}
                        >
                            {typeof tool.icon === 'string' ? (
                                <span className="text-[10px] font-bold uppercase">{tool.icon}</span>
                            ) : (
                                tool.icon
                            )}
                        </button>
                    ))}
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button
                        onClick={() => {
                            if (!editorRef.current) return;

                            const selection = window.getSelection();
                            if (!selection || selection.rangeCount === 0) return;

                            let node = selection.anchorNode;
                            while (node && node !== editorRef.current) {
                                if (node.nodeType === 1) {
                                    const tag = (node as HTMLElement).tagName.toLowerCase();
                                    if (['h1', 'h2', 'h3', 'p', 'div'].includes(tag)) break;
                                }
                                node = node.parentNode;
                            }

                            const currentTag = node && node !== editorRef.current ? (node as HTMLElement).tagName.toUpperCase() : 'P';

                            // Reset to P first to avoid nesting, then apply new format
                            document.execCommand('formatBlock', false, '<P>');

                            let nextTag = '<H1>';
                            if (currentTag === 'H1') nextTag = '<H2>';
                            else if (currentTag === 'H2') nextTag = '<H3>';
                            else if (currentTag === 'H3') nextTag = '<P>';

                            document.execCommand('formatBlock', false, nextTag);
                            onChange(editorRef.current.innerHTML);
                        }}
                        className="px-2 py-1 text-[10px] font-bold text-white hover:text-[#deb55a] uppercase transition-colors"
                        title="見出し・スタイルの切り替え"
                    >
                        STYLE
                    </button>
                </div>
            )}
        </WrapperElement>
    );
}


interface SectionToolbarProps {
    sectionId: string;
    layoutSettings: Record<string, LayoutConfig>;
    onLayoutChange: (sectionId: string, config: Partial<LayoutConfig>) => void;
    onSectionSelect: (id: string) => void;
    onBackgroundEdit: (id: string) => void;
}

const SectionToolbar = ({
    sectionId,
    layoutSettings,
    onLayoutChange,
    onSectionSelect,
    onBackgroundEdit
}: SectionToolbarProps) => {
    const [showLayout, setShowLayout] = useState(false);
    const config = layoutSettings?.[sectionId] || { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true };

    return (
        <div
            className="absolute top-4 right-4 z-20 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Layout Button */}
            <div className="relative">
                <button
                    onClick={() => setShowLayout(!showLayout)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-white rounded cursor-pointer transition-all border group shadow-md ${showLayout ? 'bg-[#2d2d2d] border-[#2d2d2d]' : 'bg-black/70 hover:bg-black/90 border-white/10'}`}
                >
                    <span className="text-[10px] font-bold">レイアウト</span>
                    <Layout size={12} className={showLayout ? 'text-white' : 'text-gray-300 group-hover:text-white'} />
                </button>

                {/* Layout Control Panel (Popover) */}
                {showLayout && (
                    <div className="absolute top-9 right-0 w-64 bg-[#2d2d2d] rounded shadow-xl text-white border border-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 bg-[#363636] border-b border-black/10">
                            <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                                <Layout size={12} />
                                レイアウト
                            </span>
                            <Settings2 size={12} className="text-gray-500 hover:text-gray-300 cursor-pointer" />
                        </div>

                        <div className="p-3 space-y-4">
                            {/* Width Control */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold">セクション幅</label>
                                <div className="relative">
                                    <select
                                        value={config.width}
                                        onChange={(e) => onLayoutChange?.(sectionId, { width: e.target.value as any })}
                                        className="w-full bg-[#1c1c1c] text-[11px] text-white border border-gray-700 rounded px-2 py-1.5 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="auto">自動 （デフォルト）</option>
                                        <option value="full">全体</option>
                                        <option value="wide">幅さ</option>
                                        <option value="normal">普通</option>
                                        <option value="small">狭い</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Content Alignment */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold">コンテンツの配置</label>
                                <div className="flex bg-[#1c1c1c] rounded p-0.5 border border-gray-700">
                                    <button
                                        onClick={() => onLayoutChange?.(sectionId, { alignment: 'top' })}
                                        className={`flex-1 flex items-center justify-center py-1 rounded-sm transition-colors ${config.alignment === 'top' ? 'bg-[#3d3d3d] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="上揃え"
                                    >
                                        <ArrowUpToLine size={14} />
                                    </button>
                                    <button
                                        onClick={() => onLayoutChange?.(sectionId, { alignment: 'center' })}
                                        className={`flex-1 flex items-center justify-center py-1 rounded-sm transition-colors ${config.alignment === 'center' ? 'bg-[#3d3d3d] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="中央揃え"
                                    >
                                        <AlignCenterVertical size={14} />
                                    </button>
                                    <button
                                        onClick={() => onLayoutChange?.(sectionId, { alignment: 'bottom' })}
                                        className={`flex-1 flex items-center justify-center py-1 rounded-sm transition-colors ${config.alignment === 'bottom' ? 'bg-[#3d3d3d] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                        title="下揃え"
                                    >
                                        <ArrowDownToLine size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="space-y-2 pt-2 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-gray-300">フルハイト</span>
                                    <button
                                        onClick={() => onLayoutChange?.(sectionId, { fullHeight: !config.fullHeight })}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${config.fullHeight ? 'bg-[#88c057]' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${config.fullHeight ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-gray-300">上のスペース</span>
                                    <button
                                        onClick={() => onLayoutChange?.(sectionId, { topSpace: !config.topSpace })}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${config.topSpace ? 'bg-[#88c057]' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${config.topSpace ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-gray-300">下のスペース</span>
                                    <button
                                        onClick={() => onLayoutChange?.(sectionId, { bottomSpace: !config.bottomSpace })}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${config.bottomSpace ? 'bg-[#88c057]' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${config.bottomSpace ? 'left-4.5 translate-x-3.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => onLayoutChange?.(sectionId, { width: 'normal', alignment: 'center', fullHeight: false, topSpace: true, bottomSpace: true })}
                                className="w-full flex items-center justify-center gap-2 py-1.5 mt-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 rounded text-[10px] transition-colors"
                            >
                                <RotateCcw size={10} />
                                リセット
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Text & Background Buttons */}
            <div className="flex flex-col gap-1">
                {/* Background Button */}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onSectionSelect?.(sectionId);
                        onBackgroundEdit?.(sectionId);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded cursor-pointer transition-all border border-white/10 group shadow-md"
                >
                    <span className="text-[10px] font-bold">背景</span>
                    <div className="flex items-center justify-center">
                        <ImageIcon size={12} className="text-gray-300 group-hover:text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MenuItemDeleteButtonProps {
    onDelete: () => void;
}

function MenuItemDeleteButton({ onDelete }: MenuItemDeleteButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsConfirming(false);
            }
        };

        if (isConfirming) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isConfirming]);

    return (
        <div
            ref={buttonRef}
            className={`s-repeatable-delete-button ${isConfirming ? 'is-confirming' : ''}`}
            title="この項目を削除"
            onClick={(e) => {
                e.stopPropagation();
                if (isConfirming) {
                    onDelete();
                    setIsConfirming(false);
                } else {
                    setIsConfirming(true);
                }
            }}
        >
            <div className="delete-button-wrap">
                <div className="delete-button-confirm">よろしいですか？</div>
            </div>
        </div>
    );
}

export function LandingPage({
    isEditing = false,
    onSectionSelect,
    onBackgroundEdit,
    onTextEdit,
    onTextChange,
    activeSection,
    backgroundSettings: propBackgroundSettings,
    layoutSettings: propLayoutSettings,
    textSettings: propTextSettings,
    onTextReset,
    onAddMenuItem,
    onDeleteMenuItem,
    onMenuImageEdit,
    onLayoutChange
}: LandingPageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Local state for settings when running in public mode (not editing)
    const [localBackgroundSettings, setLocalBackgroundSettings] = useState<Record<string, BackgroundConfig> | undefined>(undefined);
    const [localLayoutSettings, setLocalLayoutSettings] = useState<Record<string, LayoutConfig> | undefined>(undefined);
    const [localTextSettings, setLocalTextSettings] = useState<Record<string, Record<string, string>> | undefined>(undefined);

    // Use props if available (editing mode), otherwise use local state (public mode)
    // Merge with defaults to ensure new defaults (like images) are used if not explicitly overridden in local state
    const backgroundSettings = propBackgroundSettings || (localBackgroundSettings ? { ...DEFAULT_BACKGROUND_SETTINGS, ...localBackgroundSettings } : DEFAULT_BACKGROUND_SETTINGS);
    const layoutSettings = propLayoutSettings || (localLayoutSettings ? { ...DEFAULT_LAYOUT_SETTINGS, ...localLayoutSettings } : DEFAULT_LAYOUT_SETTINGS);
    const textSettings = propTextSettings || (localTextSettings ? { ...DEFAULT_TEXT_SETTINGS, ...localTextSettings } : DEFAULT_TEXT_SETTINGS);

    // Load settings from localStorage if on public page
    useEffect(() => {
        if (!isEditing) {
            const savedBackgrounds = localStorage.getItem('site_background_settings');
            const savedLayouts = localStorage.getItem('site_layout_settings');
            const savedText = localStorage.getItem('site_text_settings');

            if (savedBackgrounds) {
                try {
                    const parsed = JSON.parse(savedBackgrounds);
                    // Migration: Remove old Unsplash default URLs so they fall back to the new hardcoded defaults
                    const oldUnsplashUrl = 'https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&auto=format&q=80';
                    if (parsed.affiliated && parsed.affiliated.value === oldUnsplashUrl) {
                        delete parsed.affiliated;
                    }
                    if (parsed.home && (parsed.home.value === '/assets/home_hero.jpg' || parsed.home.value === 'https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80')) {
                        delete parsed.home;
                    }
                    setLocalBackgroundSettings(parsed);
                } catch (e) {
                    console.error('Failed to parse saved background settings', e);
                }
            }

            if (savedLayouts) {
                try {
                    setLocalLayoutSettings(JSON.parse(savedLayouts));
                } catch (e) {
                    console.error('Failed to parse saved layout settings', e);
                }
            }

            if (savedText) {
                try {
                    setLocalTextSettings(JSON.parse(savedText));
                } catch (e) {
                    console.error('Failed to parse saved text settings', e);
                }
            }
        }
    }, [isEditing]);



    const renderBackgroundContent = (sectionId: string) => {
        const config = backgroundSettings?.[sectionId];
        if (!config) return null;

        return (
            <>
                {/* Video Background */}
                {config.type === 'video' && (
                    <div className="absolute inset-0 overflow-hidden z-0">
                        {/* Check if it's a YouTube embed or direct file (simplified check) */}
                        {isYouTubeUrl(config.value) ? (
                            <iframe
                                src={getYouTubeEmbedUrl(config.value)}
                                className="w-full h-full object-cover pointer-events-none"
                                allow="autoplay; encrypted-media; loop"
                                title="Background Video"
                            />
                        ) : (
                            // Assume direct selection from stock or file
                            <div
                                className="w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url('${config.value}')` }}
                            >
                                {/* Stock video mock: actually rendering image as video placeholder for now per EditorPage implementation details where we mapped stock video to images */}
                            </div>
                        )}
                    </div>
                )}

                {/* Overlay */}
                {(config.overlayOpacity !== undefined && config.overlayOpacity > 0) && (
                    <div
                        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
                        style={{ backgroundColor: 'black', opacity: config.overlayOpacity / 100 }}
                    />
                )}
            </>
        );
    };

    const isYouTubeUrl = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
    const getYouTubeEmbedUrl = (url: string) => {
        // Simple mock converter
        return url.replace('watch?v=', 'embed/') + '?autoplay=1&mute=1&controls=0&loop=1';
    };


    const getBackgroundStyle = (sectionId: string) => {
        const config = backgroundSettings?.[sectionId];
        if (!config) return {};

        if (config.type === 'color') {
            return { backgroundColor: config.value, backgroundImage: 'none', color: config.textTheme === 'dark' ? '#000000' : '#ffffff' };
        } else if (config.type === 'image') {
            const style: any = {
                backgroundImage: `url('${config.value}')`,
                backgroundColor: 'transparent',
                color: config.textTheme === 'dark' ? '#000000' : '#ffffff'
            };
            if (config.backgroundMode === 'contain') style.backgroundSize = 'contain';
            else if (config.backgroundMode === 'tile') style.backgroundRepeat = 'repeat';
            else if (config.backgroundMode === 'center') {
                style.backgroundPosition = 'center';
                style.backgroundRepeat = 'no-repeat';
            } else {
                style.backgroundSize = 'cover';
                style.backgroundPosition = 'center';
            }
            return style;
        } else if (config.type === 'video') {
            return { backgroundColor: 'transparent', color: config.textTheme === 'dark' ? '#000000' : '#ffffff' };
        }
        return {};
    };

    const getLayoutStyle = (sectionId: string) => {
        const config = layoutSettings?.[sectionId];
        if (!config) return {};

        let classes = '';
        /* Height */
        if (config.fullHeight) classes += ' min-h-screen';

        /* Padding */
        if (config.topSpace) classes += ' pt-20';
        else classes += ' pt-0';

        if (config.bottomSpace) classes += ' pb-20';
        else classes += ' pb-0';

        /* Alignment (Vertical) */
        if (config.alignment === 'top') classes += ' justify-start';
        else if (config.alignment === 'bottom') classes += ' justify-end';
        else classes += ' justify-center'; // center default

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
            case 'normal':
            default: return 'max-w-4xl w-full px-4';
        }
    };




    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1C1C1C] relative">
            {/* Navigation */}
            <nav className={`${isEditing ? 'absolute' : 'fixed'} top-0 w-full bg-[#1C1C1C]/95 backdrop-blur-sm z-50 border-b border-[#deb55a]/20`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <button
                            onClick={() => !isEditing && scrollToSection('home')}
                            style={{ fontFamily: "'Bad Script', cursive" }}
                            className={`text-2xl text-[#fcebc5] transition-colors ${!isEditing ? 'hover:text-[#deb55a]' : ''}`}
                        >
                            <InlineEditableText
                                value={textSettings.home?.title || 'KABUKI寿司'}
                                onChange={(val) => onTextChange?.('home', 'title', val)}
                                isEditing={isEditing}
                            />
                            {' '}
                            <InlineEditableText
                                value={textSettings.home?.subtitle || '1番通り店'}
                                onChange={(val) => onTextChange?.('home', 'subtitle', val)}
                                isEditing={isEditing}
                            />
                        </button>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-8">
                            <button onClick={() => isEditing ? onSectionSelect?.('about') : scrollToSection('about')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">ABOUT</button>
                            <button onClick={() => isEditing ? onSectionSelect?.('gallery') : scrollToSection('gallery')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">GALLERY</button>
                            <button onClick={() => isEditing ? onSectionSelect?.('menu') : scrollToSection('menu')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">MENU</button>
                            <button onClick={() => isEditing ? onSectionSelect?.('access') : scrollToSection('access')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-[#e8eaec] hover:text-[#deb55a] transition-colors">ACCESS</button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden text-[#e8eaec]"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#1C1C1C] border-t border-[#deb55a]/20">
                        <div className="px-4 py-4 space-y-3">
                            <button onClick={() => isEditing ? onSectionSelect?.('about') : scrollToSection('about')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="block w-full text-left text-[#e8eaec] hover:text-[#deb55a] transition-colors py-2">ABOUT</button>
                            <button onClick={() => isEditing ? onSectionSelect?.('gallery') : scrollToSection('gallery')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="block w-full text-left text-[#e8eaec] hover:text-[#deb55a] transition-colors py-2">GALLERY</button>
                            <button onClick={() => isEditing ? onSectionSelect?.('menu') : scrollToSection('menu')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="block w-full text-left text-[#e8eaec] hover:text-[#deb55a] transition-colors py-2">MENU</button>
                            <button onClick={() => isEditing ? onSectionSelect?.('access') : scrollToSection('access')} style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="block w-full text-left text-[#e8eaec] hover:text-[#deb55a] transition-colors py-2">ACCESS</button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section
                id="home"
                onClick={() => isEditing && onSectionSelect?.('home')}
                className={`flex flex-col relative transition-all duration-300 bg-cover bg-center ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#deb55a]/50' : ''} ${activeSection === 'home' ? 'ring-4 ring-[#deb55a]' : ''} ${getLayoutStyle('home')}`}
                style={getBackgroundStyle('home')}
            >
                {renderBackgroundContent('home')}
                {isEditing && (
                    <SectionToolbar
                        sectionId="home"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange!}
                        onSectionSelect={onSectionSelect!}
                        onBackgroundEdit={onBackgroundEdit!}
                    />
                )}

                {/* Original hardcoded overlay - conditionally render if no config overlay is active to preserve default look until edited */}
                {(!backgroundSettings?.['home']?.overlayOpacity) && <div className="absolute inset-0 bg-black/60"></div>}
                <div className={`relative z-10 text-center mx-auto ${getContainerWidthClass('home')}`}>
                    <div className="mb-8 flex justify-center">
                        <ImageWithFallback
                            src="/assets/logo.png"
                            alt={`${textSettings.home?.title || 'KABUKI寿司'} ${textSettings.home?.subtitle || '1番通り店'} ロゴ`}
                            className="w-auto h-32 md:h-40 object-contain"
                        />
                    </div>
                    {/* Redundant text removed as requested: logo already contains store name */}
                    <div className="space-y-6">
                        <a
                            href="/traveler"
                            style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                            className="inline-block px-6 py-2 text-sm text-[#e8eaec] hover:text-[#deb55a] transition-colors border border-[#e8eaec]/30 rounded hover:border-[#deb55a]"
                        >
                            Languages: English · 中文 · 한국어
                        </a>
                        <div>
                            <button
                                onClick={() => scrollToSection('menu')}
                                style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                                className="px-12 py-4 bg-[#deb55a] text-[#1C1C1C] rounded-lg hover:bg-[#fcebc5] transition-colors font-bold text-lg"
                            >
                                メニュー
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
                                予約はこちら
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
                onClick={() => isEditing && onSectionSelect?.('about')}
                className={`flex flex-col relative transition-all duration-300 ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#deb55a]/50' : ''} ${activeSection === 'about' ? 'ring-4 ring-[#deb55a]' : ''} ${getLayoutStyle('about')}`}
                style={getBackgroundStyle('about')}
            >
                {renderBackgroundContent('about')}
                {isEditing && (
                    <SectionToolbar
                        sectionId="about"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange!}
                        onSectionSelect={onSectionSelect!}
                        onBackgroundEdit={onBackgroundEdit!}
                    />
                )}
                <div className={`mx-auto ${getContainerWidthClass('about')}`}>
                    <div style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-4">
                        <InlineEditableText
                            value={textSettings.about?.title || 'ABOUT US'}
                            onChange={(val) => onTextChange?.('about', 'title', val)}
                            isEditing={isEditing}
                        />
                    </div>
                    <div className="flex flex-col items-center gap-12 mt-12">
                        <div className="w-full max-w-4xl">
                            <ImageWithFallback
                                src="/assets/about_content_new.jpg"
                                alt={textSettings.about?.title || 'KABUKI寿司 1番通り店'}
                                className="rounded-lg shadow-xl w-full h-auto"
                            />
                        </div>
                        <div className="space-y-4 text-center max-w-3xl mx-auto" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}>
                            <div className="text-lg">
                                <InlineEditableText
                                    value={textSettings.about?.content || 'KABUKI寿司の2号店となる 「KABUKI寿司 1番通り店」 をオープンいたしました。\n\n1番通り店では、これまでの伝統を受け継ぎながらも、さらなる進化を目指しています。\n\n店主を務めるのは、新進気鋭の若手寿司職人増田。\n\n繊細な技術と斬新なアイデアで、新しい「KABUKI寿司」の世界を皆さまにお届けいたします。\n\nお店の特徴の一つは、カウンター付きの個室です。職人の技を間近で堪能しながら、ゆったりとしたプライベート空間でお食事をお楽しみいただけます。特別な日のお祝いから接待まで、幅広いシーンでご利用いただけます。\n\n伝統と革新が融合したKABUKI寿司 1番通り店で、特別なひとときをお過ごしください。'}
                                    onChange={(val) => onTextChange?.('about', 'content', val)}
                                    isEditing={isEditing}
                                    multiline={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section
                id="gallery"
                onClick={() => isEditing && onSectionSelect?.('gallery')}
                className={`flex flex-col relative transition-all duration-300 ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#deb55a]/50' : ''} ${activeSection === 'gallery' ? 'ring-4 ring-[#deb55a]' : ''} ${getLayoutStyle('gallery')}`}
                style={getBackgroundStyle('gallery')}
            >
                {renderBackgroundContent('gallery')}
                {isEditing && (
                    <SectionToolbar
                        sectionId="gallery"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange!}
                        onSectionSelect={onSectionSelect!}
                        onBackgroundEdit={onBackgroundEdit!}
                    />
                )}
                <div className={`mx-auto ${getContainerWidthClass('gallery')}`}>
                    <div style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-4 text-[#1C1C1C]">
                        <InlineEditableText
                            value={textSettings.gallery?.title || 'Gallery'}
                            onChange={(val) => onTextChange?.('gallery', 'title', val)}
                            isEditing={isEditing}
                        />
                    </div>
                    <div className="text-center text-gray-600 mb-12">
                        <InlineEditableText
                            value={textSettings.gallery?.subtitle || 'Photos from our restaurant.'}
                            onChange={(val) => onTextChange?.('gallery', 'subtitle', val)}
                            isEditing={isEditing}
                        />
                    </div>
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
                            '/assets/gallery_11.jpg',
                        ].map((src, i) => (
                            <div key={i} className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                                <ImageWithFallback
                                    src={src}
                                    alt={`Gallery ${i + 1}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Access Section */}
            <section
                id="access"
                onClick={() => isEditing && onSectionSelect?.('access')}
                className={`py-20 bg-cover bg-center relative transition-all duration-300 ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#deb55a]/50' : ''} ${activeSection === 'access' ? 'ring-4 ring-[#deb55a]' : ''}`}
                style={getBackgroundStyle('access')}
            >
                {renderBackgroundContent('access')}
                {isEditing && (
                    <SectionToolbar
                        sectionId="access"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange!}
                        onSectionSelect={onSectionSelect!}
                        onBackgroundEdit={onBackgroundEdit!}
                    />
                )}
                {(!backgroundSettings?.['access']?.overlayOpacity) && <div className="absolute inset-0 bg-white/90"></div>}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-12 text-[#1C1C1C]">
                        <InlineEditableText
                            value={textSettings.access?.title || 'ACCESS'}
                            onChange={(val) => onTextChange?.('access', 'title', val)}
                            isEditing={isEditing}
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-6" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}>
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-6 h-6 text-[#deb55a] flex-shrink-0 mt-1" />
                                <div>
                                    <p className="font-bold text-lg">
                                        <InlineEditableText
                                            value={textSettings.access?.zip || '〒160-0021'}
                                            onChange={(val) => onTextChange?.('access', 'zip', val)}
                                            isEditing={isEditing}
                                        />
                                    </p>
                                    <p className="text-gray-700">
                                        <InlineEditableText
                                            value={textSettings.access?.address || '東京都新宿区歌舞伎町2丁目45−16'}
                                            onChange={(val) => onTextChange?.('access', 'address', val)}
                                            isEditing={isEditing}
                                        />
                                    </p>
                                    <p className="text-gray-700">
                                        <InlineEditableText
                                            value={textSettings.access?.building || 'GEST34ビル4F'}
                                            onChange={(val) => onTextChange?.('access', 'building', val)}
                                            isEditing={isEditing}
                                        />
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-6 h-6 text-[#deb55a]" />
                                <div className="text-lg">
                                    <InlineEditableText
                                        value={textSettings.access?.phone || '03-6302-1477'}
                                        onChange={(val) => onTextChange?.('access', 'phone', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="w-6 h-6 text-[#deb55a]" />
                                <div className="text-lg">
                                    <InlineEditableText
                                        value={textSettings.access?.hours || 'OPEN : 18:00-24:00'}
                                        onChange={(val) => onTextChange?.('access', 'hours', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-xl">
                            <ImageWithFallback
                                src="/assets/access_map.jpg"
                                alt="Map"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Menu Section */}
            <section
                id="menu"
                onClick={(e) => {
                    if (isEditing && e.target === e.currentTarget) {
                        onSectionSelect?.('menu');
                    }
                }}
                className={`flex flex-col relative transition-all duration-300 ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#deb55a]/50' : ''} ${activeSection === 'menu' ? 'ring-4 ring-[#deb55a]' : ''} ${getLayoutStyle('menu')}`}
                style={getBackgroundStyle('menu')}
            >
                {renderBackgroundContent('menu')}
                {isEditing && (
                    <SectionToolbar
                        sectionId="menu"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange!}
                        onSectionSelect={onSectionSelect!}
                        onBackgroundEdit={onBackgroundEdit!}
                    />
                )}
                <div className={`mx-auto ${getContainerWidthClass('menu')}`}>
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-5xl text-center mb-4 text-[#1C1C1C]">
                        <InlineEditableText
                            value={textSettings.menu?.title || 'Menu'}
                            onChange={(val) => onTextChange?.('menu', 'title', val)}
                            isEditing={isEditing}
                        />
                    </h2>
                    <div className="text-center text-xl mb-12" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}>
                        <InlineEditableText
                            value={textSettings.menu?.subtitle || 'Course'}
                            onChange={(val) => onTextChange?.('menu', 'subtitle', val)}
                            isEditing={isEditing}
                        />
                    </div>
                    <div className="text-center text-gray-600 mb-12">
                        <InlineEditableText
                            value={textSettings.menu?.description || 'まずは当店お勧めのコースからお選びください'}
                            onChange={(val) => onTextChange?.('menu', 'description', val)}
                            isEditing={isEditing}
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <h3 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-3 text-[#1C1C1C]">おまかせにぎり８貫</h3>
                            <p className="text-3xl text-[#deb55a] font-bold mb-4">¥4,980</p>
                            <p className="text-gray-600">お勧め握り８貫と本日の１品、お椀</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <h3 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-3 text-[#1C1C1C]">特選にぎり８貫</h3>
                            <p className="text-3xl text-[#deb55a] font-bold mb-4">¥6,980</p>
                            <p className="text-gray-600">贅沢なお勧め握り８貫と本日の１品、お椀</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <h3 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-3 text-[#1C1C1C]">特選にぎり１０貫</h3>
                            <p className="text-3xl text-[#deb55a] font-bold mb-4">¥9,900</p>
                            <p className="text-gray-600">贅沢なお勧め握り１０貫と本日の１品<br />厳選刺身５種盛り合わせ、お椀</p>
                        </div>
                    </div>

                    {/* NIGIRI Section */}
                    <div className="mb-16">
                        <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-8 text-[#1C1C1C]">
                            <InlineEditableText
                                value={textSettings.menu?.nigiri_title || 'NIGIRI'}
                                onChange={(val) => onTextChange?.('menu', 'nigiri_title', val)}
                                isEditing={isEditing}
                            />
                        </h3>
                        <div className="text-center text-xl mb-8 text-[#deb55a]" style={{ fontFamily: "'Archivo Narrow', sans-serif" }}>
                            <InlineEditableText
                                value={textSettings.menu?.nigiri_subtitle || 'Fish in Season'}
                                onChange={(val) => onTextChange?.('menu', 'nigiri_subtitle', val)}
                                isEditing={isEditing}
                            />
                        </div>
                        <div className="text-center text-gray-600 mb-8">
                            <InlineEditableText
                                value={textSettings.menu?.nigiri_description || '季節の魚'}
                                onChange={(val) => onTextChange?.('menu', 'nigiri_description', val)}
                                isEditing={isEditing}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {(() => {
                                // Get all nigiri item indices dynamically
                                const nigiriIndices = Object.keys(textSettings.menu || {})
                                    .filter(key => key.startsWith('nigiri_') && key.endsWith('_name'))
                                    .map(key => parseInt(key.split('_')[1]))
                                    .filter(num => !isNaN(num))
                                    .sort((a, b) => a - b);

                                return nigiriIndices.map(index => {
                                    const name = textSettings.menu?.[`nigiri_${index}_name`] || '';
                                    const price = textSettings.menu?.[`nigiri_${index}_price`] || '';
                                    const image = textSettings.menu?.[`nigiri_${index}_image`] || "https://images.unsplash.com/photo-1763647756796-af9230245bf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&h=300&auto=format&q=80";
                                    const note = textSettings.menu?.[`nigiri_${index}_note`] || '';

                                    if (!name) return null;

                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow relative">
                                            {isEditing && (
                                                <MenuItemDeleteButton
                                                    onDelete={() => onDeleteMenuItem?.('menu', 'nigiri', index)}
                                                />
                                            )}
                                            <div className="relative group">
                                                <ImageWithFallback
                                                    src={image}
                                                    alt={name}
                                                    className="w-full h-48 object-cover rounded mb-3"
                                                />
                                                {isEditing && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center gap-2 pointer-events-none">
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
                                            </div>
                                            <h4
                                                style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                                                className="font-bold text-lg text-[#1C1C1C]"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <InlineEditableText
                                                    value={name}
                                                    onChange={(val) => onTextChange?.('menu', `nigiri_${index}_name`, val)}
                                                    isEditing={isEditing}
                                                />
                                            </h4>
                                            <div
                                                className="text-[#deb55a] font-bold"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <InlineEditableText
                                                    value={price}
                                                    onChange={(val) => onTextChange?.('menu', `nigiri_${index}_price`, val)}
                                                    isEditing={isEditing}
                                                />
                                            </div>
                                            {(note || isEditing) && (
                                                <div
                                                    className="text-sm text-gray-600 mt-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <InlineEditableText
                                                        value={note}
                                                        onChange={(val) => onTextChange?.('menu', `nigiri_${index}_note`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}

                            {isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddMenuItem?.('menu', 'nigiri');
                                    }}
                                    className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow p-4 h-full min-h-[300px] flex items-center justify-center transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-2">+</div>
                                        <div className="font-bold">項目を追加</div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>


                    {/* MAKIMONO Section */}
                    <div className="mb-16">
                        <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-8 text-[#1C1C1C]">
                            <InlineEditableText
                                value={textSettings.menu?.makimono_title || 'MAKIMONO'}
                                onChange={(val) => onTextChange?.('menu', 'makimono_title', val)}
                                isEditing={isEditing}
                            />
                        </h3>
                        <div className="text-center text-gray-600 mb-8">
                            <InlineEditableText
                                value={textSettings.menu?.makimono_subtitle || '巻物'}
                                onChange={(val) => onTextChange?.('menu', 'makimono_subtitle', val)}
                                isEditing={isEditing}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {(() => {
                                // Get all makimono item indices dynamically
                                const makimonoIndices = Object.keys(textSettings.menu || {})
                                    .filter(key => key.startsWith('makimono_') && key.endsWith('_name'))
                                    .map(key => parseInt(key.split('_')[1]))
                                    .filter(num => !isNaN(num))
                                    .sort((a, b) => a - b);

                                return makimonoIndices.map(index => {
                                    const name = textSettings.menu?.[`makimono_${index}_name`] || '';
                                    const price = textSettings.menu?.[`makimono_${index}_price`] || '';
                                    const image = textSettings.menu?.[`makimono_${index}_image`] || "https://images.unsplash.com/photo-1712725214706-e564b8dd1bbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&h=300&auto=format&q=80";
                                    const note = textSettings.menu?.[`makimono_${index}_note`] || '';

                                    if (!name) return null;

                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow relative">
                                            {isEditing && (
                                                <MenuItemDeleteButton
                                                    onDelete={() => onDeleteMenuItem?.('menu', 'makimono', index)}
                                                />
                                            )}
                                            <div className="relative group">
                                                <ImageWithFallback
                                                    src={image}
                                                    alt={name}
                                                    className="w-full h-48 object-cover rounded mb-3"
                                                />
                                                {isEditing && (
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center gap-2 pointer-events-none">
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
                                            </div>
                                            <h4
                                                style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                                                className="font-bold text-lg text-[#1C1C1C]"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <InlineEditableText
                                                    value={name}
                                                    onChange={(val) => onTextChange?.('menu', `makimono_${index}_name`, val)}
                                                    isEditing={isEditing}
                                                />
                                            </h4>
                                            <div
                                                className="text-[#deb55a] font-bold"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <InlineEditableText
                                                    value={price}
                                                    onChange={(val) => onTextChange?.('menu', `makimono_${index}_price`, val)}
                                                    isEditing={isEditing}
                                                />
                                            </div>
                                            {(note || isEditing) && (
                                                <div
                                                    className="text-sm text-gray-600 mt-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <InlineEditableText
                                                        value={note}
                                                        onChange={(val) => onTextChange?.('menu', `makimono_${index}_note`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}

                            {isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddMenuItem?.('menu', 'makimono');
                                    }}
                                    className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow p-4 h-full min-h-[300px] flex items-center justify-center transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-2">+</div>
                                        <div className="font-bold">項目を追加</div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>


                    {/* IPPIN Section */}
                    <div className="mb-16">
                        <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-8 text-[#1C1C1C]">
                            <InlineEditableText
                                value={textSettings.menu?.ippin_title || 'IPPIN'}
                                onChange={(val) => onTextChange?.('menu', 'ippin_title', val)}
                                isEditing={isEditing}
                            />
                        </h3>
                        <div className="text-center text-gray-600 mb-8">
                            <InlineEditableText
                                value={textSettings.menu?.ippin_subtitle || '一品料理'}
                                onChange={(val) => onTextChange?.('menu', 'ippin_subtitle', val)}
                                isEditing={isEditing}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {(() => {
                                // Get all ippin item indices dynamically
                                const ippinIndices = Object.keys(textSettings.menu || {})
                                    .filter(key => key.startsWith('ippin_') && key.endsWith('_name'))
                                    .map(key => parseInt(key.split('_')[1]))
                                    .filter(num => !isNaN(num))
                                    .sort((a, b) => a - b);

                                return ippinIndices.map(index => {
                                    const name = textSettings.menu?.[`ippin_${index}_name`] || '';
                                    const price = textSettings.menu?.[`ippin_${index}_price`] || '';
                                    const image = textSettings.menu?.[`ippin_${index}_image`] || '';
                                    const note = textSettings.menu?.[`ippin_${index}_note`] || '';

                                    if (!name) return null;

                                    return (
                                        <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow relative">
                                            {isEditing && (
                                                <MenuItemDeleteButton
                                                    onDelete={() => onDeleteMenuItem?.('menu', 'ippin', index)}
                                                />
                                            )}
                                            {image && (
                                                <div className="relative group">
                                                    <ImageWithFallback
                                                        src={image}
                                                        alt={name}
                                                        className="w-full h-48 object-cover rounded mb-3"
                                                    />
                                                    {isEditing && (
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center gap-2 pointer-events-none">
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
                                                </div>
                                            )}
                                            <h4
                                                style={{ fontFamily: "'Archivo Narrow', sans-serif" }}
                                                className="font-bold text-lg text-[#1C1C1C] mb-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <InlineEditableText
                                                    value={name}
                                                    onChange={(val) => onTextChange?.('menu', `ippin_${index}_name`, val)}
                                                    isEditing={isEditing}
                                                />
                                            </h4>
                                            <div
                                                className="text-[#deb55a] font-bold mb-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <InlineEditableText
                                                    value={price}
                                                    onChange={(val) => onTextChange?.('menu', `ippin_${index}_price`, val)}
                                                    isEditing={isEditing}
                                                />
                                            </div>
                                            {(note || isEditing) && (
                                                <div
                                                    className="text-sm text-gray-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <InlineEditableText
                                                        value={note}
                                                        onChange={(val) => onTextChange?.('menu', `ippin_${index}_note`, val)}
                                                        isEditing={isEditing}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}

                            {isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddMenuItem?.('menu', 'ippin');
                                    }}
                                    className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow p-4 h-full min-h-[300px] flex items-center justify-center transition-colors border-2 border-dashed border-gray-600 hover:border-gray-500"
                                >
                                    <div className="text-center">
                                        <div className="text-3xl mb-2">+</div>
                                        <div className="font-bold">項目を追加</div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>


                    {/* DRINK Section */}
                    <div>
                        <h3 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-8 text-[#1C1C1C]">Drink</h3>
                        <p className="text-center text-gray-600 mb-8">お飲み物</p>

                        <div className="max-w-4xl mx-auto space-y-8">
                            {/* Sake Section */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h4 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-4 text-[#1C1C1C]">日本酒（１合）</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { name: '写楽 福島', price: '2000', image: '/assets/drink_sharaku.jpg' },
                                        { name: '三井の寿 福岡', price: '1500', image: '/assets/drink_miinokotobuki.jpg' },
                                        { name: '日高見 宮城', price: '1500', image: '/assets/drink_hitakami.jpg' },
                                        { name: 'ゼブラ 山形', price: '2000', image: '/assets/drink_zebra.jpg' },
                                    ].map((item, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className="w-full aspect-[3/4] overflow-hidden rounded-lg mb-2 shadow-sm">
                                                <ImageWithFallback
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-sm text-[#1C1C1C]">{item.name}</p>
                                                <p className="text-[#deb55a] font-bold text-sm">¥{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Alcohol Section */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h4 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-4 text-[#1C1C1C]">アルコール</h4>
                                    <div className="space-y-4 text-sm">
                                        <ul className="space-y-2">
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">サントリー プレミアムモルツ生</span><span className="text-[#deb55a] font-bold">／880</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">サッポロラガー中瓶</span><span className="text-[#deb55a] font-bold">／900</span></li>
                                        </ul>

                                        <ul className="space-y-2 border-t pt-4">
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">角ハイボール</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">知多</span><span className="text-[#deb55a] font-bold">／1600</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">白州</span><span className="text-[#deb55a] font-bold">／1800</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">山﨑</span><span className="text-[#deb55a] font-bold">／1800</span></li>
                                        </ul>

                                        <ul className="space-y-2 border-t pt-4">
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">ガリサワー</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">レモンサワー</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">濃厚緑茶ハイ</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">さんぴん茶ハイ</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">ウーロンハイ</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">コーン茶ハイ</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                        </ul>

                                        <div className="border-t pt-4">
                                            <p className="font-bold text-[#1C1C1C] mb-2 text-xs">グラスワイン</p>
                                            <li className="flex justify-between list-none"><span className="text-[#1C1C1C]">赤・白</span><span className="text-[#deb55a] font-bold">／1000〜1300</span></li>
                                        </div>

                                        <div className="border-t pt-4">
                                            <p className="font-bold text-[#1C1C1C] mb-2 text-xs">ボトルワイン</p>
                                            <li className="flex justify-between list-none"><span className="text-[#1C1C1C]">白・ヴェルメンティーノ・グアド・アル・タッソ</span><span className="text-[#deb55a] font-bold">／10000</span></li>
                                        </div>

                                        <div className="border-t pt-4">
                                            <p className="font-bold text-[#1C1C1C] mb-2 text-xs">シャンパン</p>
                                            <li className="flex justify-between list-none"><span className="text-[#1C1C1C]">ペリエ ジュエ グラン ブリュット</span><span className="text-[#deb55a] font-bold">／25000</span></li>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Shochu Section */}
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h4 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-4 text-[#1C1C1C]">焼酎・泡盛・ハブ酒</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">富乃宝山(芋)</span><span className="text-[#deb55a] font-bold">／880</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">吉四六(麦)</span><span className="text-[#deb55a] font-bold">／880</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">鳥飼(米)</span><span className="text-[#deb55a] font-bold">／880</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">残波白（泡盛)</span><span className="text-[#deb55a] font-bold">／770</span></li>
                                            <li className="flex justify-between"><span className="text-[#1C1C1C]">ハブ酒ショット</span><span className="text-[#deb55a] font-bold">／1000</span></li>
                                        </ul>
                                    </div>

                                    {/* Others Section */}
                                    <div className="bg-white rounded-lg shadow-lg p-6">
                                        <h4 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-4 text-[#1C1C1C]">その他</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex justify-between">
                                                <span className="text-[#1C1C1C]">さんぴん茶、ウーロン茶、緑茶、<br />コーン茶、コカ・コーラ、炭酸水</span>
                                                <span className="text-[#deb55a] font-bold whitespace-nowrap">各種 ¥500</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Affiliated Store Section */}
            < section
                id="affiliated"
                onClick={() => isEditing && onSectionSelect?.('affiliated')
                }
                className={`py-20 bg-cover bg-center relative transition-all duration-300 ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#deb55a]/50' : ''} ${activeSection === 'affiliated' ? 'ring-4 ring-[#deb55a]' : ''}`}
                style={getBackgroundStyle('affiliated')}
            >
                {renderBackgroundContent('affiliated')}
                {isEditing && (
                    <SectionToolbar
                        sectionId="affiliated"
                        layoutSettings={layoutSettings}
                        onLayoutChange={onLayoutChange!}
                        onSectionSelect={onSectionSelect!}
                        onBackgroundEdit={onBackgroundEdit!}
                    />
                )}
                {(!backgroundSettings?.['affiliated']?.overlayOpacity) && <div className="absolute inset-0 bg-black/70"></div>}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 style={{ fontFamily: "'Bad Script', cursive" }} className="text-4xl text-center mb-4 text-[#fcebc5]">
                        <InlineEditableText
                            value={textSettings.affiliated?.title || 'Affiliated store of KABUKI SUSHI'}
                            onChange={(val) => onTextChange?.('affiliated', 'title', val)}
                            isEditing={isEditing}
                        />
                    </h2>
                    <div className="text-center text-xl mb-12 text-[#e8eaec]">
                        <InlineEditableText
                            value={textSettings.affiliated?.subtitle || '姉妹店'}
                            onChange={(val) => onTextChange?.('affiliated', 'subtitle', val)}
                            isEditing={isEditing}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#271c02] rounded-lg p-6 border border-[#deb55a]/30">
                            <ImageWithFallback
                                src="/assets/honten_card_new.jpg"
                                alt="KABUKI寿司 本店"
                                className="w-full aspect-[3/2] object-cover rounded-lg mb-4"
                            />
                            <h3 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-3 text-[#fcebc5]">
                                ■<InlineEditableText
                                    value={textSettings.affiliated?.store1_name || 'KABUKI寿司 本店'}
                                    onChange={(val) => onTextChange?.('affiliated', 'store1_name', val)}
                                    isEditing={isEditing}
                                />
                            </h3>
                            <div className="space-y-2 text-[#e8eaec]">
                                <div>
                                    <InlineEditableText
                                        value={textSettings.affiliated?.store1_address || '〒160-0021 東京都新宿区歌舞伎町2丁目25-8 エコプレイス新宿1F'}
                                        onChange={(val) => onTextChange?.('affiliated', 'store1_address', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                                <div>
                                    <InlineEditableText
                                        value={textSettings.affiliated?.store1_phone || 'TEL：03-6457-6612'}
                                        onChange={(val) => onTextChange?.('affiliated', 'store1_phone', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                                <div>
                                    <InlineEditableText
                                        value={textSettings.affiliated?.store1_hours || 'OPEN：18:00-4:00'}
                                        onChange={(val) => onTextChange?.('affiliated', 'store1_hours', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                                <div>
                                    <InlineEditableText
                                        value={textSettings.affiliated?.store1_note || 'グルテンフリー対応可'}
                                        onChange={(val) => onTextChange?.('affiliated', 'store1_note', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                                <a href="https://site-1229809-8757-747.mystrikingly.com/" target="_blank" rel="noopener noreferrer" className="text-[#deb55a] hover:underline block mt-2">https://site-1229809-8757-747.mystrikingly.com/</a>
                            </div>
                        </div>

                        <div className="bg-[#271c02] rounded-lg p-6 border border-[#deb55a]/30">
                            <ImageWithFallback
                                src="/assets/soba_card_new.jpg"
                                alt="KABUKI SOBA"
                                className="w-full aspect-[3/2] object-cover rounded-lg mb-4"
                            />
                            <h3 style={{ fontFamily: "'Archivo Narrow', sans-serif" }} className="text-2xl font-bold mb-3 text-[#fcebc5]">
                                ■<InlineEditableText
                                    value={textSettings.affiliated?.store2_name || 'KABUKI SOBA'}
                                    onChange={(val) => onTextChange?.('affiliated', 'store2_name', val)}
                                    isEditing={isEditing}
                                />
                            </h3>
                            <div className="space-y-2 text-[#e8eaec]">
                                <div>
                                    <InlineEditableText
                                        value={textSettings.affiliated?.store2_address || '〒160-0021 東京都新宿区歌舞伎町２丁目２７ １２Lee２ビル １F'}
                                        onChange={(val) => onTextChange?.('affiliated', 'store2_address', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                                <div>
                                    <InlineEditableText
                                        value={textSettings.affiliated?.store2_phone || 'TEL：03-6457-3112'}
                                        onChange={(val) => onTextChange?.('affiliated', 'store2_phone', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                                <div>
                                    <InlineEditableText
                                        value={textSettings.affiliated?.store2_hours || 'OPEN：19:00-6:00'}
                                        onChange={(val) => onTextChange?.('affiliated', 'store2_hours', val)}
                                        isEditing={isEditing}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Map Image */}
                    <div className="mt-8 rounded-lg overflow-hidden shadow-xl max-w-4xl mx-auto">
                        <ImageWithFallback
                            src="/assets/affiliated_map.jpg"
                            alt="Affiliated Stores Map"
                            className="w-full h-auto"
                        />
                    </div>
                </div>
            </section >
            {/* Footer */}
            < footer
                id="footer"
                onClick={() => isEditing && onSectionSelect?.('footer')}
                className={`text-[#e8eaec] border-t border-[#deb55a]/20 flex flex-col relative transition-all duration-300 ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#deb55a]/50' : ''} ${activeSection === 'footer' ? 'ring-4 ring-[#deb55a]' : ''} ${getLayoutStyle('footer')}`}
                style={getBackgroundStyle('footer')}
            >
                {renderBackgroundContent('footer')}
                {isEditing && <SectionToolbar sectionId="footer" />}
                <div className={`mx-auto text-center ${getContainerWidthClass('footer')}`}>
                    <div className="flex justify-center gap-6 mb-8">
                        <a href="https://www.instagram.com/kabukizushi_ichiban?igsh=MWRzdmxuNzF1ODlzNA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Instagram size={20} />
                        </a>
                        <a href="https://www.tiktok.com/@kabukisushi1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Music2 size={20} />
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=100068484907117&locale=hi_IN" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Facebook size={20} />
                        </a>
                        <a href="https://www.youtube.com/@KABUKI-ev3sy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <Youtube size={20} />
                        </a>
                        <a href="https://maps.app.goo.gl/yC8c23nWvXpjYmoXA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#deb55a]/20 text-[#e8eaec] hover:text-[#deb55a] transition-all">
                            <LinkIcon size={20} />
                        </a>
                    </div>

                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 text-[#e8eaec]">
                            <Phone size={18} className="text-[#deb55a]" />
                            <span className="text-lg font-semibold">0363021477</span>
                        </div>
                    </div>

                    <div className="text-sm text-gray-400 space-y-4">
                        <p>Restaurant © 2019</p>
                        <div>
                            <a href="/admin/dashboard" className="text-xs text-gray-600 hover:text-[#deb55a] transition-colors">
                                管理画面へ
                            </a>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
}
