import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import BackToTop from './BackToTop';

export default function Layout({ children, hideFooter = false, hideBottomNav = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Spacer for fixed desktop header only */}
      <div className="hidden lg:block h-[145px]" aria-hidden="true" />

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
