import { X, Plus, Ban, EyeOff, Globe, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('add-items');

    if (!isOpen) return null;

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const sections = [
        {
            id: 'add-items',
            title: 'メニュー項目の追加方法',
            icon: Plus,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">メニュー項目を追加するには、以下の手順に従ってください：</p>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                            <strong>エディタでメニューセクションまでスクロール</strong>
                            <p className="ml-6 mt-1 text-sm">エディタの中央のプレビュー画面を下にスクロールして、メニューセクション（握り、巻物、一品料理など）を表示します。</p>
                        </li>
                        <li>
                            <strong>「項目を追加」ボタンをクリック</strong>
                            <p className="ml-6 mt-1 text-sm">追加したいカテゴリーの下部にある点線の枠で囲まれた「+ 項目を追加」ボタンをクリックします。</p>
                        </li>
                        <li>
                            <strong>項目の詳細を入力</strong>
                            <p className="ml-6 mt-1 text-sm">新しく追加された項目をクリックして、名前、価格、説明などを編集します。</p>
                        </li>
                        <li>
                            <strong>画像を設定（オプション）</strong>
                            <p className="ml-6 mt-1 text-sm">画像エリアをクリックして、画像ライブラリから選択または新しい画像をアップロードします。</p>
                        </li>
                        <li>
                            <strong>保存</strong>
                            <p className="ml-6 mt-1 text-sm">画面上部の「保存」ボタンをクリックして変更を保存します。</p>
                        </li>
                    </ol>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                        <p className="text-sm text-blue-800">
                            <strong>ヒント：</strong> 日本酒以外のドリンクカテゴリー（アルコール、焼酎、その他）は、自由形式のテキストエリアで編集できます。項目の追加ボタンはありません。
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'sold-out',
            title: '売り切れ機能の使い方',
            icon: Ban,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">メニュー項目を売り切れとしてマークする方法：</p>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                            <strong>編集モードで項目を選択</strong>
                            <p className="ml-6 mt-1 text-sm">売り切れにしたいメニュー項目にカーソルを合わせます。</p>
                        </li>
                        <li>
                            <strong>売り切れボタンをクリック</strong>
                            <p className="ml-6 mt-1 text-sm">項目の左上に表示される <Ban size={14} className="inline" /> アイコンをクリックします。</p>
                        </li>
                        <li>
                            <strong>確認</strong>
                            <p className="ml-6 mt-1 text-sm">項目に「Sold Out」バッジが表示されます。公開ページでも同様に表示されます。</p>
                        </li>
                        <li>
                            <strong>解除する場合</strong>
                            <p className="ml-6 mt-1 text-sm">もう一度 <Ban size={14} className="inline" /> アイコンをクリックすると、売り切れ状態が解除されます。</p>
                        </li>
                    </ol>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4">
                        <p className="text-sm text-yellow-800">
                            <strong>注意：</strong> 売り切れの項目は公開ページに表示されますが、「Sold Out」バッジが付きます。完全に非表示にしたい場合は、非表示機能を使用してください。
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'hidden',
            title: '非表示機能の使い方',
            icon: EyeOff,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">メニュー項目を公開ページから非表示にする方法：</p>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                            <strong>編集モードで項目を選択</strong>
                            <p className="ml-6 mt-1 text-sm">非表示にしたいメニュー項目にカーソルを合わせます。</p>
                        </li>
                        <li>
                            <strong>非表示ボタンをクリック</strong>
                            <p className="ml-6 mt-1 text-sm">項目の左上に表示される <EyeOff size={14} className="inline" /> アイコンをクリックします。</p>
                        </li>
                        <li>
                            <strong>確認</strong>
                            <p className="ml-6 mt-1 text-sm">エディタでは項目が半透明で表示され、「非表示中」バッジが付きます。公開ページには表示されません。</p>
                        </li>
                        <li>
                            <strong>再表示する場合</strong>
                            <p className="ml-6 mt-1 text-sm">もう一度 <EyeOff size={14} className="inline" /> アイコンをクリックすると、項目が再表示されます。</p>
                        </li>
                    </ol>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                        <p className="text-sm text-green-800">
                            <strong>使用例：</strong> 季節限定メニュー、テスト中の新メニュー、一時的に提供できない料理などに便利です。
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'multi-language',
            title: '多言語編集の使い方',
            icon: Globe,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">ドリンクメニューを複数の言語で編集する方法：</p>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                            <strong>ドリンクセクションを開く</strong>
                            <p className="ml-6 mt-1 text-sm">エディタでドリンクセクションに移動します。</p>
                        </li>
                        <li>
                            <strong>編集したいカテゴリーをクリック</strong>
                            <p className="ml-6 mt-1 text-sm">アルコール、焼酎、またはその他のカテゴリーをクリックします。</p>
                        </li>
                        <li>
                            <strong>言語タブを選択</strong>
                            <p className="ml-6 mt-1 text-sm">上部に表示される言語タブ（日本語 / English / 한국어 / 中文）をクリックします。</p>
                        </li>
                        <li>
                            <strong>各言語の内容を編集</strong>
                            <p className="ml-6 mt-1 text-sm">選択した言語でメニュー内容を編集します。タブを切り替えて他の言語も編集できます。</p>
                        </li>
                        <li>
                            <strong>保存</strong>
                            <p className="ml-6 mt-1 text-sm">すべての変更は自動的に保存されます。</p>
                        </li>
                    </ol>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mt-4">
                        <p className="text-sm text-purple-800">
                            <strong>表示について：</strong> 日本語ページ（/）では日本語版が、英語ページ（/traveler）では英語版が表示されます。
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'images',
            title: '画像の変更方法',
            icon: ImageIcon,
            content: (
                <div className="space-y-4">
                    <p className="text-gray-700">メニュー項目の画像を変更する方法：</p>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                            <strong>画像エリアをクリック</strong>
                            <p className="ml-6 mt-1 text-sm">変更したいメニュー項目の画像部分をクリックします。</p>
                        </li>
                        <li>
                            <strong>画像ライブラリが開く</strong>
                            <p className="ml-6 mt-1 text-sm">既存の画像から選択するか、新しい画像をアップロードできます。</p>
                        </li>
                        <li>
                            <strong>画像を選択</strong>
                            <p className="ml-6 mt-1 text-sm">使用したい画像をクリックして選択します。</p>
                        </li>
                        <li>
                            <strong>編集（オプション）</strong>
                            <p className="ml-6 mt-1 text-sm">必要に応じて、画像エディタでトリミングやサイズ調整ができます。</p>
                        </li>
                        <li>
                            <strong>適用</strong>
                            <p className="ml-6 mt-1 text-sm">選択した画像が自動的にメニュー項目に適用されます。</p>
                        </li>
                    </ol>
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mt-4">
                        <p className="text-sm text-indigo-800">
                            <strong>推奨：</strong> メニュー画像は正方形（1:1）または横長（4:3）の比率が最適です。
                        </p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#deb55a] to-[#c9a347] px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#1C1C1C]">使い方ガイド</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="閉じる"
                    >
                        <X size={24} className="text-[#1C1C1C]" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-gray-600 mb-6">
                        KABUKI寿司エディタの主要機能の使い方を説明します。各セクションをクリックして詳細を確認してください。
                    </p>

                    <div className="space-y-3">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isExpanded = expandedSection === section.id;

                            return (
                                <div
                                    key={section.id}
                                    className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} className="text-[#deb55a]" />
                                            <span className="font-bold text-lg text-gray-800">
                                                {section.title}
                                            </span>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp size={20} className="text-gray-600" />
                                        ) : (
                                            <ChevronDown size={20} className="text-gray-600" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="px-6 py-5 bg-white">
                                            {section.content}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                        ご不明な点がございましたら、システム管理者にお問い合わせください。
                    </p>
                </div>
            </div>
        </div>
    );
}
