import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  if (!visible) return null;

  return (
    <button
      onClick={scrollTop}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 z-50 flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
    >
      {/* Desktop: text + icon pill */}
      <span className="hidden md:flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full">
        <FiArrowUp size={15} />
        Back to top
      </span>

      {/* Mobile: icon only */}
      <span className="flex md:hidden items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-full">
        <FiArrowUp size={18} />
      </span>
    </button>
  );
}
