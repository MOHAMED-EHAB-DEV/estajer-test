"use client";

import { useState, useRef } from "react";
import { Nafath } from "@/components/ui/svgs/icons/NafathSvg";
import Button from "../ui/Button";

export default function ContractForm({
  userData,
  ownerData,
  items = [],
  order,
}) {
  const calculateDuration = (start, end) => {
    if (!start || !end) return "-";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays + 1} يوم`;
  };

  const lessorInfo = {
    name: ownerData.companyDetails.companyName || ownerData.fullName,
    id: ownerData.nationalId,
    unifiedNumber: ownerData.unifiedNumber,
    taxCode: ownerData.companyDetails.taxCode,
    address: ownerData.address,
    phone: ownerData.phone,
    email: ownerData.email,
  };

  const nafathData = userData.id?.nafathData;
  const nafathFullName =
    nafathData?.firstNameAr && nafathData?.lastNameAr
      ? `${nafathData.firstNameAr} ${nafathData.fatherNameAr} ${nafathData.grandFatherNameAr} ${nafathData.lastNameAr}`
          .replace("-", "")
          .trim()
      : userData?.companyDetails?.companyName || userData.id.fullName;

  const lesseeInfo = {
    name: nafathFullName,
    id: userData.id.nationalId,
    taxCode: userData?.companyDetails?.taxCode,
    unifiedNumber: userData?.unifiedNumber,
    address: userData?.id?.address,
    phone: userData?.id?.phone,
    email: userData?.id?.email,
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const targetRef = useRef();

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const { default: generatePDF } = await import("react-to-pdf");
      await generatePDF(targetRef, {
        filename: `${order._id}.pdf`,
        page: { format: "A4", orientation: "portrait", margin: 15 },
        canvas: { mimeType: "image/png", qualityRatio: 0.5 },
        overrides: { pdf: { compress: true }, canvas: { useCORS: true } },
        resolution: 1,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div
      className={`bg-white max-w-5xl my-10 mx-auto shadow-md rounded-lg p-2 print:shadow-none print:p-0 print:m-0 ${
        isGenerating ? "overflow-hidden" : ""
      }`}
    >
      <div className="flex justify-between items-center p-6 print:hidden">
        <h1 className="text-2xl font-bold">عقد تأجير</h1>
        <Button
          color="transparent"
          size="md"
          isLoading={isGenerating}
          onPress={handleDownloadPDF}
          className="flex items-center gap-2"
          startContent={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
          }
        >
          تحميل العقد
        </Button>
      </div>
      <div
        className={`contract-content text-right p-6 ${
          isGenerating ? "min-w-[64rem]" : ""
        }`}
        dir="rtl"
        ref={targetRef}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">عقد تأجير</h1>
          <p className="text-center">
            بحمد الله وتوفيقه، تم إبرام هذا العقد بتاريخ{" "}
            {new Date(order.startDate).toLocaleDateString("ar")} في مدينة الرياض
            من بين كلاً:
          </p>
        </div>

        <div className="mb-6">
          <p className="mb-2 leading-10">
            <span className="font-bold underline">أولاً</span>:{" "}
            <span className="font-semibold">{lessorInfo.name}</span> ،
            {lessorInfo.taxCode ? (
              <>
                {" "}
                الرقم الضريبي :{" "}
                <span className="font-semibold">{lessorInfo.taxCode}</span>
              </>
            ) : lessorInfo.unifiedNumber ? (
              <>
                {" "}
                الرقم الموحد :{" "}
                <span className="font-semibold">
                  {lessorInfo.unifiedNumber}
                </span>
              </>
            ) : lessorInfo.id ? (
              <>
                {" "}
                رقم الهوية :{" "}
                <span className="font-semibold">{lessorInfo.id}</span>
              </>
            ) : (
              ""
            )}
            ، العنوان:{" "}
            <span className="font-semibold">{lessorInfo.address}</span>
            ،<br /> رقم الهاتف:{" "}
            <span className="font-semibold">{lessorInfo.phone}</span>، البريد
            الإلكتروني:{" "}
            <span className="font-semibold">{lessorInfo.email}</span>، ويُشار
            إليه فيما بعد بـ ("
            <span className="font-bold underline">المؤجر</span>").
          </p>
          <p className="mb-4 leading-10">
            <span className="font-bold underline">ثانياً</span>:{" "}
            <span className="font-semibold">{lesseeInfo.name}،</span>
            {lesseeInfo.taxCode ? (
              <>
                {" "}
                الرقم الضريبي :{" "}
                <span className="font-semibold">{lesseeInfo.taxCode}</span>
              </>
            ) : lesseeInfo.unifiedNumber ? (
              <>
                {" "}
                الرقم الموحد :{" "}
                <span className="font-semibold">
                  {lesseeInfo.unifiedNumber}
                </span>{" "}
              </>
            ) : lesseeInfo.id ? (
              <>
                {" "}
                رقم الهوية :{" "}
                <span className="font-semibold">{lesseeInfo.id}</span>{" "}
                {nafathData?.issuePlace && (
                  <>
                    ، مكان اصدار الهوية :{" "}
                    <span className="font-semibold">
                      {nafathData.issuePlace}
                    </span>{" "}
                  </>
                )}
                {nafathData?.dateOfBirthG && (
                  <>
                    ، تاريخ الميلاد :{" "}
                    <span className="font-semibold">
                      {nafathData.dateOfBirthG}
                    </span>{" "}
                    <br />
                  </>
                )}
              </>
            ) : (
              ""
            )}
            العنوان: <span className="font-semibold">{lesseeInfo.address}</span>
            ،<br /> رقم الهاتف:{" "}
            <span className="font-semibold">{lesseeInfo.phone}</span>، البريد
            الإلكتروني:{" "}
            <span className="font-semibold">{lesseeInfo.email}</span>، ويُشار
            إليه فيما بعد بـ ("
            <span className="font-bold underline">المستأجر</span>").
          </p>
          <p>يشار إلى كل منهما مجتمعين بـ "الطرفين" أو "الطرفان"</p>
          <p className="mt-4 leading-10 font-bold">
            <span className="underline">ثالثاً</span>: تفاصيل الطلب
          </p>
          <div className="mb-4 leading-8">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">اسم المنتج</th>
                  <th className="border px-2 py-1">الكمية</th>
                  <th className="border px-2 py-1">السعر (ر.س)</th>
                  <th className="border px-2 py-1">تاريخ التأجير</th>
                  <th className="border px-2 py-1">مدة التأجير</th>
                </tr>
              </thead>
              <tbody>
                {items && items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td className="border px-2 py-1">
                        {item.product?.nameAr || "-"}
                      </td>
                      <td className="border px-2 py-1">{item.quantity}</td>
                      <td className="border px-2 py-1">{item.price}</td>
                      <td className="border px-2 py-1">
                        {new Date(order.startDate).toLocaleDateString("ar")}
                      </td>
                      <td className="border px-2 py-1">
                        {calculateDuration(order?.startDate, order?.endDate)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border px-2 py-1 text-center" colSpan={5}>
                      لا توجد منتجات مؤجرة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* --- Start: rented products details table --- */}
          {/* --- End: rented products details table --- */}
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-center underline mb-2">
            التمهيد
          </h2>
          <p className="mb-4">
            حيث أن الطرفان المبين بياناتهما أعلاه مسجلان في منصة "استأجر" التي
            تقدم خدماتها من خلال الموقع الإلكتروني{" "}
            <span className="underline">https://estajer.com</span> وهي <br />
            متخصصة في تأجير السلع بشتى أنواعها بين الأفراد والشركات، وتعمل كوسيط
            على الإنترنت بين المؤجر الذي يعرض السلع للتأجير، وبين المستأجر{" "}
            <br /> الذي يطلب استئجار السلع التي عرضها المؤجر على المنصة، وفي ضوء
            ما ذكر أعلاه، فقد اتفق الطرفان وهما بكامل أهليتهما المعتبرة شرعاً
            ونظاماً
            <br /> على التعاقد وفقاً للبنود التالية:
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الأولى/ التمهيد:
          </h2>
          <p>
            يعتبر <span className="font-bold">التمهيد</span> أعلاه وشروط وأحكام
            منصة "<span className="font-bold">استأجر</span>" جزءاً لا يتجزأ من
            هذا العقد ومكملاً ومتمماً لأحكامه.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الثانية/ التعريفات:
          </h2>
          <p className="mb-2">
            يكون للكلمات التالية المعنى الموضح بجانب كل منهما أينما وردت في
            العقد:
          </p>
          <div className="space-y-2 pr-4">
            <p>
              1. "<span className="font-bold">المنصة</span>": يقصد بها الموقع
              الإلكتروني{" "}
              <span className="text-[#002fff]">https://estajer.com</span>، والذي
              تعود ملكيته لشركة (الأعمال المتقدمة للإستثمار)، <br /> وهي شركة
              تقدم خدمات وساطة عن طريق هذه المنصة.
            </p>
            <p>
              2. "<span className="font-bold">المؤجر</span>": يقصد به كل من يقوم
              بعرض السلع في المنصة لغرض تأجيرها من خلال المنصّة، ويكون وحده
              مسؤولاً أمام المستأجر والغير <br /> عن ملكية السلعة محل التأجير
              وما قد يتداعى بسبب ادعائه ملكية السلعة تحت أي ظرف وأمام أي جهة
              خاصة أو حكومية.
            </p>
            <p>
              3. "<span className="font-bold">المستأجر</span>": يقصد به كل من
              يطلب استئجار السلع المعروضة للإيجار في المنصة عن طريق المؤجرين
              المعتمدين ويكون مسؤولاً بشكل <br /> كامل أمام المؤجر عن سلامة
              السلعة واعادتها بالطريقة المستلمة دون أي ضرر مقصود أو غير مقصود
              ويكون المستأجر مستعداً <br /> للتعويض عن الضرر فور اثباته، كما
              يكون المستأجر مسؤولاً عن عدم استخدام البضائع بطريقة تعارض أنظمة
              المملكة العربية <br /> السعودية.
            </p>
            <p>
              4. "<span className="font-bold">السلع/السلعة</span>": يقصد بها
              العين المنقولة كالملابس و/أو الأجهزة الالكترونية و/أو الأثاث و/أو
              الأواني على سبيل المثال لا الحصر <br /> التي يعرضها المؤجر للإيجار
              في المنصّة ما دامت في حدود البضائع المسموح بها في أنظمة المملكة
              العربية السعودية.
            </p>
            <p>
              5. "<span className="font-bold">مدة الإيجار</span>": يقصد بها
              الفترة الزمنية المتفق عليها ما بين المستأجر والمؤجر والتي يُمكن
              للمستأجر فيها استخدام السلعة <br /> محل التأجير بحدود المعقول
              والمشار إليها وبالسعر المتفق عليه في المنصة.
            </p>
            <p>
              6. "<span className="font-bold">الشروط والأحكام</span>": يقصد بها
              شروط وأحكام منصّة "<span className="font-bold">استأجر</span>".
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الثالثة/ موضوع العقد:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. يحكم هذا العقد العلاقة ككل ما بين المؤجر والمستأجر تحت مظلة
              المنصة من ناحية المسؤولية والسداد والمدد الزمنية والأنظمة <br />{" "}
              الحكمة على سبيل المثل لا الحصر.
            </p>
            <p>
              2. بموجب هذا العقد يوافق المؤجر على تأجير السلع التي عرضها في
              حسابه على المنصة للمستأجر المبينة تفاصيله وفقاً لشروط وأحكام{" "}
              <br /> هذا العقد، وفي المقابل يوافق المستأجر على استئجار السلع
              المحددة محل الطلب حسب المدة الزمنية المتفق عليها ما بين الطرفين{" "}
              <br /> وسداد قيمة الإيجار للمؤجر بالإضافة للتأمين على السلعة في
              حال وجوده.
            </p>
            <p>3. تحديد آلية استلام السلع وتسليمها.</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الرابعة/ مدة العقد:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. تبدأ مدة العقد من تاريخ الموافقة الالكترونية عليه من قبل
              الطرفين وللمدة الزمنية المحددة في طلب الاستئجار في المنصة <br />{" "}
              وتعتبر التقارير الالكترونية كافية في مواجهة الغير.
            </p>
            <p>
              2. تنتهي مدة الاستئجار في التاريخ المتفق عليه ما بين الطرفين
              والمبين في الطلب الالكتروني في المنصة، وبإمكان الطرفين الاتفاق{" "}
              <br /> على تمديد عقد التأجير بنفس التفاصيل لمدد مماثلة أو حسب رغبة
              الطرفين عن طريق المنصة.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الخامسة/ التزامات ومسؤوليات المؤجر:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. يلتزم المؤجر بتسليم السلعة في التاريخ والوقت المحددين في طلب
              التأجير في المنصة، وفي حال عدم الالتزام يحق للمستأجر المطالبة{" "}
              <br /> بفسخ العقد دون أي مسؤولية على المستأجر.
            </p>
            <p>
              2. يلتزم المؤجر برفع صور فعلية ووصف دقيق للمنتج للعودة إليها في
              حال وقوع ضرر أو غيره.
            </p>
            <p>
              3. يلتزم المؤجر بتسليم السلعة كما هي موصوفة في الوصف الخاص بالسلعة
              في المنصة ويضمن المؤجر بأن السلع خالية من أي عيوب، <br /> وأنها
              صالحة للاستخدام خلال مدة الايجار، ويتحمل وحده المسؤولية في حال ثبت
              غير ذلك حسب تقييم المنصة.
            </p>
            <p>
              4. يلتزم المؤجر ويقر بأنه مخول للتصرف بالسلعة وتأجيرها على الغير
              ولا يوجد على السلعة أي مطالبات أو ادعاء ملكية من أطراف ثالثة{" "}
              <br /> ويتحمل وحده المسؤولية في حال ثبت عكس ذلك.
            </p>
            <p>
              5. يلتزم المؤجر بعدم وضع أي مواد كيميائية و/أو تجسسية و/أو مضرة
              بشكل عام في السلعة.
            </p>
            <p>
              6. يلتزم المؤجر بتبليغ المنصة بشكل فوري في حال تم استلام السلعة
              على غير الحالة التي سلمها بها وتحديد نوع الضرر بشكل دقيق، <br />{" "}
              وفي حال عدم التبليغ الفوري قد لا يتم النظر في طلب التعويض حسب ما
              تراه المنصة.
            </p>
            <p>7. يلتزم المؤجر بشروط وطريقة عرض السلع في المنصة.</p>
            <p>
              8. يلتزم المؤجر بتحديد التسعيرات المناسبة له ويحق له تحديد نسبة
              خصم حسب الرغبة دون المساس بأي نسبة مالية مخصصة للمنصة.
            </p>
            <p>
              9. يقر ويلتزم المؤجر بأنه يحق للمنصة أخذ العمولة المشار إليها في
              المادة السابعة من هذا العقد من قيمة الإيجار قبل خصم أي رسوم دون{" "}
              <br /> أي أدنى اعتراض من قبل المؤجر.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة السادسة/ التزامات ومسؤوليات المستأجر:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. يلتزم المستأجر بتسلم السلعة في التاريخ والوقت المحددين في طلب
              التأجير في المنصة، وفي حال عدم الالتزام يحق للمؤجر المطالبة <br />{" "}
              بفسخ العقد دون أي أدنى مسؤولية على المؤجر.
            </p>
            <p>
              2. يلتزم المستأجر بتصوير السعلة وقت تسليمها لمقارنتها بحالة
              الاستلام وتعتبر أحد المراجع في حال وجود ضرر أو غيره.
            </p>
            <p>
              3. يلتزم المستأجر بالمحافظة على السلعة بحالتها الأصلية ويتحمل وحده
              المسؤولية في حال أضر بالسلعة بطريقة مباشرة أو غير مباشرة، <br />{" "}
              ويقيم الضرر من قبل المقيم الخاص بالمنصة ويعتبر تقريره نهائي وقابل
              للطعن مرة واحدة فقط.
            </p>
            <p>
              4. يلتزم المستأجر بإستخدام السلعة في ما صنعت لأجله فقط وفيما لا
              يخالف الأنظمة في المملكة العربية السعودية، <br /> ويتحمل وحده
              المسؤولية في حال ثبت عكس ذلك.
            </p>
            <p>
              5. يلتزم المستأجر بإعادة السلعة في الوقت والتاريخ المحددين في طلب
              التأجير في المنصة، ويتحمل ايجار نصف يوم في حال تأخر <br /> عن
              التسليم بما لا يزيد عن ساعتين من الوقت المحدد، ويوم كامل في حال
              تأخر عن التسليم بما يزيد عن ساعتين ولا يزيد عن أربع ساعات.
            </p>
            <p>
              6. يكون المستأجر مسؤولاً مسؤولية كاملة عن السلعة أمام المؤجر ويحرص
              عليها حرص الرجل الشديد في حال تم استخدامها من أطراف <br /> آخرين
              وتحت اشرافه.
            </p>
            <p>
              7. يقر المستأجر بأنه استلم السلعة سليمة من المؤجر، وأنه عاينها
              المعاينة التامة النافية للجهالة وقد قبلها بحالتها الراهنة وأقر
              بصلاحيتها للاستخدام.
            </p>
            <p>
              8. يلتزم المستأجر بتعويض المؤجر عن قيمة الضرر الذي قد يلحق بالسلعة
              تحت مسؤوليته وحسب التقرير الذي يصدره المقيم الخاص <br /> بالمنصة،
              وذلك في غضون 5 أيام عمل، وفي حال عدم الالتزام يحق للمنصة ايقاف
              حساب المستأجر في المنصة واحالة كافة الأوراق للجهة <br /> المختصة،
              ويتحمل المستأجر كافة الرسوم القانونية والقضائية.
            </p>
            <p>
              9. يلتزم المستأجر بسداد كافة الرسوم وقيمة الايجارات المبينة في
              المنصة عن طريق قنوات السداد الموجودة في المنصة.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة السابعة/ الالتزامات المالية وطريقة السداد:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. يدفع المستأجر إلى المؤجر قيمة إيجار السلعة عن طريق وسائل الدفع
              التي توفرها المنصّة.
            </p>
            <p>
              2. تحجز المنصّة قيمة الإيجار لحين انتهاء مدة الإيجار، واستلام
              المؤجر السلعة في نفس حالة الاستلام.
            </p>
            <p>
              3. تستقطع المنصّة عمولة تتراوح ما بين (5%) إلى (20%) من قيمة
              الإيجار بحسب تصنيف السلعة.
            </p>
            <p>
              4. بعد انتهاء الطلب، تقوم المنصّة بتحويل باقي المبلغ المستحق من
              قيمة الطلب على حساب المؤجر.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الثامنة/ أحكام عامة:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. يتعهد الطرفان بالالتزام بشروط وأحكام المنصّة، والقوانين السارية
              في المملكة العربية السعودية.
            </p>
            <p>
              2. يقر ويتعهد الطرفان بعدم الاتفاق على إجراء أي عمليات خارج
              المنصّة.
            </p>
            <p>
              3. لا تتحمل المنصة أي مسؤولية تحت أي ظرف في ما ينشأ من العلاقة ما
              بين المؤجر والمستأجر سواء في خلاف و/أو نصب واحتيال و/أو <br />{" "}
              تلفيات في السلعة و/أو تأخر في الاستلام والتسليم على سبيل المثال لا
              الحصر ودور المنصة هو الوساطة وادارة التأجير والسلع وغيرها <br />{" "}
              من الخدمات الالكترونية التي تقدمها.
            </p>
            <p>
              4. تشكل بنود هذا العقد الاتفاق الكامل بين الطّرفين فيما يتعلق
              بتأجير السلع عن طريق المنصّة، ولا يجوز تعديل بنود هذا العقد إلا{" "}
              <br /> بموافقة إدارة المنصة.
            </p>
            <p>
              5. يقر الطرفان بصحة البيانات المقدمة من كل منهما عند تسجيل في
              المنصة، وأي إشعارات يرغب أي من الطرفين في إرسالها إلى الآخر <br />{" "}
              يجب أن تكون من خلال المنصّة، ولا يعتد بأي رسائل أو إشعارات أخرى
              غير ما هو محدد.
            </p>
            <p>
              6. عناوين البنود هي لمجرد الاسترشاد بها ولا تشكل جزءاً من المواد
              ولا تمس مضمونها.
            </p>
            <p>
              7. لا يؤثر بطلان أي حكم أو شرط أو نص في هذا العقد على سريان باقي
              الأحكام والشروط والنصوص الواردة به.
            </p>
            <p>
              8. اتفق الطرفان على أن تخلي أو احجام أحد الطرفين، صراحةً أو ضمناً،
              في انفاذ اي حق من حقوقه بموجب هذه العقد لا يجب أن <br /> يحول قيام
              هذا الطرف بممارسة هذا الحق في المستقبل.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة التاسعة/ مبلغ التأمين:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. يوافق المستأجر على دفع مبلغ تأمين السلعة الذي يحدده المؤجر قبل
              الاستلام، ويكون هذا المبلغ لتغطية أية أضرار أو تلفيات <br /> أو
              أعطال تحدث للسلعة.
            </p>
            <p>
              2. يسترد مبلغ التأمين المدفوع من المستأجر خلال فترة أقصاها (5)
              أيام عمل من تاريخ انتهاء مدة الايجار وإعادة السلعة في حالة جيدة.
            </p>
            <p>
              3. يحق للمؤجر مصادرة مبلغ التأمين في حالة عدم إعادة السلعة تابعة
              له، ويحق للمنصة اغلاق حساب المستأجر تماماً وأي حسابات أخرى <br />{" "}
              حالاً أو مستقبلاً.
            </p>
            <p>
              4. يحق للمؤجر أن يخصم من مبلغ التأمين بقدر الضرر أو التلف الذي لحق
              بالسلعة بعد تقدير قيمة الضرر، وتكون المنصة هي المسؤولة <br /> عن
              المقاصة في كل الحالات.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة العاشرة/ القوة القاهرة:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. لا يكون أي طرف بهذا العقد مسؤولاً عن عدم الوفاء بالتزاماته
              الواردة بموجب هذا العقد إذا كان ذلك الطرف واقعاً تحت تأثير قوة
              قاهرة <br /> خارجة عن سيطرته، على أن يتم إخطار الطرف الآخر بتلك
              الظروف خلال (يوم واحد) من تاريخ وقوعها، وفي حال استمرار القوة
              القاهرة <br /> لفترة تتجاوز (5) أيام يحق للطرفين الاتفاق على فسخ
              العقد وتسوية الحقوق المتعلقة.
            </p>
            <p>
              2. تعني القوة القاهرة المذكورة في فقرة (1) من هذه المادة أعلاه على
              سبيل المثال، الظروف الطبيعية والمناخية القاسية مثل الهزات الأرضية
              و <br />
              الزلازل والسيول والبراكين العنيفة المعوقة والحرائق والجوائح
              الصحية، كما تشمل الحرب والشغب والاضطرابات والأوامر والقرارات
              والتصرفات <br /> الصادرة من أي جهة حكومية مختصة التي تمنع من
              استغلال تأجير السلعة فيما أُجرّت لأجله.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الحادية عشر/ النظام الواجب التطبيق والاختصاص القضائي:
          </h2>
          <div className="space-y-2 pr-4">
            <p>
              1. يخضع ويفسر هذا العقد وفقاً للأنظمة واللوائح المعمول بها في
              المملكة العربيّة السعودية.
            </p>
            <p>
              2. في حال الاختلاف يتم اللجوء للحل الودي خلال (20) يوماً وفي حال
              عدم الوصول إلى حل يتم التوجه للمحاكم المتخصصة <br /> في المملكة
              العربية السعودية.
            </p>
            <p>
              3. في حال ألجأ أحد الاطراف الطرف الأخر للقضاء فإن الطرف المُلزء
              يتحمل كافة أتعاب المحاماة والمقدرة بـ (5,000) خمسة آلاف ريال{" "}
              <br /> للمطالبات ما دون (50,000) خمسون ألف ريال وما نسبته (10%) من
              المطالبة في المطالبات التي تتجاوز (50,000) خمسون ألف ريال.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl underline font-bold mb-2">
            المادة الثانية عشر/ نسخ العقد:
          </h2>
          <p>
            حُرّرَ هذا العقد من نسخة إلكترونية، باللغةِ العربيّة، ويقرُ الطرفان
            بإنهما اطّلعا على بنوده اطّلاعاً نافياً للجهالة، وبأنهما ملتزمان بما
            جاء فيه <br /> بمجرد النقر على الموافقة عليه.
          </p>
        </div>

        <div className="mt-12 p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-gray-800">
              توثيق الهوية الرقمية
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              تم استخراج وتوثيق كافة بيانات المستأجر آلياً من خلال الربط المباشر
              مع منصة (نفاذ) الوطنية، لضمان صحة البيانات وموثوقية التعاقد.
            </p>
          </div>
          <div className=" rounded-xl shadow-sm flex-shrink-0">
            <Nafath className="w-32 md:w-40 h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
