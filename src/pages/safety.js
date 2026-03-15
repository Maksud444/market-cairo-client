import Head from 'next/head';
import { FiShield, FiMapPin, FiEye, FiCreditCard, FiAlertTriangle, FiPhone, FiUserCheck, FiPackage } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';

const tips = [
  {
    icon: FiMapPin,
    color: 'bg-blue-50 text-blue-600',
    titleKey: 'Meet in a public place',
    titleAr: 'قابل في مكان عام',
    descKey: 'Always meet in a busy, well-lit public location like a mall, café, or police station parking lot. Never invite strangers to your home or go alone to theirs.',
    descAr: 'دايماً قابل في مكان عام مزدحم ومضاء كويس زي مول، كافيه، أو موقف مركز الشرطة. متدعيش غرباء لبيتك ومتروحش لوحدك.',
  },
  {
    icon: FiEye,
    color: 'bg-green-50 text-green-600',
    titleKey: 'Inspect before you buy',
    titleAr: 'افحص قبل ما تشتري',
    descKey: 'Always inspect the item in person before completing any payment. Test electronics, check for defects, and verify the item matches the listing description.',
    descAr: 'دايماً افحص الغرض شخصياً قبل أي دفع. جرب الإلكترونيات، دور على العيوب، وتأكد إن الغرض بيطابق وصف الإعلان.',
  },
  {
    icon: FiCreditCard,
    color: 'bg-red-50 text-red-600',
    titleKey: 'Never pay in advance',
    titleAr: 'متدفعش مقدماً أبداً',
    descKey: 'Do not send money before seeing the item. Be extremely cautious of sellers who ask for a deposit, bank transfer, or gift cards before meeting.',
    descAr: 'ماترسلش فلوس قبل ما تشوف الغرض. كن حذر جداً من البائعين اللي بيطلبوا عربون أو تحويل بنكي أو كروت هدايا قبل اللقاء.',
  },
  {
    icon: FiUserCheck,
    color: 'bg-purple-50 text-purple-600',
    titleKey: 'Verify the seller',
    titleAr: 'تحقق من البائع',
    descKey: 'Check the seller\'s profile, rating, and reviews. Verified sellers have a blue checkmark. Avoid accounts created very recently with no history.',
    descAr: 'اتحقق من بروفايل البائع والتقييم والمراجعات. البائعين الموثقين عندهم علامة صح زرقاء. تجنب الحسابات الجديدة اللي معهاش تاريخ.',
  },
  {
    icon: FiPhone,
    color: 'bg-yellow-50 text-yellow-600',
    titleKey: 'Keep communication on-platform',
    titleAr: 'خلي التواصل على المنصة',
    descKey: 'Use MySouqify\'s built-in messaging system. Avoid sharing personal phone numbers until you\'re confident about the transaction. This protects your privacy.',
    descAr: 'استخدم نظام المراسلة الداخلي في MySouqify. تجنب مشاركة رقم تليفونك الشخصي لحد ما تتأكد من الصفقة. ده بيحمي خصوصيتك.',
  },
  {
    icon: FiAlertTriangle,
    color: 'bg-orange-50 text-orange-600',
    titleKey: 'Recognize red flags',
    titleAr: 'اعرف علامات التحذير',
    descKey: 'Be cautious if: price is too good to be true, seller is in a rush, item photos look stock/stolen, or seller won\'t meet in person. Trust your instincts.',
    descAr: 'كن حذر لو: السعر رخيص جداً مقارنة بالسوق، البائع مستعجل، صور الغرض تبدو من الإنترنت، أو البائع رافض يلتقي شخصياً. ثق في حدسك.',
  },
  {
    icon: FiPackage,
    color: 'bg-teal-50 text-teal-600',
    titleKey: 'Check item carefully',
    titleAr: 'افحص الغرض كويس',
    descKey: 'For high-value items like electronics, bring someone who knows about the product. Check serial numbers, test all functions, and bring a receipt or warranty if applicable.',
    descAr: 'للأغراض الغالية زي الإلكترونيات، جيب معاك حد فاهم في المنتج. تحقق من الأرقام التسلسلية، جرب كل الوظائف، وجيب الفاتورة أو الضمان لو موجود.',
  },
  {
    icon: FiShield,
    color: 'bg-indigo-50 text-indigo-600',
    titleKey: 'Report suspicious activity',
    titleAr: 'بلّغ عن أي نشاط مشبوه',
    descKey: 'If you encounter fraud, scams, or suspicious listings, report them immediately using the "Report" button on the listing. Our team reviews all reports within 24 hours.',
    descAr: 'لو صادفت احتيال أو إعلانات مشبوهة، بلّغ عنها فوراً باستخدام زرار "تبليغ" على الإعلان. فريقنا بيراجع كل البلاغات في خلال ٢٤ ساعة.',
  },
];

export default function SafetyPage() {
  const { i18n } = useTranslation('common');
  const isAr = i18n.language === 'ar';

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tips.map((tip) => ({
      '@type': 'Question',
      name: tip.titleKey,
      acceptedAnswer: {
        '@type': 'Answer',
        text: tip.descKey,
      },
    })),
  };

  return (
    <Layout>
      <Head>
        <title>Safety Tips - MySouqify</title>
        <meta name="description" content="Stay safe when buying and selling on MySouqify. Essential safety tips for secure transactions in Cairo." />
        <link rel="canonical" href="https://mysouqify.com/safety" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-14 lg:py-20">
        <div className="container-app text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FiShield size={32} />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            {isAr ? 'نصائح الأمان' : 'Safety Tips'}
          </h1>
          <p className="text-primary-100 text-lg max-w-xl mx-auto">
            {isAr
              ? 'احنا عايزينك تبيع وتشتري بأمان. اقرأ النصائح دي قبل أي صفقة.'
              : 'We want you to buy and sell safely. Read these tips before every transaction.'}
          </p>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="container-app py-12 lg:py-16">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${tip.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">
                  {isAr ? tip.titleAr : tip.titleKey}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {isAr ? tip.descAr : tip.descKey}
                </p>
              </div>
            );
          })}
        </div>

        {/* Emergency Box */}
        <div className="mt-12 max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 lg:p-8 text-center">
          <FiAlertTriangle className="mx-auto mb-3 text-red-500" size={28} />
          <h3 className="font-bold text-red-800 text-xl mb-2">
            {isAr ? 'حدث شيء مشبوه؟' : 'Something suspicious happened?'}
          </h3>
          <p className="text-red-600 text-sm mb-4">
            {isAr
              ? 'لو حصل لك أي احتيال أو شعرت بخطر، بلّغ الشرطة فوراً واتصل بنا.'
              : 'If you experienced fraud or felt unsafe, report to the police immediately and contact us.'}
          </p>
          <a href="mailto:support@mysouqify.com"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors">
            {isAr ? 'تواصل مع الدعم' : 'Contact Support'}
          </a>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}
