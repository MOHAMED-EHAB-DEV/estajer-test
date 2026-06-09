import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

export default function WelcomeCover({ setVisitorName, translate }) {
  const t = useTranslations(translate);
  const inputRef = useRef(null);
  const [name, setName] = useState("");
  const handelSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setVisitorName(name);
      localStorage.setItem("visitorName", name);
    }
  };

  return (
    <form
      onSubmit={handelSubmit}
      className="h-full overflow-y-auto bg-gradient-to-br border-white border-1 from-white to-orange-50 flex items-center justify-center"
      onClick={() => {
        const s = window.getSelection?.();
        if ((s && s.toString().length) || s.anchorNode !== "text") return;
        inputRef.current?.focus();
      }}
    >
      <div className="max-w-xl w-full flex flex-col h-full">
        {/* Header */}
        <div className="overflow-auto px-3 py-6 flex justify-center items-center flex-col h-full">
          <div className="text-center mb-4">
            <div className="mb-2">
              <Image
                src={anyImgUrl({
                  src: "https://res.cloudinary.com/dhfzkadm2/image/upload/v1763326241/abc0121a-15f7-40ba-adf3-07b2e2eba8d1_ev61fp.webp",
                  size: 100,
                })}
                alt="Estajer Assistant"
                unoptimized
                width={35}
                height={35}
                className="rounded-full object-contain bg-white mx-auto h-14 min-w-14"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {t("chat.welcome.assistantName")}
            </h1>
            <p className="text-sm text-gray-600">
              {t("chat.welcome.greeting")}
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-4 mb-4">
            <p className="text-sm text-gray-700 leading-normal mb-3">
              {t("chat.welcome.description")}
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                <svg
                  className="w-5 h-5 text-orange-600 mx-auto mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <p className="font-medium text-gray-800">
                  {t("chat.welcome.searchProduct")}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                <svg
                  className="w-5 h-5 text-orange-600 mx-auto mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
                <p className="font-medium text-gray-800">
                  {t("chat.welcome.aboutEstajer")}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                <svg
                  className="w-5 h-5 text-orange-600 mx-auto mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
                  <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
                  <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
                </svg>
                <p className="font-medium text-gray-800">
                  {t("chat.welcome.contactSupport")}
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            {t("chat.welcome.aiPowered")}
          </p>
        </div>
        {/* Name Input */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-4">
          <p className="text-gray-700 font-semibold mb-2">
            {t("chat.welcome.askName")}
          </p>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("chat.welcome.namePlaceholder")}
              className="flex-1 min-w-0 px-3 py-2 border-2 border-gray-200 rounded-lg  focus:border-orange-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="w-auto flex-shrink-0 bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md flex items-center gap-2"
            >
              <span>{t("chat.welcome.start")}</span>
              <svg
                className="w-4 h-4 rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
      </div>
    </form>
  );
}
