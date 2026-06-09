import dynamic from "next/dynamic";
import { useEffect, useState, Suspense } from "react";
import { Chat } from "../ui/svgs/icons/ChatSvg";
import { X } from "../ui/svgs/icons/XSvg";;
import { useUser } from "@/context/UserContext";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";
import { useTranslations } from "@/hooks/useTranslations";

const MainChatBox = dynamic(() => import("./MainChatBox"), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-0 right-0 w-80 h-96 bg-white shadow-lg animate-pulse" />
  ),
});

export default function AiChat({ translate, lang }) {
  const t = useTranslations(translate);
  const { user, loading, visitorId } = useUser();

  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [visitorName, setVisitorName] = useState();
  const { isOpen, onOpen, onOpenChange } = useDrawerWithHistory();

  const handleDismissBubble = () => {
    localStorage.setItem("bubbleDismissedTimestamp", new Date().getTime());
    setIsBubbleVisible(false);
  };

  useEffect(() => {
    const name =
      typeof window !== "undefined" ? localStorage.getItem("visitorName") : "";
    if (user?.fullName) return setVisitorName(user?.fullName);

    if (name && !user?.fullName) setVisitorName(name);
  }, [user]);

  useEffect(() => {
    const dismissedTimestamp = localStorage.getItem("bubbleDismissedTimestamp");
    if (dismissedTimestamp) {
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (new Date().getTime() - dismissedTimestamp < twentyFourHours) {
        setIsBubbleVisible(false);
      } else {
        setIsBubbleVisible(true);
        setTimeout(() => {
          setIsBubbleVisible(false);
          localStorage.setItem(
            "bubbleDismissedTimestamp",
            new Date().getTime(),
          );
        }, 4000);
      }
    } else {
      setIsBubbleVisible(true);
      setTimeout(() => {
        setIsBubbleVisible(false);
        localStorage.setItem("bubbleDismissedTimestamp", new Date().getTime());
      }, 4000);
    }
  }, []);
  return (
    <>
      {/* Chat Icon Button */}
      <button
        aria-label={isOpen ? "Close chat" : "Open chat"}
        onClick={() =>
          !loading &&
          (visitorId || user?._id) &&
          (isOpen ? onOpenChange(false) : onOpen())
        }
        className="fixed md:bottom-6 bottom-24 right-6 w-14 h-14 bg-primary hover:bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50"
      >
        {isOpen ? (
          <X className="w-5 h-5" strokeWidth="3" />
        ) : (
          <Chat fill="#fff" className="text-white w-6" />
        )}
      </button>
      {!isOpen && isBubbleVisible && (
        <div className="fixed md:bottom-24 bottom-40 right-8 bg-white rounded-lg shadow-lg ps-4 pe-5 py-3 z-50 animate-fade-in-from-bottom">
          <div className="relative">
            <p className="text-gray-800 text-sm font-medium whitespace-nowrap">
              {t("chat.welcomeText")}
            </p>
            <button
              onClick={handleDismissBubble}
              className="absolute -top-6 -end-7 shadow w-6 h-6 rounded-full flex items-center justify-center  text-gray-500 bg-white hover:bg-gray-100"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3" strokeWidth="2" />
            </button>
            {/* Speech bubble arrow */}
            <div className="absolute -bottom-5 start-0 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
          </div>
        </div>
      )}
      {/* Chat Window */}
      <Suspense fallback={null}>
        {isOpen && (visitorId || user?._id) && !loading && (
          <MainChatBox
            lang={lang}
            otherUserData={{
              fullName: "Estajer Assistant",
              avatar:
                "https://res.cloudinary.com/dhfzkadm2/image/upload/v1763326241/abc0121a-15f7-40ba-adf3-07b2e2eba8d1_ev61fp.webp",
              isOnline: true,
            }}
            otherUserId={"6919234274becda8616fa81b"}
            currentUserId={user?._id || visitorId}
            userFullName={visitorName || ""}
            onClose={() => onOpenChange(false)}
            userAvatar={user?.avatar || ""}
            small={true}
            translate={translate}
            aiAssistant={true}
            visitorName={visitorName}
            setVisitorName={setVisitorName}
          />
        )}
      </Suspense>
    </>
  );
}
