import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props) {
  const locale = props.__NEXT_DATA__?.locale || 'en';
  const isAr = locale === 'ar';

  return (
    <Html lang={isAr ? 'ar' : 'en'} dir={isAr ? 'rtl' : 'ltr'}>
      <Head>
        {/* Hreflang alternates */}
        <link rel="alternate" hrefLang="en" href="https://mysouqify.com" />
        <link rel="alternate" hrefLang="ar-EG" href="https://mysouqify.com/ar" />
        <link rel="alternate" hrefLang="x-default" href="https://mysouqify.com" />

        {/* Canonical base */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />

        {/* Theme color */}
        <meta name="theme-color" content="#2563eb" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
