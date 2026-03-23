import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';

export default function Layout({ children, hideFooter = false, hideBottomNav = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      {!hideFooter && <Footer />}
      {!hideBottomNav && (
        <>
          <div className="h-16 md:hidden" aria-hidden="true" />
          <BottomNav />
        </>
      )}
    </div>
  );
}
