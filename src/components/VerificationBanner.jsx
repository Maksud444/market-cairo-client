import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { FiShield, FiX, FiArrowRight } from 'react-icons/fi';

export default function VerificationBanner({ status }) {
  const { t } = useTranslation('common');
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isPending = status === 'pending';

  return (
    <div
      className={`w-full z-40 px-4 py-2.5 flex items-center justify-between gap-3 ${
        isPending
          ? 'bg-yellow-500'
          : 'bg-primary-600'
      }`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <FiShield size={16} className="text-white flex-shrink-0" />
        <p className="text-white text-xs sm:text-sm font-medium truncate">
          {isPending ? t('verify_banner_pending') : t('verify_banner_text')}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {!isPending && (
          <Link
            href="/verify"
            className="flex items-center gap-1 bg-white text-primary-700 text-xs font-bold px-3 py-1 rounded-full hover:bg-primary-50 transition-colors whitespace-nowrap"
          >
            {t('verify_banner_cta')}
            <FiArrowRight size={12} />
          </Link>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white transition-colors p-0.5"
          aria-label="Dismiss"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
}
