import { useState, useEffect } from 'react';

function parseTime(timeStr) {
  // timeStr like "04:40 (EET)" or "04:40"
  const match = timeStr.match(/(\d{2}):(\d{2})/);
  if (!match) return null;
  return { h: parseInt(match[1]), m: parseInt(match[2]) };
}

function formatTime(timeStr) {
  const t = parseTime(timeStr);
  if (!t) return timeStr;
  const ampm = t.h < 12 ? 'AM' : 'PM';
  const h = t.h % 12 || 12;
  return `${h}:${String(t.m).padStart(2, '0')} ${ampm}`;
}

function getCountdown(targetH, targetM) {
  const now = new Date();
  const target = new Date();
  target.setHours(targetH, targetM, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = Math.max(0, target - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getNextPrayer(fajr, maghrib) {
  if (!fajr || !maghrib) return null;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const fajrMins = fajr.h * 60 + fajr.m;
  const maghribMins = maghrib.h * 60 + maghrib.m;
  if (nowMins < fajrMins) return { name: 'Sohour', ...fajr };
  if (nowMins < maghribMins) return { name: 'Iftar', ...maghrib };
  return { name: 'Sohour', ...fajr }; // next day
}

export default function RamadanBanner() {
  const [times, setTimes] = useState(null);
  const [countdown, setCountdown] = useState('00:00:00');
  const [hijriDate, setHijriDate] = useState('');
  const [location] = useState('New Cairo');

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByAddress/${dd}-${mm}-${yyyy}?address=New+Cairo%2C+Egypt&method=5`
        );
        const data = await res.json();
        if (data.code === 200) {
          const { Fajr, Maghrib } = data.data.timings;
          const { day, month, year } = data.data.date.hijri;
          setHijriDate(`${day} ${month.en}, ${year} AH`);
          setTimes({ fajr: parseTime(Fajr), maghrib: parseTime(Maghrib), fajrStr: Fajr, maghribStr: Maghrib });
        }
      } catch (e) {
        // silently fail
      }
    };
    fetchTimes();
  }, []);

  useEffect(() => {
    if (!times) return;
    const next = getNextPrayer(times.fajr, times.maghrib);
    if (!next) return;
    const tick = () => setCountdown(getCountdown(next.h, next.m));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [times]);

  if (!times) return null;

  const next = getNextPrayer(times.fajr, times.maghrib);

  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden mx-4 mt-3 mb-1">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #1a0a2e 40%, #6b0f1a 100%)' }}
        >
          {/* Stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, opacity: 0.3 + (i % 4) * 0.1,
                  top: `${(i * 37) % 90}%`, left: `${(i * 53 + 10) % 80}%` }} />
            ))}
          </div>
          <div className="relative z-10 flex items-center px-4 py-3 gap-3">
            {/* Moon + lanterns */}
            <div className="flex-shrink-0 text-3xl">🌙</div>
            <div className="flex-1 min-w-0">
              <div className="text-yellow-300 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Ramadan Kareem • {hijriDate}</div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-white/60 text-[9px] uppercase tracking-wide">Sohour</div>
                  <div className="text-white font-bold text-sm">{formatTime(times.fajrStr)}</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="text-white/50 text-[9px] uppercase tracking-wide">
                    {next?.name === 'Sohour' ? 'till Sohour' : 'till Iftar'}
                  </div>
                  <div className="text-yellow-300 font-mono font-bold text-base">{countdown}</div>
                </div>
                <div className="text-center">
                  <div className="text-white/60 text-[9px] uppercase tracking-wide">Iftar</div>
                  <div className="text-white font-bold text-sm">{formatTime(times.maghribStr)}</div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 text-2xl">🏮</div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block container-app mt-3 mb-2">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #0d1b3e 0%, #1a0a2e 35%, #6b0f1a 100%)', height: '130px' }}
        >
          {/* Stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, opacity: 0.2 + (i % 5) * 0.08,
                  top: `${(i * 41) % 95}%`, left: `${(i * 67 + 5) % 95}%` }} />
            ))}
          </div>
          {/* Red glow right */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3"
            style={{ background: 'radial-gradient(ellipse at right center, rgba(180,20,30,0.4) 0%, transparent 70%)' }} />

          <div className="relative z-10 h-full flex items-center px-8 gap-8">
            {/* Left: decoration */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-5xl">🌙</span>
              <span className="text-4xl">🏮</span>
            </div>

            {/* Divider */}
            <div className="w-px h-16 bg-white/20" />

            {/* Hijri date + label */}
            <div className="flex-shrink-0">
              <div className="text-yellow-300 text-sm font-bold uppercase tracking-widest">Ramadan Kareem</div>
              <div className="text-white/50 text-sm mt-1">{hijriDate}</div>
            </div>

            {/* Divider */}
            <div className="w-px h-16 bg-white/20" />

            {/* Sohour */}
            <div className="flex-shrink-0 text-center">
              <div className="text-white/60 text-xs uppercase tracking-widest mb-2">Sohour</div>
              <div className="border border-white/25 rounded-lg px-6 py-2"
                style={{ clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)' }}>
                <span className="text-white font-bold text-2xl">{formatTime(times.fajrStr)}</span>
              </div>
            </div>

            {/* Center countdown */}
            <div className="flex-1 text-center">
              <div className="text-white/50 text-xs uppercase tracking-widest mb-2">
                {next?.name === 'Sohour' ? 'till Sohour' : 'till Iftar'} in {location}
              </div>
              <div className="text-yellow-300 font-mono font-bold text-4xl tracking-wider">{countdown}</div>
            </div>

            {/* Iftar */}
            <div className="flex-shrink-0 text-center">
              <div className="text-white/60 text-xs uppercase tracking-widest mb-2">Iftar</div>
              <div className="border border-white/25 rounded-lg px-6 py-2"
                style={{ clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)' }}>
                <span className="text-white font-bold text-2xl">{formatTime(times.maghribStr)}</span>
              </div>
            </div>

            {/* Right decoration */}
            <div className="flex-shrink-0">
              <span className="text-4xl">🏮</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
