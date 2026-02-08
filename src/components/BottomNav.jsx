import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiMessageSquare, FiPlus, FiFileText, FiUser } from 'react-icons/fi';
import { useAuthStore, useMessagesStore, useUIStore } from '../lib/store';

const navItems = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Chats', href: '/messages', icon: FiMessageSquare, requiresAuth: true },
  { name: 'Sell', href: '/post', icon: FiPlus, isCenter: true, requiresAuth: true },
  { name: 'My Ads', href: '/profile?tab=listings', icon: FiFileText, requiresAuth: true },
  { name: 'Account', href: '/dashboard', icon: FiUser, requiresAuth: true },
];

export default function BottomNav() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { unreadCount } = useMessagesStore();
  const { openLoginModal } = useUIStore();

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href.split('?')[0]);
  };

  const handleClick = (item, e) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openLoginModal();
    }
  };

  return (
    <nav className="bottom-nav pb-safe">
      <div className="flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleClick(item, e)}
                className="relative -mt-5"
              >
                <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors">
                  <Icon size={24} className="text-white" />
                </div>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-primary-600 font-medium">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleClick(item, e)}
              className={`bottom-nav-item flex-1 ${active ? 'active' : ''}`}
            >
              <div className="relative">
                <Icon size={22} />
                {item.name === 'Chats' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
