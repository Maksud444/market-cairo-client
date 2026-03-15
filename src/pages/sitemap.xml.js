const SITE_URL = 'https://mysouqify.com';

const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/search', priority: '0.9', changefreq: 'hourly' },
  { url: '/safety', priority: '0.6', changefreq: 'monthly' },
  { url: '/privacy', priority: '0.4', changefreq: 'monthly' },
  { url: '/terms', priority: '0.4', changefreq: 'monthly' },
];

function generateSitemap(listings) {
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = staticRoutes
    .map(
      ({ url, priority, changefreq }) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('');

  const listingUrls = listings
    .map(
      (listing) => `
  <url>
    <loc>${SITE_URL}/listing/${listing._id}</loc>
    <lastmod>${new Date(listing.updatedAt || listing.createdAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${listingUrls}
</urlset>`;
}

function Sitemap() {
  return null;
}

export async function getServerSideProps({ res }) {
  let listings = [];

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_URL}/listings?limit=500&status=active`);
    const data = await response.json();
    if (data.success && Array.isArray(data.listings)) {
      listings = data.listings;
    }
  } catch {
    // Sitemap still works without listings
  }

  const sitemap = generateSitemap(listings);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default Sitemap;
