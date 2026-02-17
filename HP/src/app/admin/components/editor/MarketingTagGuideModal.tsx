import { X, Code, FileCode, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MarketingTagGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MarketingTagGuideModal({ isOpen, onClose }: MarketingTagGuideModalProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('current-tags');

    if (!isOpen) return null;

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const sections = [
        {
            id: 'current-tags',
            title: '現在実装されているタグ',
            icon: Code,
            content: (
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800">Google Tag Manager (GTM)</h3>
                    <p className="text-gray-700">実装場所: <code className="bg-gray-100 px-2 py-1 rounded text-sm">index.html</code></p>

                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">1. ヘッダー部分（&lt;head&gt;内）</h4>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                <pre>{`<!-- Google Tag Manager -->
<script>(function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({
      'gtm.start':
        new Date().getTime(), event: 'gtm.js'
    }); var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-PCWMP294');
</script>
<!-- End Google Tag Manager -->`}</pre>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                <strong>位置:</strong> &lt;head&gt;タグの最初（5-14行目）<br />
                                <strong>GTM ID:</strong> GTM-PCWMP294
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">2. ボディ部分（&lt;body&gt;直後）</h4>
                            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                <pre>{`<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PCWMP294" 
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`}</pre>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                <strong>位置:</strong> &lt;body&gt;タグの直後（21-24行目）<br />
                                <strong>目的:</strong> JavaScriptが無効な環境でもGTMを動作させるためのフォールバック
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'add-via-gtm',
            title: '方法1: Google Tag Manager経由で追加（推奨）',
            icon: Settings,
            content: (
                <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                        <p className="text-sm text-green-800">
                            <strong>✅ メリット:</strong> コードを変更せずにタグを管理できる、GTMの管理画面から簡単に追加・削除・編集が可能、バージョン管理とロールバックが可能
                        </p>
                    </div>

                    <h4 className="font-bold text-gray-800">手順:</h4>
                    <ol className="list-decimal list-inside space-y-3 text-gray-700">
                        <li>
                            <strong>Google Tag Managerにログイン</strong>
                            <p className="ml-6 mt-1 text-sm">
                                <a href="https://tagmanager.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    https://tagmanager.google.com/
                                </a> にアクセス
                            </p>
                        </li>
                        <li>
                            <strong>コンテナを選択</strong>
                            <p className="ml-6 mt-1 text-sm">コンテナID <code className="bg-gray-100 px-2 py-1 rounded">GTM-PCWMP294</code> を選択</p>
                        </li>
                        <li>
                            <strong>新しいタグを作成</strong>
                            <p className="ml-6 mt-1 text-sm">「タグ」→「新規」をクリック</p>
                        </li>
                        <li>
                            <strong>タグの種類を選択</strong>
                            <p className="ml-6 mt-1 text-sm">例: Google Analytics、Facebook Pixel、カスタムHTML等</p>
                        </li>
                        <li>
                            <strong>トリガーを設定</strong>
                            <p className="ml-6 mt-1 text-sm">全ページ、特定のページ、特定のイベント等</p>
                        </li>
                        <li>
                            <strong>保存して公開</strong>
                            <p className="ml-6 mt-1 text-sm">「保存」→「公開」をクリック</p>
                        </li>
                    </ol>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                        <p className="text-sm text-blue-800">
                            <strong>対応可能なタグ:</strong> Google Analytics 4 (GA4)、Google Ads、Meta Pixel (Facebook/Instagram)、Twitter Pixel、LINE Tag、カスタムHTMLタグなど
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'add-directly',
            title: '方法2: 直接HTMLに追加（非推奨）',
            icon: FileCode,
            content: (
                <div className="space-y-4">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>⚠️ 注意:</strong> コードを直接編集する必要がある場合のみ使用してください
                        </p>
                    </div>

                    <h4 className="font-bold text-gray-800">ファイル: <code className="bg-gray-100 px-2 py-1 rounded text-sm">index.html</code></h4>

                    <div>
                        <h5 className="font-semibold text-gray-800 mb-2">ステップ1: &lt;head&gt;内にタグを追加</h5>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <pre>{`<head>
  <!-- Google Tag Manager -->
  <script>...</script>
  <!-- End Google Tag Manager -->
  
  <!-- ここに新しいタグを追加 -->
  <script>
    // 例: Meta Pixel
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'YOUR_PIXEL_ID');
    fbq('track', 'PageView');
  </script>
</head>`}</pre>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-semibold text-gray-800 mb-2">ステップ2: 必要に応じて&lt;body&gt;内にも追加</h5>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <pre>{`<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript>...</noscript>
  
  <!-- ここに新しいnoscriptタグを追加（必要な場合） -->
  <noscript>
    <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>
  </noscript>
</body>`}</pre>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-semibold text-gray-800 mb-2">ステップ3: 変更をコミット＆デプロイ</h5>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <pre>{`git add index.html
git commit -m "Add [タグ名] tracking tag"
git push origin main`}</pre>
                        </div>
                    </div>

                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                        <p className="text-sm text-red-800">
                            <strong>重要:</strong> タグを追加しすぎるとページ読み込み速度が低下する可能性があります。必ずテスト環境で確認してから本番環境にデプロイしてください。
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
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">タグ埋め込み指示書</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="閉じる"
                    >
                        <X size={24} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-gray-600 mb-6">
                        マーケティングタグの実装状況と追加方法を説明します。各セクションをクリックして詳細を確認してください。
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
                                            <Icon size={20} className="text-purple-600" />
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
                        ご不明な点がございましたら、開発チームまでお問い合わせください。
                    </p>
                </div>
            </div>
        </div>
    );
}
