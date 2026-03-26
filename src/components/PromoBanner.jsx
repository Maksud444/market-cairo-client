import { useRouter } from 'next/router';
import { FiZap, FiTag, FiShield, FiArrowRight } from 'react-icons/fi';
import Cookies from 'js-cookie';
import { useAuthStore, useUIStore } from '../lib/store';
import { useTranslation } from 'next-i18next';

export default function PromoBanner() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const handlePostAd = () => {
    const hasToken = !!Cookies.get('token');
    if (isAuthenticated || hasToken) {
      router.push('/post');
    } else {
      openLoginModal();
    }
  };

  const features = [
    { icon: FiZap,    label: t('promo.feature_1'), color: 'text-yellow-400' },
    { icon: FiTag,    label: t('promo.feature_2'), color: 'text-green-400'  },
    { icon: FiShield, label: t('promo.feature_3'), color: 'text-blue-400'   },
  ];

  return (
    <div className="container-app my-3 lg:my-4">
      <div className="bg-[#0f1923] rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 lg:px-8 lg:py-5">

        {/* Left: title */}
        <div className="text-center sm:text-left">
          <p className="text-white font-bold text-base lg:text-lg leading-tight">
            {t('promo.sell_anything_title')}
          </p>
          <p className="text-gray-400 text-xs lg:text-sm mt-0.5">
            {t('promo.sell_anything_subtitle')}
          </p>
        </div>

        {/* Center: feature pills */}
        <div className="flex items-center gap-3 lg:gap-6 flex-wrap justify-center">
          {features.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={14} className={color} />
              <span className="text-gray-300 text-xs lg:text-sm whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>

        {/* Right: CTA */}
        <button
          onClick={handlePostAd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0"
        >
          {t('promo.post_free_ad')} <FiArrowRight size={15} />
        </button>
      </div>
      </div>
    </div>
  );
}
