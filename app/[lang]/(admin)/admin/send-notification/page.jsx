"use client";
import { useState, useEffect, useMemo } from "react";
import { Input, Textarea, Button, Checkbox, ScrollShadow } from "@heroui/react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function page() {
  const [loading, setLoading] = useState(false);
  const [fetchingSubs, setFetchingSubs] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "",
    image: "",
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setFetchingSubs(true);
    try {
      const res = await fetch("/api/admin/notifications/send");
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscriptions);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setFetchingSubs(false);
    }
  };

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(
      (sub) =>
        sub.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.details &&
          sub.details.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  }, [subscribers, searchQuery]);

  const toggleAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map((s) => s.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subscriptionIds:
            selectedIds.length > 0 && selectedIds.length < subscribers.length
              ? selectedIds
              : [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(ToastMessage("تم إرسال الإشعار بنجاح!"));
      } else {
        toast.error(ToastMessage(data.error || "فشل في إرسال الإشعار"));
      }
    } catch (error) {
      toast.error(ToastMessage("حدث خطأ غير متوقع"));
    } finally {
      setLoading(false);
    }
  };

  const userCount = subscribers.filter((s) => s.type === "user").length;
  const visitorCount = subscribers.filter((s) => s.type !== "user").length;

  return (
    <div className="w-full min-h-[92vh] flex flex-col items-center justify-start py-4 px-4">
      {/* Page Header */}
      <div className="w-full mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-white border border-gray-100">
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              إرسال الإشعارات
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              أرسل إشعارات فورية للمشتركين والزوار
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "إجمالي المشتركين",
            value: subscribers.length,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
            color: "#f48a42",
          },
          {
            label: "مستخدمين مسجلين",
            value: userCount,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ),
            color: "#3b82f6",
          },
          {
            label: "زوار مشتركين",
            value: visitorCount,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ),
            color: "#83a3f0",
          },
          {
            label: "المحدد للإرسال",
            value: selectedIds.length === 0 ? "الكل" : selectedIds.length,
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            ),
            color: "#10b981",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{
                  background: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {fetchingSubs ? "..." : stat.value}
            </p>
            <p className="text-gray-400 text-xs mt-0.5 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Subscribers Panel */}
        <div className="xl:col-span-4">
          <div className="rounded-3xl overflow-hidden h-[760px] flex flex-col bg-white border border-gray-100 shadow-sm">
            {/* Panel Header */}
            <div className="p-5 border-b border-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">المشتركين</h3>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  {subscribers.length}
                </span>
              </div>
              <div className="relative">
                <Input
                  placeholder="بحث عن مشترك..."
                  size="sm"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  variant="flat"
                  classNames={{
                    inputWrapper:
                      "bg-gray-50 hover:bg-gray-100 border border-transparent focus-within:border-gray-200 rounded-xl h-10 text-start",
                    input: "text-gray-700 placeholder:text-gray-400 text-sm",
                  }}
                  startContent={
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Select All */}
            <div className="px-5 py-3 flex justify-between items-center border-b border-gray-50 bg-gray-50/30">
              <button
                onClick={toggleAll}
                className="text-xs font-bold transition-colors hover:opacity-75 text-primary"
              >
                {selectedIds.length === subscribers.length
                  ? "إلغاء تحديد الكل"
                  : "تحديد الكل"}
              </button>
              <span className="text-[11px] text-gray-400 font-bold">
                محدد: {selectedIds.length}
              </span>
            </div>

            {/* Subscriber List */}
            <div className="flex-grow overflow-hidden px-3 py-2">
              <ScrollShadow className="h-full">
                {fetchingSubs ? (
                  <div className="flex flex-col gap-2 mt-2 px-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-gray-100 animate-pulse rounded-xl w-full"
                      />
                    ))}
                  </div>
                ) : filteredSubscribers.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {filteredSubscribers.map((sub) => {
                      const isSelected = selectedIds.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-transparent bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedIds(
                                selectedIds.filter((id) => id !== sub.id),
                              );
                            } else {
                              setSelectedIds([...selectedIds, sub.id]);
                            }
                          }}
                        >
                          <Checkbox
                            isSelected={isSelected}
                            onValueChange={() => {
                              if (isSelected) {
                                setSelectedIds(
                                  selectedIds.filter((id) => id !== sub.id),
                                );
                              } else {
                                setSelectedIds([...selectedIds, sub.id]);
                              }
                            }}
                            color="warning"
                            radius="full"
                            size="sm"
                            classNames={{
                              wrapper: "before:border-gray-300",
                            }}
                          />
                          {/* Avatar */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background:
                                sub.type === "user"
                                  ? "rgba(59,130,246,0.1)"
                                  : "rgba(131,163,240,0.1)",
                              color:
                                sub.type === "user" ? "#3b82f6" : "#83a3f0",
                            }}
                          >
                            {sub.label?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold text-xs truncate ${
                                isSelected ? "text-primary" : "text-gray-900"
                              }`}
                            >
                              {sub.label}
                            </p>
                          </div>
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background:
                                sub.type === "user" ? "#3b82f6" : "#83a3f0",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-300 font-bold text-sm">
                    <svg
                      className="w-10 h-10 mx-auto mb-3 opacity-20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    لا يوجد مشتركين مطابقين
                  </div>
                )}
              </ScrollShadow>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="xl:col-span-5">
          <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Form Header */}
            <div className="p-7 relative overflow-hidden bg-primary">
              {/* Decorative elements */}
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    تكوين الإشعار
                  </h2>
                  <p className="text-white/80 text-sm mt-0.5 font-medium">
                    أنشئ رسالتك وخصصها للمستلمين
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-7 space-y-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Field */}
                <div className="space-y-2">
                  <label className="text-gray-700 font-bold text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    عنوان الإشعار
                  </label>
                  <Input
                    placeholder="أكتب عنواناً جذاباً..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    required
                    variant="flat"
                    size="lg"
                    classNames={{
                      inputWrapper:
                        "bg-gray-50 hover:bg-gray-100 border border-transparent focus-within:border-primary/30 transition-all rounded-xl h-14 text-start",
                      input:
                        "text-gray-900 placeholder:text-gray-400 font-medium",
                    }}
                  />
                </div>

                {/* Body Field */}
                <div className="space-y-2">
                  <label className="text-gray-700 font-bold text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    نص الرسالة
                  </label>
                  <Textarea
                    placeholder="أكتب محتوى الإشعار هنا..."
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        body: e.target.value,
                      })
                    }
                    required
                    variant="flat"
                    size="lg"
                    minRows={4}
                    classNames={{
                      inputWrapper:
                        "bg-gray-50 hover:bg-gray-100 border border-transparent focus-within:border-primary/30 transition-all rounded-xl px-4 py-3 text-start",
                      input:
                        "text-gray-900 placeholder:text-gray-400 font-medium",
                    }}
                  />
                </div>

                {/* URL & Image Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-gray-700 font-bold text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      رابط التوجيه
                    </label>
                    <Input
                      placeholder="مثال: /offers"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          url: e.target.value,
                        })
                      }
                      variant="flat"
                      size="lg"
                      classNames={{
                        inputWrapper:
                          "bg-gray-50 hover:bg-gray-100 border border-transparent focus-within:border-primary/30 transition-all rounded-xl h-14 text-start",
                        input:
                          "text-gray-900 placeholder:text-gray-400 font-medium",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-700 font-bold text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      صورة (اختياري)
                    </label>
                    <Input
                      placeholder="https://..."
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image: e.target.value,
                        })
                      }
                      variant="flat"
                      size="lg"
                      classNames={{
                        inputWrapper:
                          "bg-gray-50 hover:bg-gray-100 border border-transparent focus-within:border-primary/30 transition-all rounded-xl h-14 text-start",
                        input:
                          "text-gray-900 placeholder:text-gray-400 font-medium",
                      }}
                    />
                  </div>
                </div>

                {/* Send Button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full font-bold text-lg h-14 text-white shadow-md hover:shadow-lg hover:scale-[1.01] transition-all rounded-2xl border-0 bg-primary"
                    isLoading={loading}
                    startContent={
                      !loading && (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )
                    }
                  >
                    {selectedIds.length > 0 &&
                    selectedIds.length < subscribers.length
                      ? `إرسال إلى ${selectedIds.length} مستلم`
                      : "إرسال للجميع الآن"}
                  </Button>
                </div>
              </form>

              {/* Info Note */}
              <div className="rounded-2xl p-5 flex items-start gap-4 text-start border bg-primary/5 border-primary/10">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-primary/10">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1 text-gray-900">
                    ملاحظة هامة
                  </h3>
                  <p className="text-gray-500 font-medium text-xs leading-relaxed">
                    سيتم إرسال الإشعار فوراً لجميع المشتركين المحددين. تأكد من
                    مراجعة المحتوى قبل الإرسال.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="xl:col-span-3 flex flex-col gap-5 xl:sticky xl:top-8">
          {/* Preview Header */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-gray-900">معاينة الإشعار</h2>
            <div className="flex gap-1.5 opacity-30">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
          </div>

          {/* iOS Preview */}
          <div className="w-full max-w-[400px] mx-auto rounded-3xl p-4 shadow-xl border border-gray-100 flex items-start gap-4 bg-white/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-50 border border-gray-100">
              <Image
                src={anyImgUrl({ src: "download_z9xvlw", size: 100 })}
                width={28}
                height={28}
                unoptimized
                className="w-7 h-7 opacity-90"
                alt="logo"
              />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900 text-sm truncate">
                  {formData.title || "عنوان الإشعار"}
                </span>
                <span className="text-[11px] text-gray-400 font-bold whitespace-nowrap mr-2">
                  الآن
                </span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 font-medium">
                {formData.body ||
                  "هذا مثال لما سيراه المستخدم عند استلام الإشعار على جهازه..."}
              </p>
            </div>
          </div>
          <p className="text-center text-gray-400 text-[10px] -mt-2.5 font-bold tracking-wide">
            iOS
          </p>

          {/* Android Preview */}
          <div className="w-full max-w-[400px] mx-auto rounded-3xl p-5 shadow-xl border border-gray-100 flex flex-col gap-3 bg-white">
            <div className="flex items-center gap-3 text-[11px] text-start w-full">
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="font-bold text-gray-400 tracking-wide">
                ESTAJER • الآن
              </span>
            </div>
            <div className="flex justify-between items-start gap-4 text-start">
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-gray-900 text-[15px] truncate">
                  {formData.title || "سيصلك أفضل العروض هنا"}
                </h4>
                <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 font-medium">
                  {formData.body ||
                    "يمكنك إضافة روابط وجهات وصور لجعل الإشعار أكثر جذباً."}
                </p>
              </div>
              {formData.image ? (
                <div
                  className="w-14 h-14 rounded-xl bg-center bg-cover border border-gray-100 shadow-sm shrink-0"
                  style={{
                    backgroundImage: `url(${formData.image})`,
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                  <svg
                    className="w-6 h-6 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <p className="text-center text-gray-400 text-[10px] -mt-2.5 font-bold tracking-wide">
            ANDROID
          </p>

          {/* Quick Tips */}
          <div className="rounded-2xl p-6 border border-gray-100 bg-white shadow-sm">
            <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              تعليمات سريعة
            </h4>
            <ul className="text-xs text-gray-500 space-y-3">
              {[
                "العنوان يجب أن يكون قصيراً ومباشراً.",
                "استخدم الروابط لتوجيه المستخدمين لصفحة معينة.",
                "يمكنك اختيار مستلمين محددين من القائمة الجانبية.",
                "في حال عدم اختيار أي شخص، سيتم الإرسال للجميع.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
