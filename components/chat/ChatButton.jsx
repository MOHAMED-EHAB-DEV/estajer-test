"use client";
import Button from "../ui/Button";
import { Chat } from "../ui/svgs/icons/ChatSvg";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { useRouter } from "next/navigation";
import { useDrawerWithHistory } from "@/hooks/useDrawerWithHistory";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

const MainChatBox = dynamic(() => import("./MainChatBox"), { ssr: false });

export default function ChatButton({
  product,
  translate,
  home,
  langPrefix,
  initialProduct,
  profile,
}) {
  const trans = useTranslations(translate);
  const t = (text) => trans(`chat.${text}`);
  const router = useRouter();

  const { user } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDrawerWithHistory();

  const handelOpenChat = () => {
    if (!user) {
      return router.push(
        `/${langPrefix}login?page=${window.location.pathname}&message=unauthorized`,
      );
    }
    onOpen();
  };
  return (
    <div id="chat-button" className={home ? "mx-auto md:mx-0" : "md:ms-auto"}>
      <Button
        className={`${
          profile
            ? "bg-[#f28e2b] hover:bg-[#e07d24] px-6 py-2.5 h-auto text-[0.85rem]"
            : home
            ? "bg-darkNavy md:py-4 py-3 h-auto md:ps-10 ps-5 pe-6 md:pe-12 text-[0.75rem] md:text-[1.1rem]"
            : "bg-darkNavy md:ps-16 md:pe-20 ps-6 pe-8 md:py-4 py-3 h-auto text-[0.75rem] md:text-[1.1rem]"
        } gap-2`}
        onPress={handelOpenChat}
      >
        <Chat className={`${profile ? "w-4 h-4" : "md:w-7 md:h-5 w-4 h-4"} `} fill="#fff" />
        {t("chatButton")}
      </Button>
      {isOpen &&
        user &&
        user?._id !== product.owner._id &&
        typeof document !== "undefined" &&
        createPortal(
          <MainChatBox
            otherUserData={product.owner}
            otherUserId={product.owner._id}
            currentUserId={user._id}
            userFullName={user.fullName}
            onClose={() => onOpenChange(false)}
            userAvatar={user.avatar}
            small={true}
            translate={translate}
            initialProduct={initialProduct}
          />,
          document.body,
        )}
    </div>
  );
}