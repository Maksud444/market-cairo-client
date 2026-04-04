import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(props) {
  const locale = props.__NEXT_DATA__?.locale || 'en';
  const isAr = locale === 'ar';

  return (
    <Html lang={isAr ? 'ar' : 'en'} dir={isAr ? 'rtl' : 'ltr'}>
      <Head>
        {/* Google Tag Manager */}
        <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KBP4TB5S');` }} />
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
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KBP4TB5S" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>
        <Main />
        <NextScript />
        {/* Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1613619233248325');fbq('track','PageView');`,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1613619233248325&ev=PageView&noscript=1"
          />
        </noscript>
      </body>
    </Html>
  );
}
