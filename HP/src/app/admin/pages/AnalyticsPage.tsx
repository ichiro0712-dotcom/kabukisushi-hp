import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    BarChart3,
    TrendingUp,
    Users,
    MousePointerClick,
    Phone,
    Calendar,
    Globe,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Instagram,
    Facebook,
    Youtube,
    ExternalLink,
    Settings,
    RefreshCw,
    ChevronDown
} from 'lucide-react';
import { type StoreId, STORE_CONFIGS } from '../../../utils/storeConfig';

type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'quarter';

interface MetricCardProps {
    title: string;
    value: string;
    change?: number;
    changeLabel?: string;
    icon: React.ReactNode;
    color: string;
}

const MetricCard = ({ title, value, change, changeLabel, icon, color }: MetricCardProps) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <span className="font-medium">{Math.abs(change)}%</span>
                        <span className="text-gray-400">{changeLabel || '前期比'}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                {icon}
            </div>
        </div>
    </div>
);

interface ActionMetricProps {
    title: string;
    value: string;
    subValue?: string;
    icon: React.ReactNode;
    color: string;
}

const ActionMetric = ({ title, value, subValue, icon, color }: ActionMetricProps) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className={`p-2.5 rounded-lg ${color}`}>
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
    </div>
);

export default function AnalyticsPage() {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [selectedStore, setSelectedStore] = useState<StoreId>('honten');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Looker Studio embed URL (placeholder - replace with actual URL)
    const lookerStudioUrl = '';
    const storeConfig = STORE_CONFIGS[selectedStore];

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1500);
    };

    const timeRangeLabels: Record<TimeRange, string> = {
        today: '今日',
        yesterday: '昨日',
        week: '過去7日',
        month: '過去30日',
        quarter: '過去90日'
    };

    // Demo data - これらはGA4のAPIまたはLooker Studioから取得するデータのプレースホルダー
    const demoMetrics = {
        pageViews: { value: '3,847', change: 12.5 },
        uniqueVisitors: { value: '1,254', change: 8.3 },
        avgSessionDuration: { value: '2:34', change: -3.2 },
        bounceRate: { value: '42.1%', change: -5.8 },
        reservationClicks: { value: '87', change: 23.1 },
        phoneClicks: { value: '156', change: 15.4 },
        travelerPageViews: { value: '892', change: 45.2 },
        snsClicks: {
            instagram: '234',
            facebook: '89',
            youtube: '67',
            tiktok: '156'
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin/editor')}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <BarChart3 size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Analytics</p>
                                    <div className="relative">
                                        <select
                                            value={selectedStore}
                                            onChange={(e) => setSelectedStore(e.target.value as StoreId)}
                                            className="appearance-none text-lg font-bold text-gray-900 bg-transparent pr-6 cursor-pointer hover:text-gray-700 focus:outline-none"
                                        >
                                            {Object.values(STORE_CONFIGS).map((config) => (
                                                <option key={config.id} value={config.id}>
                                                    {config.displayName}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Time Range Selector */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {Object.entries(timeRangeLabels).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setTimeRange(key as TimeRange)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                            timeRange === key
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleRefresh}
                                className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all ${
                                    isRefreshing ? 'animate-spin' : ''
                                }`}
                            >
                                <RefreshCw size={18} />
                            </button>

                            <a
                                href="https://analytics.google.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                <ExternalLink size={14} />
                                GA4を開く
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Primary Metrics */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        主要指標
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="ページビュー"
                            value={demoMetrics.pageViews.value}
                            change={demoMetrics.pageViews.change}
                            icon={<Eye size={24} className="text-white" />}
                            color="bg-blue-500"
                        />
                        <MetricCard
                            title="ユニークビジター"
                            value={demoMetrics.uniqueVisitors.value}
                            change={demoMetrics.uniqueVisitors.change}
                            icon={<Users size={24} className="text-white" />}
                            color="bg-purple-500"
                        />
                        <MetricCard
                            title="平均滞在時間"
                            value={demoMetrics.avgSessionDuration.value}
                            change={demoMetrics.avgSessionDuration.change}
                            icon={<TrendingUp size={24} className="text-white" />}
                            color="bg-green-500"
                        />
                        <MetricCard
                            title="直帰率"
                            value={demoMetrics.bounceRate.value}
                            change={demoMetrics.bounceRate.change}
                            changeLabel="(低いほど良い)"
                            icon={<MousePointerClick size={24} className="text-white" />}
                            color="bg-orange-500"
                        />
                    </div>
                </section>

                {/* Action Metrics */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        アクション指標 (コンバージョン)
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Reservation & Phone */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Calendar size={16} className="text-purple-500" />
                                予約・お問い合わせ
                            </h3>
                            <div className="space-y-3">
                                <ActionMetric
                                    title="予約ボタンクリック"
                                    value={demoMetrics.reservationClicks.value}
                                    subValue={`+${demoMetrics.reservationClicks.change}% vs 前週`}
                                    icon={<Calendar size={18} className="text-white" />}
                                    color="bg-purple-500"
                                />
                                <ActionMetric
                                    title="電話ボタンクリック"
                                    value={demoMetrics.phoneClicks.value}
                                    subValue={`+${demoMetrics.phoneClicks.change}% vs 前週`}
                                    icon={<Phone size={18} className="text-white" />}
                                    color="bg-green-500"
                                />
                            </div>
                        </div>

                        {/* SNS Clicks */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Globe size={16} className="text-blue-500" />
                                SNSクリック
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <ActionMetric
                                    title="Instagram"
                                    value={demoMetrics.snsClicks.instagram}
                                    icon={<Instagram size={18} className="text-white" />}
                                    color="bg-gradient-to-br from-purple-500 to-pink-500"
                                />
                                <ActionMetric
                                    title="Facebook"
                                    value={demoMetrics.snsClicks.facebook}
                                    icon={<Facebook size={18} className="text-white" />}
                                    color="bg-blue-600"
                                />
                                <ActionMetric
                                    title="YouTube"
                                    value={demoMetrics.snsClicks.youtube}
                                    icon={<Youtube size={18} className="text-white" />}
                                    color="bg-red-500"
                                />
                                <ActionMetric
                                    title="TikTok"
                                    value={demoMetrics.snsClicks.tiktok}
                                    icon={<Globe size={18} className="text-white" />}
                                    color="bg-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Page Performance */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        ページ別パフォーマンス
                    </h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">ページ</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">PV</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">滞在時間</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">直帰率</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">前週比</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">{storeConfig.basePath === '/' ? '/' : storeConfig.basePath} ({storeConfig.shortName} - 日本語)</span>
                                            <span className={`px-2 py-0.5 text-xs rounded ${selectedStore === 'honten' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{storeConfig.shortName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">{selectedStore === 'honten' ? '2,955' : '—'}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">{selectedStore === 'honten' ? '2:48' : '—'}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">{selectedStore === 'honten' ? '38.5%' : '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        {selectedStore === 'honten' ? (
                                            <span className="text-green-600 text-sm font-medium">+8.2%</span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">データ収集中</span>
                                        )}
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-900">{storeConfig.travelerPath} ({storeConfig.shortName} - English)</span>
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">翻訳</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">{selectedStore === 'honten' ? demoMetrics.travelerPageViews.value : '—'}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">{selectedStore === 'honten' ? '3:12' : '—'}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-600">{selectedStore === 'honten' ? '32.1%' : '—'}</td>
                                    <td className="px-6 py-4 text-right">
                                        {selectedStore === 'honten' ? (
                                            <span className="text-green-600 text-sm font-medium">+{demoMetrics.travelerPageViews.change}%</span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">データ収集中</span>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Menu Section Performance */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                        メニューセクション閲覧数
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'NIGIRI', views: '1,234', color: 'bg-red-50 text-red-700' },
                            { name: 'MAKIMONO', views: '856', color: 'bg-orange-50 text-orange-700' },
                            { name: 'IPPIN', views: '678', color: 'bg-amber-50 text-amber-700' },
                            { name: 'DRINK', views: '543', color: 'bg-blue-50 text-blue-700' },
                        ].map((section) => (
                            <div key={section.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${section.color}`}>
                                    {section.name}
                                </span>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{section.views}</p>
                                <p className="text-xs text-gray-500">閲覧数</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Looker Studio Embed */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                            詳細レポート (Looker Studio)
                        </h2>
                        <a
                            href="https://lookerstudio.google.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <Settings size={14} />
                            ダッシュボード設定
                        </a>
                    </div>

                    {lookerStudioUrl ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <iframe
                                src={lookerStudioUrl}
                                width="100%"
                                height="600"
                                frameBorder="0"
                                style={{ border: 0 }}
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <BarChart3 size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Looker Studio連携</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                GA4と連携したLooker Studioダッシュボードを埋め込むことで、
                                より詳細なアクセス解析レポートを表示できます。
                            </p>
                            <div className="space-y-3">
                                <a
                                    href="https://lookerstudio.google.com/reporting/create"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <ExternalLink size={16} />
                                    Looker Studioでレポート作成
                                </a>
                                <p className="text-xs text-gray-400">
                                    作成後、共有設定を「リンクを知っている全員」に変更し、<br />
                                    埋め込みURLをこのページに設定してください。
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Setup Instructions */}
                <section className="mb-8">
                    <details className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <summary className="px-6 py-4 cursor-pointer text-sm font-bold text-gray-700 hover:bg-gray-50">
                            GA4/GTMの設定手順
                        </summary>
                        <div className="px-6 pb-6 pt-2 space-y-4 text-sm text-gray-600">
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">1. GTMでイベント設定</h4>
                                <p>GTM ID: <code className="bg-gray-100 px-2 py-0.5 rounded">GTM-PCWMP294</code></p>
                                <p className="mt-1">以下のカスタムイベントがdataLayerにプッシュされます:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                                    <li><code>reservation_click</code> - 予約ボタンクリック</li>
                                    <li><code>phone_click</code> - 電話ボタンクリック</li>
                                    <li><code>sns_click</code> - SNSボタンクリック</li>
                                    <li><code>language_switch</code> - 言語切り替え</li>
                                    <li><code>menu_section_view</code> - メニューセクション閲覧</li>
                                    <li><code>scroll_depth</code> - スクロール深度</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">2. GA4でイベント登録</h4>
                                <p>GTMで取得したイベントをGA4で「コンバージョン」として登録してください。</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">3. Looker Studioでダッシュボード作成</h4>
                                <p>GA4をデータソースとしてLooker Studioでカスタムダッシュボードを作成し、このページに埋め込みます。</p>
                            </div>
                        </div>
                    </details>
                </section>
            </main>
        </div>
    );
}
