import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';

export default function TermsPage() {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';

  return (
    <Layout>
      <Head>
        <title>Terms of Service - MySouqify</title>
        <meta name="description" content="MySouqify Terms of Service - Rules and guidelines for using our marketplace." />
        <link rel="canonical" href="https://mysouqify.com/terms" />
      </Head>

      <div className="container-app py-10 lg:py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isAr ? 'شروط الخدمة' : 'Terms of Service'}
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          {isAr ? 'آخر تحديث: مارس ٢٠٢٦' : 'Last updated: March 2026'}
        </p>

        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
          {isAr ? (
            <>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">١. قبول الشروط</h2>
                <p>باستخدامك لـ MySouqify فأنت توافق على هذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام المنصة.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٢. استخدام المنصة</h2>
                <p>MySouqify منصة للبيع والشراء بين الأفراد. نحن لسنا طرفاً في أي صفقة بين المستخدمين. المسؤولية الكاملة عن الصفقات تقع على المستخدمين أنفسهم.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٣. الخدمة المجانية والغرض</h2>
                <p>MySouqify منصة مجانية تماماً تم إنشاؤها لخدمة المجتمع ومساعدة الناس على شراء وبيع السلع بسهولة.</p>
                <p>لا نتقاضى أي رسوم أو عمولات أو نشارك في أي معاملات مالية بين المستخدمين.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٤. المحتوى المحظور</h2>
                <p>يُحظر نشر: الأسلحة، المخدرات، المنتجات المقلدة، المحتوى الإباحي، أو أي شيء غير قانوني بموجب القانون المصري. قد يؤدي الانتهاك إلى تعليق الحساب أو حذفه فوراً.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٥. التحقق من الهوية</h2>
                <p>قد نطلب التحقق من الهوية لضمان سلامة المجتمع. يتم استخدام بيانات التحقق فقط لهذا الغرض ويتم التعامل معها بحرص.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٦. إخلاء المسؤولية</h2>
                <p>MySouqify غير مسؤولة عن جودة المنتج أو التسليم أو دقة المعلومات المقدمة من المستخدمين. يُنصح المستخدمون بشدة بالتحقق من العناصر والبائعين قبل إتمام أي معاملة.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">٧. التعديلات</h2>
                <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار المنصة.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">1. Acceptance of Terms</h2>
                <p>By using MySouqify, you agree to these terms. If you disagree, please do not use the platform.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">2. Platform Use</h2>
                <p>MySouqify is a peer-to-peer marketplace. We are not a party to any transaction between users. Full responsibility for transactions rests with the users themselves.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">3. Free Service & Purpose</h2>
                <p>MySouqify is a completely free platform created to serve the community and help people buy and sell items easily.</p>
                <p>We do not charge any fees, commissions, or participate in any financial transactions between users.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">4. Prohibited Content</h2>
                <p>It is prohibited to list: weapons, drugs, counterfeit products, adult content, or anything illegal under Egyptian law. Violations may result in immediate account suspension or deletion.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">5. Identity Verification</h2>
                <p>We may require identity verification to ensure community safety. Verification data is used solely for this purpose and handled with care.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">6. Disclaimer</h2>
                <p>MySouqify is not responsible for product quality, delivery, or accuracy of user-submitted information. Users are strongly advised to verify items and sellers before completing any transaction.</p>
              </section>
              <section>
                <h2 className="text-lg font-bold text-gray-800 mb-2">7. Modifications</h2>
                <p>We reserve the right to modify these terms at any time. Users will be notified of any significant changes via email or platform notification.</p>
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
