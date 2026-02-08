import Link from 'next/link';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Browse Listings', href: '/search' },
  { name: 'Post Ad', href: '/post' },
  { name: 'My Dashboard', href: '/dashboard' },
];

const categories = [
  { name: 'Furniture', href: '/search?category=Furniture' },
  { name: 'Electronics', href: '/search?category=Electronics' },
  { name: 'Clothing', href: '/search?category=Clothing' },
  { name: 'Books', href: '/search?category=Books' },
];

const moreCategories = [
  { name: 'Kitchen', href: '/search?category=Kitchen' },
  { name: 'Sports', href: '/search?category=Sports' },
  { name: 'Toys', href: '/search?category=Toys' },
  { name: 'Other', href: '/search?category=Other' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-semibold text-white">MySouqify</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Egypt's trusted marketplace for buying and selling used items.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2.5">
              {categories.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">More Categories</h3>
            <ul className="space-y-2.5">
              {moreCategories.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
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
        <div className="container-app py-4">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} MySouqify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
