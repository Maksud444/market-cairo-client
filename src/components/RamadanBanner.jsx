import Link from 'next/link';
import { FiTag, FiShield, FiZap } from 'react-icons/fi';

const stats = [
  { icon: FiZap, label: 'Post in 60 seconds', labelAr: 'انشر في 60 ثانية', color: 'text-yellow-300' },
  { icon: FiTag, label: '100% Free to List', labelAr: 'مجاني تماماً', color: 'text-green-300' },
  { icon: FiShield, label: 'Safe & Trusted', labelAr: 'آمن وموثوق', color: 'text-blue-300' },
];

export default function PromoBanner() {
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden mx-4 mt-3 mb-1">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2440 50%, #1a1a2e 100%)' }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: 1, height: 1, opacity: 0.15 + (i % 4) * 0.07,
                  top: `${(i * 43) % 90}%`, left: `${(i * 61 + 8) % 90}%` }} />
            ))}
          </div>
          <div className="relative z-10 flex items-center px-4 py-3 gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm">Sell anything in Cairo</div>
              <div className="text-white/60 text-xs mt-0.5">Fast • Free • Trusted</div>
            </div>
            <div className="flex gap-3">
              {stats.map(({ icon: Icon, color }, i) => (
                <Icon key={i} className={color} size={18} />
              ))}
            </div>
            <Link href="/post"
              className="flex-shrink-0 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              Post Ad
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block container-app mt-3 mb-2">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2440 50%, #1a1a2e 100%)', height: '100px' }}
        >
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: i % 4 === 0 ? 2 : 1, height: i % 4 === 0 ? 2 : 1, opacity: 0.1 + (i % 5) * 0.05,
                  top: `${(i * 41) % 95}%`, left: `${(i * 67 + 5) % 95}%` }} />
            ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/4"
            style={{ background: 'radial-gradient(ellipse at right center, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />

          <div className="relative z-10 h-full flex items-center px-8 gap-10">
            <div className="flex-shrink-0">
              <div className="text-white font-bold text-lg leading-tight">Sell anything in Cairo</div>
              <div className="text-white/50 text-sm mt-0.5">Egypt&apos;s trusted buy &amp; sell marketplace</div>
            </div>

            <div className="w-px h-12 bg-white/15 flex-shrink-0" />

            <div className="flex items-center gap-8 flex-1">
              {stats.map(({ icon: Icon, label, color }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className={color} size={18} />
                  </div>
                  <span className="text-white/80 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>

            <Link href="/post"
              className="flex-shrink-0 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Post Free Ad
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
