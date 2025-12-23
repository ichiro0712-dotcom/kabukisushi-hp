import { Bell } from 'lucide-react';
import { UserMenu } from './UserMenu';

export function TopNav() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* ロゴとサイト名 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-xl text-white font-bold">K</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">KABUKI寿司</h1>
            <p className="text-xs text-gray-500">1番通り店 管理画面</p>
          </div>
        </div>

        {/* 右側のメニュー */}
        <div className="flex items-center gap-4">
          {/* 言語切り替え */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200">
            <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px] overflow-hidden">
              🇯🇵
            </span>
            <span className="hidden sm:inline">日本語</span>
          </button>

          {/* ヘルプ */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="text-sm font-medium">ヘルプ</span>
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          {/* 通知アイコン */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* ユーザーメニュー */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
