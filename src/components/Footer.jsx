import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export default function Footer() {
  const { t } = useTranslation('common');

  const quickLinks = [
    { name: t('footer.home'), href: '/' },
    { name: t('footer.browse_listings'), href: '/search' },
    { name: t('footer.post_ad'), href: '/post' },
    { name: t('footer.my_dashboard'), href: '/dashboard' },
    { name: t('footer.safety_tips'), href: '/safety' },
  ];

  const categories = [
    { name: t('footer.cat_furniture'), href: '/search?category=Furniture' },
    { name: t('footer.cat_electronics'), href: '/search?category=Electronics' },
    { name: t('footer.cat_fashion'), href: '/search?category=Fashion+%26+Beauty' },
    { name: t('footer.cat_books'), href: '/search?category=Books' },
  ];

  const moreCategories = [
    { name: t('footer.cat_kitchen'), href: '/search?category=Kitchen' },
    { name: t('footer.cat_mobiles'), href: '/search?category=Mobile+%26+Tablets' },
    { name: t('footer.cat_other'), href: '/search?category=Other' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <img src="/logo.jpeg" alt="MySouqify" className="h-12 w-auto object-contain bg-white rounded-lg px-2 py-1" />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quick_links')}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-2.5">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.more_categories')}</h3>
            <ul className="space-y-2.5">
              {moreCategories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-app py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MySouqify. {t('footer.all_rights')}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              {t('footer.privacy_policy')}
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              {t('footer.terms')}
            </Link>
            <span className="text-gray-700">·</span>
            <Link href="/safety" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              {t('footer.safety')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
