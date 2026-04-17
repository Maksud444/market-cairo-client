import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FiShield, FiX } from 'react-icons/fi';

export default function VerificationBanner({ status }) {
  const { t } = useTranslation('common');
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (router.pathname.startsWith('/admin')) return null;
  if (dismissed) return null;

  const isPending = status === 'pending';

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
        onClick={() => setDismissed(true)}
        className="text-white/80 hover:text-white transition-colors flex-shrink-0 p-0.5"
        aria-label="Dismiss"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}
