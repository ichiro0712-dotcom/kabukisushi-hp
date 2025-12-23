import { ReactNode } from 'react';
import { TopNav } from '../components/navigation/TopNav';
import { SideNav } from '../components/navigation/SideNav';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* トップナビゲーション */}
      <TopNav />

      {/* サイドナビゲーション */}
      <SideNav />

      {/* メインコンテンツエリア */}
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-8rem)]">
          {children}
        </div>

        {/* フッター */}
        <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-6">
              <a href="/" className="hover:text-gray-900 transition-colors">ホーム</a>
              <a href="#" className="hover:text-gray-900 transition-colors">会社概要</a>
              <a href="#" className="hover:text-gray-900 transition-colors">利用規約</a>
              <a href="#" className="hover:text-gray-900 transition-colors">プライバシー</a>
            </div>
            <div className="flex items-center gap-4">
              <span>© 2024 KABUKI Sushi. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
