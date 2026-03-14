import { useState, useEffect } from 'react';
import Link from 'next/link';

const banners = [
  {
    id: 1,
    title: 'Buy & Sell Anything',
    subtitle: "Cairo's #1 Trusted Marketplace",
    cta: 'Browse All',
    ctaLink: '/search',
    bg: 'from-blue-950 via-blue-900 to-indigo-900',
    accent: 'bg-blue-500',
    dot: 'bg-blue-400',
    circles: ['bg-blue-700/40', 'bg-blue-600/20'],
    icon: '🛒',
  },
  {
    id: 2,
    title: 'Mobile & Tablets',
    subtitle: 'Best deals on phones & gadgets',
    cta: 'Shop Now',
    ctaLink: '/search?category=Mobile+%26+Tablets',
    bg: 'from-gray-950 via-slate-900 to-zinc-900',
    accent: 'bg-green-500',
    dot: 'bg-green-400',
    circles: ['bg-green-700/20', 'bg-emerald-600/10'],
    icon: '📱',
  },
  {
    id: 3,
    title: 'Fashion & Beauty',
    subtitle: 'Discover amazing fashion deals',
    cta: 'Explore',
    ctaLink: '/search?category=Fashion+%26+Beauty',
    bg: 'from-rose-950 via-pink-900 to-purple-950',
    accent: 'bg-pink-500',
    dot: 'bg-pink-400',
    circles: ['bg-pink-700/30', 'bg-purple-600/20'],
    icon: '👗',
  },
  {
    id: 4,
    title: 'Electronics',
    subtitle: 'Laptops, TVs, cameras & more',
    cta: 'View Deals',
    ctaLink: '/search?category=Electronics',
    bg: 'from-amber-950 via-orange-900 to-red-950',
    accent: 'bg-orange-500',
    dot: 'bg-orange-400',
    circles: ['bg-orange-700/30', 'bg-red-600/20'],
    icon: '💻',
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % banners.length);
        setIsAnimating(false);
      }, 200);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setIsAnimating(false);
    }, 150);
  };

  const banner = banners[current];

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden mx-4 mt-3 mb-1">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.bg} transition-all duration-300`} style={{ height: '130px' }}>
          <div className={`absolute right-10 top-1/2 -translate-y-1/2 w-28 h-28 ${banner.circles[0]} rounded-full blur-sm`} />
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 ${banner.circles[1]} rounded-full`} />
          <div className={`relative z-10 p-4 h-full flex flex-col justify-between transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 ${banner.accent} rounded-full`} />
                <span className="text-white/60 text-xs uppercase tracking-wider font-medium">MySouqify</span>
              </div>
              <h3 className="text-white font-bold text-lg leading-tight">{banner.title}</h3>
              <p className="text-white/60 text-xs mt-0.5">{banner.subtitle}</p>
            </div>
            <Link href={banner.ctaLink} className="self-start px-4 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold rounded-lg hover:bg-white/25 transition-colors">
              {banner.cta} →
            </Link>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-5xl opacity-20 select-none">{banner.icon}</div>
          <div className="absolute bottom-2.5 right-4 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className={`relative overflow-hidden bg-gradient-to-r ${banner.bg} transition-all duration-300`} style={{ height: '160px' }}>
          <div className="container-app h-full mx-auto relative">
            <div className={`absolute right-32 top-1/2 -translate-y-1/2 w-52 h-52 ${banner.circles[0]} rounded-full blur-sm`} />
            <div className={`absolute right-16 top-1/2 -translate-y-1/2 w-32 h-32 ${banner.circles[1]} rounded-full`} />
            <div className={`relative z-10 px-6 h-full flex flex-col justify-center gap-2 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${banner.accent} rounded-full`} />
                <span className="text-white/60 text-xs uppercase tracking-wider font-medium">MySouqify</span>
              </div>
              <h3 className="text-white font-bold text-2xl leading-tight">{banner.title}</h3>
              <p className="text-white/60 text-sm">{banner.subtitle}</p>
              <Link href={banner.ctaLink} className="self-start px-5 py-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/25 transition-colors mt-1">
                {banner.cta} →
              </Link>
            </div>
            <div className="absolute right-20 top-1/2 -translate-y-1/2 text-8xl opacity-20 select-none">{banner.icon}</div>
          </div>
          <div className="absolute bottom-3 right-6 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
