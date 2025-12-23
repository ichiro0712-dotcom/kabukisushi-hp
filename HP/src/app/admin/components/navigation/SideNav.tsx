import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Image, Settings, Home } from 'lucide-react';
import { ADMIN_ROUTES } from '../../../../utils/constants';

const navItems = [
  {
    to: ADMIN_ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    label: 'ダッシュボード',
  },
  {
    to: ADMIN_ROUTES.MENU,
    icon: UtensilsCrossed,
    label: 'メニュー管理',
  },
  {
    to: ADMIN_ROUTES.GALLERY,
    icon: Image,
    label: 'ギャラリー管理',
  },
  {
    to: ADMIN_ROUTES.SETTINGS,
    icon: Settings,
    label: '店舗情報管理',
  },
];

export function SideNav() {
  return (
    <aside className="w-64 bg-gray-900 fixed left-0 top-16 bottom-0 z-30 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        {/* パブリックサイトへのリンク */}
        <div className="pt-4 mt-4 border-t border-gray-700">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">パブリックサイト</span>
          </a>
        </div>
      </nav>
    </aside>
  );
}
