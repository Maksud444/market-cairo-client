import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import BackToTop from './BackToTop';
import { useAuthStore } from '../lib/store';

export default function Layout({ children, hideFooter = false, hideBottomNav = false }) {
  const user = useAuthStore((s) => s.user);
  const showBanner = user && user.verification?.status !== 'approved';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Spacer for fixed desktop header — taller when verification banner is visible */}
      <div className={`hidden lg:block ${showBanner ? 'h-[204px]' : 'h-[162px]'}`} aria-hidden="true" />

      <main className="flex-1">
        {children}
      </main>

      {!hideFooter && <Footer />}
      <BackToTop />
      {!hideBottomNav && (
        <>
          <div className="h-16 md:hidden" aria-hidden="true" />
          <BottomNav />
        </>
      )}
    </div>
  );
}
