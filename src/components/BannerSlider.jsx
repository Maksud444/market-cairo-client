import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';

export default function BannerSlider() {
  const { t } = useTranslation('common');
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const banners = [
    {
      id: 1,
      title: t('banner.slide1_title'),
      subtitle: t('banner.slide1_subtitle'),
      cta: t('banner.browse_all'),
      ctaLink: '/search',
      bg: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
      accentColor: '#e94560',
      icon: '🛒',
      tag: 'Best Deals',
    },
    {
      id: 2,
      title: t('banner.slide2_title'),
      subtitle: t('banner.slide2_subtitle'),
      cta: t('banner.shop_now'),
      ctaLink: '/search?category=Mobile+%26+Tablets',
      bg: 'from-[#0d1b2a] via-[#1b263b] to-[#415a77]',
      accentColor: '#48cae4',
      icon: '📱',
      tag: 'Top Electronics',
    },
    {
      id: 3,
      title: t('banner.slide3_title'),
      subtitle: t('banner.slide3_subtitle'),
      cta: t('banner.explore'),
      ctaLink: '/search?category=Fashion+%26+Beauty',
      bg: 'from-[#2d1b4e] via-[#3d2065] to-[#6b3fa0]',
      accentColor: '#f72585',
      icon: '👗',
      tag: 'Fashion & Style',
    },
    {
      id: 4,
      title: t('banner.slide4_title'),
      subtitle: t('banner.slide4_subtitle'),
      cta: t('banner.view_deals'),
      ctaLink: '/search?category=Electronics',
      bg: 'from-[#1a0a00] via-[#3d1a00] to-[#7c3000]',
      accentColor: '#fb8500',
      icon: '💻',
      tag: 'Electronics',
    },
  ];

  const goTo = useCallback((idx) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 200);
  }, [isAnimating]);

  const prev = () => goTo((current - 1 + banners.length) % banners.length);
  const next = () => goTo((current + 1) % banners.length);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [current]);

  const banner = banners[current];

  const content = (isMobile) => (
    <div className={`relative z-10 h-full flex items-center justify-center transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'} ${isMobile ? 'px-10' : 'px-16'}`}>
      <div className="flex-1 text-center">
        {/* Tag */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white/90"
            style={{ backgroundColor: banner.accentColor + '33', border: `1px solid ${banner.accentColor}55` }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: banner.accentColor }} />
            {banner.tag}
          </span>
        </div>
        {/* Icon + Title */}
        <div className={`select-none mb-1 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>{banner.icon}</div>
        <h3 className={`text-white font-bold leading-tight ${isMobile ? 'text-lg' : 'text-2xl lg:text-3xl'}`}>
          {banner.title}
        </h3>
        <p className={`text-white/50 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>{banner.subtitle}</p>
        {/* CTA */}
        <Link href={banner.ctaLink}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-xl text-white mt-3 transition-all hover:scale-105 active:scale-95 ${isMobile ? 'text-xs px-3 py-1.5' : 'text-sm px-5 py-2'}`}
          style={{ backgroundColor: banner.accentColor }}>
          {banner.cta}
          <FiChevronRight size={isMobile ? 13 : 15} />
        </Link>
      </div>
    </div>
  );

  const dots = (
    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
      {banners.map((_, i) => (
        <span
          key={i}
          onClick={() => goTo(i)}
          className="cursor-pointer block rounded-full transition-all duration-300"
          style={{
            width: i === current ? '18px' : '5px',
            height: '5px',
            minWidth: 0,
            padding: 0,
            backgroundColor: i === current ? banner.accentColor : 'rgba(255,255,255,0.35)',
          }}
        />
      ))}
    </div>
  );

  const arrows = (size = 'md') => (
    <>
      <button onClick={prev} aria-label="Previous"
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all flex items-center justify-center ${size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'}`}>
        <FiChevronLeft size={size === 'sm' ? 13 : 15} />
      </button>
      <button onClick={next} aria-label="Next"
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all flex items-center justify-center ${size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'}`}>
        <FiChevronRight size={size === 'sm' ? 13 : 15} />
      </button>
    </>
  );

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden mx-3 mt-3 mb-1">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.bg}`} style={{ height: '140px' }}>
          {content(true)}
          {arrows('sm')}
          {dots}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block container-app mt-4 mb-2">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.bg}`} style={{ height: '170px' }}>
          {content(false)}
          {arrows('md')}
          {dots}
        </div>
      </div>
    </>
  );
}
