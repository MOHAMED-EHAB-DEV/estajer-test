import Link from "next/link";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TaxInvoiceGuidePage({ params }) {
  const { lang } = await params;
  const isAr = lang === "ar";

  return (
    <div className="max-w-screen-2xl mx-auto py-6 px-4 md:px-6 font-IBMPlex" dir={isAr ? "rtl" : "ltr"}>
      {/* Header section */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-darkNavy mb-2">
          {isAr ? "دليل إرشادي: كيف تصدر فاتورتك الضريبية للمستأجر؟" : "Guideline: How to issue your tax invoice to the renter?"}
        </h1>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mt-4 bg-blue-50 p-4 rounded-xl border-s-4 border-primary">
          {isAr ? (
            <>
              أهلاً بك شريكنا العزيز،<br />
              بناءً على الأنظمة واللوائح الخاصة بهيئة الزكاة والضريبة والجمارك، وبما أنك أنت <strong>المنفّذ والمسؤول الأساسي عن تقديم الخدمة/العقار</strong>، فإن الفاتورة الضريبية الكاملة للمستأجر يجب أن تصدر <strong>من طرفكم مباشرة باسم شركتكم</strong>، حيث يقتصر دور المنصة على التسويق والوساطة الرقمية.
            </>
          ) : (
            <>
              Hello dear partner,<br />
              Based on the rules and regulations of the Zakat, Tax and Customs Authority (ZATCA), and since you are the <strong>provider and primary party responsible for delivering the service/property</strong>, the complete tax invoice for the renter must be issued <strong>directly from your side in your company's name</strong>, as the platform's role is limited to digital marketing and brokerage.
            </>
          )}
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Financial Calculation */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-darkNavy mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold">1</span>
            {isAr ? "أولاً: الحسبة المالية (مثال توضيحي بنسبة عمولة 15%)" : "First: Financial Calculation (Example based on 15% commission rate)"}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {isAr 
              ? "إذا قام المستأجر بحجز خدمة قيمتها 1150 ريال شاملة الضريبة، يتم تقسيم الحسابات كالتالي:" 
              : "If the renter books a service with a value of 1150 SAR inclusive of tax, the calculations are divided as follows:"}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase">
                  <th className="py-3 px-4 text-start font-medium">{isAr ? "البيان" : "Item"}</th>
                  <th className="py-3 px-4 text-start font-medium">{isAr ? "الحسبة والتفاصيل" : "Calculation Details"}</th>
                  <th className="py-3 px-4 text-end font-medium">{isAr ? "المبلغ بالريال" : "Amount (SAR)"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <tr>
                  <td className="py-4 px-4 font-semibold text-darkNavy">{isAr ? "قيمة الخدمة الأساسية" : "Basic Service Value"}</td>
                  <td className="py-4 px-4 text-gray-500">{isAr ? "المبلغ قبل الضريبة" : "Amount before tax"}</td>
                  <td className="py-4 px-4 text-end font-semibold text-darkNavy">{isAr ? "1000 ريال" : "1,000 SAR"}</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-darkNavy">{isAr ? "ضريبة القيمة المضافة (15%)" : "VAT (15%)"}</td>
                  <td className="py-4 px-4 text-gray-500">{isAr ? "تحسب على قيمة الخدمة الأساسية" : "Calculated on basic service value"}</td>
                  <td className="py-4 px-4 text-end font-semibold text-darkNavy">{isAr ? "150 ريال" : "150 SAR"}</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="py-4 px-4 font-bold text-primary">{isAr ? "إجمالي ما يدفعه المستأجر" : "Total Renter Pays"}</td>
                  <td className="py-4 px-4 font-semibold text-primary">{isAr ? "المبلغ الذي تصدر به فاتورة العميل" : "Amount of client invoice"}</td>
                  <td className="py-4 px-4 text-end font-bold text-primary">{isAr ? "1150 ريال" : "1,150 SAR"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Commission Calculation */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-darkNavy mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold">2</span>
            {isAr ? "ثانياً: كيف تحسب المنصة عمولتها (15%)؟" : "Second: How the platform calculates its commission (15%)?"}
          </h2>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {isAr 
              ? "تُحسب عمولة المنصة دائماً من المبلغ الأساسي (قبل الضريبة)، وتضاف عليها ضريبة القيمة المضافة الخاصة بالمنصة كالتالي:" 
              : "The platform's commission is always calculated on the basic amount (before tax), and the platform's VAT is added to it:"}
          </p>
          <ul className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <li className="flex justify-between items-center">
              <span>{isAr ? "• عمولة المنصة الأساسية (15%):" : "• Basic platform commission (15%):"}</span>
              <span className="font-semibold text-darkNavy">{isAr ? "150 ريال" : "150 SAR"}</span>
            </li>
            <li className="flex justify-between items-center">
              <span>{isAr ? "• ضريبة القيمة المضافة على العمولة (15%):" : "• VAT on commission (15%):"}</span>
              <span className="font-semibold text-darkNavy">{isAr ? "22.5 ريال" : "22.5 SAR"}</span>
            </li>
            <li className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-red-600">
              <span>{isAr ? "• إجمالي ما تخصمه المنصة (العمولة + ضريبتها):" : "• Total deducted by the platform (Commission + VAT):"}</span>
              <span>{isAr ? "172.5 ريال" : "172.5 SAR"}</span>
            </li>
          </ul>
          <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm leading-relaxed border-s-4 border-amber-500">
            <strong>{isAr ? "🧾 فاتورة العمولة: " : "🧾 Commission Invoice: "}</strong>
            {isAr 
              ? "ستجد في صفحة الطلبات فاتورة ضريبية صادرة من المنصة لشركتكم بهذا المبلغ (172.5 ريال)، ويمكن لمحاسبكم استخدامها لاسترداد ضريبة المدخلات (22.5 ريال) في الإقرار الضريبي." 
              : "You will find a tax invoice issued by the platform to your company for this amount (172.5 SAR) in the orders page, which your accountant can use to reclaim input tax (22.5 SAR) in the tax return."}
          </div>
        </section>

        {/* Section 3: Bank Transfer */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-darkNavy mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold">3</span>
            {isAr ? "ثالثاً: المبلغ المحوّل إلى حسابكم البنكي" : "Third: Amount transferred to your bank account"}
          </h2>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {isAr 
              ? "تقوم المنصة بخصم إجمالي عمولتها وتحويل المتبقي لكم مضافاً إليه كامل ضريبة المستأجر (لتسددوها أنتم لهيئة الضرائب):" 
              : "The platform deducts its total commission and transfers the remaining amount to you, including the renter's full tax (for you to pay to the tax authority):"}
          </p>
          <ul className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <li className="flex justify-between items-center">
              <span>{isAr ? "• صافي قيمة الخدمة لكم:" : "• Net service value to you:"}</span>
              <span className="font-semibold text-darkNavy">{isAr ? "820 ريال (بعد خصم عمولة المنصة 150 ريال)" : "820 SAR (after deducting commission of 150 SAR)"}</span>
            </li>
            <li className="flex justify-between items-center">
              <span>{isAr ? "• كامل ضريبة المستأجر المحصلة:" : "• Full renter tax collected:"}</span>
              <span className="font-semibold text-darkNavy">{isAr ? "150 ريال" : "150 SAR"}</span>
            </li>
            <li className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-primary">
              <span>{isAr ? "• إجمالي المبلغ المحوّل لحسابكم:" : "• Total transferred to your bank account:"}</span>
              <span>{isAr ? "970 ريال" : "970 SAR"}</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Invoicing Steps */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-darkNavy mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold">4</span>
            {isAr ? "رابعاً: خطوات إصدار الفاتورة للمستأجر" : "Fourth: Steps to issue the invoice to the renter"}
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {isAr 
              ? "لتسهيل الأمر على القسم المالي أو المحاسبي لديك، اتبع هذه الخطوات عند طلب المستأجر للفاتورة:" 
              : "To make it easier for your financial or accounting department, follow these steps when the renter requests an invoice:"}
          </p>
          <div className="space-y-4">
            {[
              {
                step: 1,
                titleAr: "الدخول للنظام المحاسبي",
                titleEn: "Log in to accounting system",
                descAr: "توجه إلى نظام الفوترة المعتمد في شركتك.",
                descEn: "Go to the invoicing system approved in your company."
              },
              {
                step: 2,
                titleAr: "إنشاء فاتورة جديدة",
                titleEn: "Create a new invoice",
                descAr: "أصدر فاتورة ضريبية باسم المستأجر (باستخدام بياناته الموضحة في الطلب).",
                descEn: "Issue a tax invoice in the name of the renter (using their details shown in the order)."
              },
              {
                step: 3,
                titleAr: "إدخال المبالغ",
                titleEn: "Enter amounts",
                descAr: "ضع قيمة الخدمة الأساسية 1000 ريال، وسيضيف النظام تلقائياً ضريبة الـ 15% (150 ريال).",
                descEn: "Put the basic service value as 1000 SAR, and the system will automatically add the 15% VAT (150 SAR)."
              },
              {
                step: 4,
                titleAr: "تطابق الإجمالي",
                titleEn: "Match the total",
                descAr: "تأكد أن إجمالي الفاتورة النهائي هو 1150 ريال (مطابق تماماً لما سدده العميل على المنصة).",
                descEn: "Make sure the final invoice total is 1150 SAR (exactly matching what the customer paid on the platform)."
              },
              {
                step: 5,
                titleAr: "تحديد طريقة الدفع",
                titleEn: "Specify payment method",
                descAr: "يفضل الإشارة في الفاتورة إلى أن الدفع تم \"إلكترونياً عبر المنصة الوسيطة\".",
                descEn: "It is preferred to state on the invoice that payment was made 'electronically via the intermediary platform'."
              },
              {
                step: 6,
                titleAr: "الإرسال",
                titleEn: "Send",
                descAr: "قم بتحميل الفاتورة بصيغة PDF وأرسلها للمستأجر.",
                descEn: "Download the invoice as a PDF and send it to the renter."
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-darkNavy text-sm md:text-base">
                    {isAr ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm mt-1 leading-relaxed">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary Alert */}
        <div className="p-5 bg-primary/10 text-primary rounded-2xl text-sm leading-relaxed border border-primary/20">
          <div className="flex gap-2">
            <span className="text-lg">💡</span>
            <div>
              <strong>{isAr ? "خلاصة تهمّ محاسبك: " : "Summary for your accountant: "}</strong>
              {isAr ? (
                "العميل دفع 1150 ريال، أنتم تصدرون له فاتورة بـ 1150 ريال وتوردون 150 ريال ضريبة للهيئة. والمنصة تحول لكم 970 ريال وتصدر لكم فاتورة مصروفات بمبلغ 172.5 ريال لتخصموا ضريبتها (22.5 ريال) من إقراركم. وبذلك تتطابق حساباتكم 100%."
              ) : (
                "The customer paid 1150 SAR, you issue them an invoice for 1150 SAR and remit 150 SAR tax to ZATCA. The platform transfers 970 SAR to you and issues you an expense invoice of 172.5 SAR to claim its tax (22.5 SAR) in your return. This matches your accounts 100%."
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <Link
            href={`/${isAr ? "" : "en/"}dashboard/my-orders`}
            className="text-primary hover:underline font-semibold text-sm flex items-center gap-1"
          >
            {isAr ? "← العودة إلى طلباتي" : "← Back to My Orders"}
          </Link>
        </div>
      </div>
    </div>
  );
}
