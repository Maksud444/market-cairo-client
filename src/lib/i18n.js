import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config';

export const getI18nProps = async (locale, namespaces = ['common']) => {
  return await serverSideTranslations(locale, namespaces, nextI18NextConfig);
};
