import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';

export default function BannerSlider() {
  const { t } = useTranslation('common');
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);
  const fadingRef = useRef(false);

  const banners = [
    {
      id: 1,
      image: '/images/hero1.png',
      title: t('banner.slide1_title'),
      subtitle: t('banner.slide1_subtitle'),
      cta: t('banner.browse_all'),
      ctaLink: '/search',
      accentColor: '#e94560',
      tag: 'Best Deals',
    },
    {
      id: 2,
      image: '/images/hero2.png',
      title: t('banner.slide2_title'),
      subtitle: t('banner.slide2_subtitle'),
      cta: t('banner.shop_now'),
      ctaLink: '/search?category=Mobile+%26+Tablets',
      accentColor: '#48cae4',
      tag: 'Top Electronics',
    },
    {
      id: 3,
      image: '/images/hero3.png',
      title: t('banner.slide3_title'),
      subtitle: t('banner.slide3_subtitle'),
      cta: t('banner.explore'),
      ctaLink: '/search?category=Fashion+%26+Beauty',
      accentColor: '#f72585',
      tag: 'Fashion & Style',
    },
  ];

  const len = banners.length;

  const goTo = (idx) => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    setFading(true);
    setTimeout(() => {
      setCurrent((idx + len) % len);
      setFading(false);
      fadingRef.current = false;
    }, 250);
  };

  // Use ref to always have latest current in the interval
  const currentRef = useRef(current);
  useEffect(() => { currentRef.current = current; }, [current]);

  // Auto-advance — single interval, uses ref to get latest current
  useEffect(() => {
    timerRef.current = setInterval(() => {
      goTo(currentRef.current + 1);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []); // runs once only

  const handlePrev = () => {
    clearInterval(timerRef.current);
    goTo(current - 1);
    timerRef.current = setInterval(() => { goTo(currentRef.current + 1); }, 5000);
  };

  const handleNext = () => {
    clearInterval(timerRef.current);
    goTo(current + 1);
    timerRef.current = setInterval(() => { goTo(currentRef.current + 1); }, 5000);
  };

  const handleDot = (i) => {
    clearInterval(timerRef.current);
    goTo(i);
    timerRef.current = setInterval(() => { goTo(currentRef.current + 1); }, 5000);
  };

  const banner = banners[current];

  const dots = (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
      {banners.map((_, i) => (
        <span
          key={i}
          onClick={() => handleDot(i)}
          className="cursor-pointer block rounded-full transition-all duration-300"
          style={{
            width: i === current ? '20px' : '6px',
            height: '6px',
            backgroundColor: i === current ? banner.accentColor : 'rgba(255,255,255,0.5)',
          }}
        />
      ))}
    </div>
  );

  const arrows = (size = 'md') => (
    <>
      <button onClick={handlePrev} aria-label="Previous"
        className={`absolute left-2.5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/55 text-white transition-all backdrop-blur-sm flex items-center justify-center ${size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'}`}>
        <FiChevronLeft size={size === 'sm' ? 14 : 18} />
      </button>
      <button onClick={handleNext} aria-label="Next"
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 hover:bg-black/55 text-white transition-all backdrop-blur-sm flex items-center justify-center ${size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'}`}>
        <FiChevronRight size={size === 'sm' ? 14 : 18} />
      </button>
    </>
  );

  const content = (isMobile) => (
    <div className={`relative z-10 h-full flex items-center transition-opacity duration-250 ${fading ? 'opacity-0' : 'opacity-100'} ${isMobile ? 'px-8' : 'px-12'}`}>
      <div className="flex-1 min-w-0 max-w-md">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold text-white mb-2 ${isMobile ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}`}
          style={{ backgroundColor: banner.accentColor + '44', border: `1px solid ${banner.accentColor}88` }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: banner.accentColor }} />
          {banner.tag}
        </span>
        <h3 className={`text-white font-bold leading-tight drop-shadow-md ${isMobile ? 'text-base' : 'text-2xl lg:text-3xl'}`}>
          {banner.title}
        </h3>
        <p className={`text-white/70 mt-1 drop-shadow ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
          {banner.subtitle}
        </p>
        <Link
          href={banner.ctaLink}
          className={`inline-flex items-center gap-1.5 font-semibold rounded-xl text-white mt-3 transition-all hover:scale-105 active:scale-95 shadow-lg ${isMobile ? 'text-xs px-3 py-1.5' : 'text-sm px-5 py-2.5'}`}
          style={{ backgroundColor: banner.accentColor }}>
          {banner.cta}
          <FiChevronRight size={isMobile ? 13 : 15} />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden mx-3 mt-3 mb-1">
        <div className="relative overflow-hidden rounded-2xl" style={{ height: '155px' }}>
          <img
            src={banner.image}
            alt={banner.tag}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.25s ease' }}
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
          {content(true)}
          {arrows('sm')}
          {dots}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block container-app mt-8 mb-4">
        <div className="relative overflow-hidden rounded-2xl" style={{ height: '420px' }}>
          <img
            src={banner.image}
            alt={banner.tag}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.25s ease' }}
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          {content(false)}
          {arrows('md')}
          {dots}
        </div>
      </div>
    </>
  );
}
