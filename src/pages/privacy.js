import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';

export default function PrivacyPage() {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';

  return (
    <Layout>
      <Head>
        <title>Privacy Policy - MySouqify</title>
        <meta name="description" content="MySouqify Privacy Policy - How we collect, use and protect your data." />
        <link rel="canonical" href="https://mysouqify.com/privacy" />
      </Head>

      <div className="container-app py-10 lg:py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          {isAr ? 'آخر تحديث: مارس ٢٠٢٦' : 'Last updated: March 2026'}
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 text-sm leading-relaxed">
          {isAr ? (
            <>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">١. المعلومات التي نجمعها</h2>
                <p>نجمع المعلومات التي تقدمها عند التسجيل (الاسم، البريد الإلكتروني، رقم الهاتف)، وبيانات الإعلانات التي تنشرها، وسجلات النشاط على المنصة.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٢. كيف نستخدم معلوماتك</h2>
                <p>نستخدم معلوماتك لتشغيل المنصة، التحقق من هويتك، إرسال الإشعارات المتعلقة بإعلاناتك وصفقاتك، وتحسين تجربة الاستخدام.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٣. مشاركة البيانات</h2>
                <p>لا نبيع بياناتك لأطراف ثالثة. نشارك المعلومات الضرورية فقط مع مقدمي الخدمات (مثل معالجة الدفع) أو عند الطلب القانوني.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٤. الأمان</h2>
                <p>نستخدم التشفير وأفضل الممارسات الأمنية لحماية بياناتك. ومع ذلك، لا يمكن ضمان أمان مطلق على الإنترنت.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٥. حقوقك</h2>
                <p>يحق لك طلب عرض بياناتك أو تصحيحها أو حذفها. تواصل معنا على support@mysouqify.com.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">1. Information We Collect</h2>
                <p>We collect information you provide when registering (name, email, phone number), listing data you post, and activity logs on the platform.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">2. How We Use Your Information</h2>
                <p>We use your information to operate the platform, verify your identity, send notifications about your listings and transactions, and improve the user experience.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">3. Data Sharing</h2>
                <p>We do not sell your data to third parties. We only share necessary information with service providers (e.g., payment processing) or when legally required.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">4. Security</h2>
                <p>We use encryption and security best practices to protect your data. However, no absolute security can be guaranteed on the internet.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">5. Your Rights</h2>
                <p>You have the right to request access, correction, or deletion of your data. Contact us at support@mysouqify.com.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return { props: { ...(await getI18nProps(locale)) } };
}
