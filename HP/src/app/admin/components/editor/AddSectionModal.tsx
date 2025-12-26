import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface AddSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (category: string, type: string) => void;
}

const CATEGORIES = [
    { id: 'commerce', label: 'コマース' },
    { id: 'booking', label: '予約', sub: true }, // Mimicking the grouped nature
    { id: 'blog', label: 'ブログとポートフォリオ' },
    { id: 'cta', label: '行動喚起' },
    { id: 'about', label: '当サイトについて' },
    { id: 'features', label: '特徴リスト' },
    { id: 'media', label: '画像とビデオ' },
    { id: 'grid', label: 'グリッド' },
    { id: 'text', label: 'テキスト' },
    { id: 'subscription', label: 'サブスクリプション' },
    { id: 'testimonials', label: 'お客様の声' },
    { id: 'gallery', label: 'ギャラリー' },
    { id: 'contact', label: 'お問い合わせとフォーム' },
    { id: 'advanced', label: '高度機能' },
    { id: 'blank', label: 'ブランク' },
];

const SECTION_TEMPLATES = {
    commerce: {
        title: "ストアー",
        description: "サイトで商品を販売しましょう！ご注文、支払いなどを管理できます。",
        items: [
            {
                id: 'store-1',
                title: "今すぐ購入しましょう！",
                image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&w=500&q=80",
                layout: 'grid',
                previewContent: (
                    <div className="p-4 grid grid-cols-3 gap-2 h-full content-center">
                        {[
                            { img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200", price: "$299,900" },
                            { img: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200", price: "$199,900" },
                            { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200", price: "$188,800" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-1 shadow-sm rounded-sm">
                                <div className="aspect-[4/5] bg-gray-100 mb-2 relative overflow-hidden">
                                    <img src={item.img} className="w-full h-full object-cover" />
                                </div>
                                <div className="h-2 w-3/4 bg-gray-200 mb-1" />
                                <div className="text-[8px] font-bold text-gray-800">{item.price}</div>
                            </div>
                        ))}
                    </div>
                )
            },
            {
                id: 'store-2',
                title: "今すぐ購入しましょう！",
                image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&w=500&q=80",
                layout: 'list',
                previewContent: (
                    <div className="p-4 flex flex-col gap-2 h-full justify-center">
                        {[
                            { img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200", price: "$299,900" },
                            { img: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200", price: "$199,900" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-2">
                                <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                                    <img src={item.img} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 py-1">
                                    <div className="h-2 w-1/2 bg-gray-200 mb-1" />
                                    <div className="text-[8px] text-gray-800 font-bold mb-1">{item.price}</div>
                                    <div className="h-2 w-full bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        ]
    },
    booking: {
        title: "予約",
        description: "訪問者が予約できるように、サービス、トレーニング、コンサート、会議、その他のイベントをスケジュールしましょう。",
        items: [
            {
                id: 'booking-1',
                title: "今すぐ予約しましょう！",
                image: "https://static-assets.strikinglycdn.com/images/booking-calendar.svg",
                layout: 'list',
                previewContent: (
                    <div className="p-4 flex flex-col gap-2 h-full justify-center">
                        {[
                            { title: "バーチャル リアリティ", loc: "ニューヨーク", img: "https://images.unsplash.com/photo-1592478411213-61535fdd861d?w=200" },
                            { title: "コーディング キャンプ", loc: "ニューヨーク", img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200" }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-2 border-b border-gray-100 pb-2 last:border-0">
                                <div className="w-16 h-12 bg-gray-100 flex-shrink-0">
                                    <img src={item.img} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold text-gray-800 leading-tight mb-1">{item.title}</div>
                                    <div className="flex gap-1 items-center">
                                        <div className="w-3 h-3 bg-gray-200 rounded-full" />
                                        <div className="text-[8px] text-gray-500">{item.loc}</div>
                                    </div>
                                    <div className="mt-1 w-20 h-4 bg-gray-800 rounded-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        ]
    },
    blog: {
        title: "ブログ",
        description: "新しいページで開く美しいブログ投稿を作成しましょう。",
        items: [
            {
                id: 'blog-1',
                title: "購読して今すぐアクセス",
                image: "",
                layout: 'grid',
                previewContent: (
                    <div className="p-4 grid grid-cols-2 gap-2 h-full content-center">
                        <div className="col-span-2 text-center mb-2">
                            <div className="h-3 w-3/4 bg-gray-300 mx-auto mb-1" />
                            <div className="h-2 w-1/2 bg-gray-200 mx-auto" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white flex gap-2 mb-1">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="h-2 w-full bg-gray-200 mb-1" />
                                    <div className="h-1 w-1/2 bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                )

            }
        ]
    }
};

export default function AddSectionModal({ isOpen, onClose, onAdd }: AddSectionModalProps) {
    const [activeCategory, setActiveCategory] = useState('commerce');

    if (!isOpen) return null;

    // Fallback if category not in templates map (for now only implementing the requested ones)
    const currentCategoryData = SECTION_TEMPLATES[activeCategory as keyof typeof SECTION_TEMPLATES] || {
        title: CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory,
        description: "このセクションのテンプレートを選択してください。",
        items: []
    };

    return (
        <div className="fixed inset-0 z-50 flex overflow-hidden animate-in fade-in duration-200 font-sans">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content - Left Sidebar + Main Content */}
            <div className="relative flex w-full max-w-6xl h-[90vh] mt-auto mx-auto mb-5 bg-[#f0f0f0] rounded-t-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">

                {/* Header (Hidden in user screen but usually needed, sticking to design which uses internal headers) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all"
                >
                    <X size={18} />
                </button>

                {/* Left Sidebar */}
                <div className="w-64 bg-[#f7f7f7] flex flex-col pt-12 border-r border-gray-200 overflow-y-auto flex-shrink-0">
                    <div className="px-6 pb-4">
                        <h2 className="text-xl font-bold text-gray-800">セクションの追加</h2>
                    </div>
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-6 py-3 text-left text-sm font-medium transition-colors relative ${activeCategory === category.id
                                    ? 'bg-white text-[#88c057] shadow-sm z-10'
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                                }`}
                        >
                            {activeCategory === category.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#88c057]" />
                            )}
                            {category.label}
                        </button>
                    ))}
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-12">

                        {/* Category Heading Group */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-[#88c057] mb-2 flex items-center gap-2">
                                {currentCategoryData.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {currentCategoryData.description}
                            </p>
                        </div>

                        {/* Templates Grid */}
                        <div className="grid grid-cols-2 gap-8">
                            {currentCategoryData.items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="group cursor-pointer"
                                    onClick={() => onAdd(activeCategory, item.id)}
                                >
                                    <div className="text-center mb-3">
                                        <h4 className="font-bold text-gray-700 group-hover:text-[#88c057] transition-colors">
                                            {item.title}
                                        </h4>
                                    </div>

                                    <div className="aspect-[1.4/1] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden relative shadow-sm group-hover:shadow-xl group-hover:border-[#88c057] group-hover:-translate-y-1 transition-all duration-300">
                                        {/* Dynamic Preview Content */}
                                        <div className="absolute inset-0 bg-white">
                                            {item.previewContent}
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                                    </div>
                                </div>
                            ))}

                            {/* Allow grid to populate with placeholders if empty */}
                            {currentCategoryData.items.length === 0 && (
                                <div className="col-span-2 py-20 text-center text-gray-400">
                                    このカテゴリーのテンプレートは準備中です
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
