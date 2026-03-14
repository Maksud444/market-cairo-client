import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiBell, FiArrowLeft, FiCheck, FiShoppingBag, FiMessageSquare, FiStar, FiInfo } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { getI18nProps } from '../lib/i18n';
import { useAuthStore } from '../lib/store';
import { authAPI } from '../lib/api';

const getNotifIcon = (type) => {
  switch (type) {
    case 'message': return FiMessageSquare;
    case 'listing': return FiShoppingBag;
    case 'review': return FiStar;
    default: return FiBell;
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    authAPI.getNotifications()
      .then(res => {
        if (res.data.success) setNotifications(res.data.notifications);
      })
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, router]);

  const markRead = async (notif) => {
    if (!notif.read) {
      try {
        await authAPI.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch {}
    }
    if (notif.relatedId) {
      const path = notif.type === 'listing' ? `/listing/${notif.relatedId}` : '/dashboard';
      router.push(path);
    }
  };

  const markAllRead = async () => {
    try {
      await authAPI.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Head>
        <title>Notifications - MySouqify</title>
      </Head>

      <div className="min-h-screen bg-gray-950 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-white hover:text-gray-300 transition-colors">
            <FiArrowLeft size={22} />
          </button>
          <h1 className="text-white font-semibold text-base">Notifications</h1>
          {unreadCount > 0 ? (
            <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
              <FiCheck size={14} />
              Mark all read
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-5 shadow-lg">
              <FiBell className="text-yellow-400" size={40} />
            </div>
            <h2 className="text-white font-bold text-xl mb-2">No notifications yet</h2>
            <p className="text-gray-500 text-sm">Check back here for updates</p>
          </div>
        ) : (
          <div className="flex-1 divide-y divide-gray-800/60">
            {notifications.map((notif) => {
              const Icon = getNotifIcon(notif.type);
              return (
                <div
                  key={notif._id}
                  onClick={() => markRead(notif)}
                  className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-gray-900 hover:bg-gray-800' : 'hover:bg-gray-900/50'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notif.read ? 'bg-primary-900 border border-primary-700' : 'bg-gray-800'
                  }`}>
                    <Icon className={!notif.read ? 'text-primary-400' : 'text-gray-500'} size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notif.read ? 'text-white font-semibold' : 'text-gray-300 font-medium'}`}>
                      {notif.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{notif.content}</p>
                    <p className="text-gray-600 text-xs mt-1.5">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {!notif.read && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps({ locale }) {
  return { props: { ...(await getI18nProps(locale)) } };
}
