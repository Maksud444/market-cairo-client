const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar'],
    localeDetection: false,
  },
  localePath: path.join(process.cwd(), 'public/locales'),
  react: {
    useSuspense: false,
  },
};
