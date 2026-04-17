import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FiShield, FiX } from 'react-icons/fi';

const DISMISS_KEY = 'verify_banner_dismissed_until';
const DISMISS_HOURS = 24;

export default function VerificationBanner({ status }) {
  const { t } = useTranslation('common');
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const until = localStorage.getItem(DISMISS_KEY);
    if (until && Date.now() < Number(until)) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, []);

  if (router.pathname.startsWith('/admin')) return null;
  if (!visible) return null;

  const isPending = status === 'pending';

  const handleDismiss = () => {
    const until = Date.now() + DISMISS_HOURS * 60 * 60 * 1000;
    localStorage.setItem(DISMISS_KEY, String(until));
    setVisible(false);
  };

  return (
    <div className="w-full bg-blue-500 px-4 py-2.5 flex items-center gap-3">
      <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
        <FiShield size={16} className="text-white flex-shrink-0" />
        <p className="text-white text-xs sm:text-sm font-medium text-center">
          {isPending ? t('verify_banner_pending') : t('verify_banner_text')}
        </p>
        {!isPending && (
          <Link
            href="/verify"
            className="flex-shrink-0 border border-white text-white text-xs font-semibold px-3 py-1 rounded hover:bg-white hover:text-blue-500 transition-colors whitespace-nowrap"
          >
            {t('verify_banner_cta')}
          </Link>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-white/80 hover:text-white transition-colors flex-shrink-0 p-0.5"
        aria-label="Dismiss"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}
