import { useRouter } from 'next/router';
import { FiZap, FiTag, FiShield, FiArrowRight } from 'react-icons/fi';
import Cookies from 'js-cookie';
import { useAuthStore, useUIStore } from '../lib/store';

export default function PromoBanner() {
  const router = useRouter();
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
    { icon: FiZap,    label: 'Post in 60 seconds', color: 'text-yellow-400' },
    { icon: FiTag,    label: '100% Free to List',  color: 'text-green-400'  },
    { icon: FiShield, label: 'Safe & Trusted',      color: 'text-blue-400'   },
  ];

  return (
    <div className="container-app my-3 lg:my-4">
      <div className="bg-[#0f1923] rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 lg:px-8 lg:py-5">

        {/* Left: title */}
        <div className="text-center sm:text-left">
          <p className="text-white font-bold text-base lg:text-lg leading-tight">
            Sell anything in Cairo
          </p>
          <p className="text-gray-400 text-xs lg:text-sm mt-0.5">
            Egypt's trusted buy &amp; sell marketplace
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
          Post Free Ad <FiArrowRight size={15} />
        </button>
      </div>
      </div>
    </div>
  );
}
