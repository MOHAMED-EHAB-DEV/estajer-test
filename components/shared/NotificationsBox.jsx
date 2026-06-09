import notificationType, { noNotifications } from "../ui/svgs/NotificationsSvg";
import MarkAll from "../dashboard/MarkAll";
import EmptyPlaceholder from "@/components/shared/EmptyPlaceholder";

export default function NotificationsBox({
  notifications = [],
  placeholder,
  lang,
  t,
}) {
  return (
    <div className="xl:col-span-1 col-span-2 bg-white md:p-6 p-3 rounded-lg md:min-h-[470px] min-h-[150px]">
      <div className="flex justify-between items-center mb-3 pt-1 md:pb-6 pb-2 border-b border-gray-200">
        <div className="font-IBMPlex font-semibold md:text-lg text-sm">{t("title")}</div>
        {notifications.length > 0 && <MarkAll text={t("markAllAsRead")} />}
      </div>
      <div>
        {placeholder ? (
          <div className="flex flex-col gap-2">
            <div className="h-16 rounded-md animate-pulse bg-gray-200" />
            <div className="h-16 rounded-md animate-pulse bg-gray-200" />
            <div className="h-16 rounded-md animate-pulse bg-gray-200" />
            <div className="h-16 rounded-md animate-pulse bg-gray-200" />
          </div>
        ) : notifications?.length > 0 ? (
          notifications?.map(({ _id, title, type, createdAt, seen }) => (
            <div
              className={`flex gap-4  border-e-2 border-b py-2 ${
                !seen ? "border-e-primary" : "opacity-75"
              }`}
              key={_id}
            >
              <div className="shrink-0">{notificationType[type]({ className: "md:w-10 md:h-10 w-8 h-8" })}</div>
              <div className="max-w-[calc(100%-45px)] md:max-w-[calc(100%-60px)]">
                <div
                  className={`font-IBMPlex md:text-base text-xs line-clamp-1 mb-0.5 ${
                    !seen ? "font-semibold" : ""
                  }`}
                >
                  {title}
                </div>
                <div className="font-IBMPlex md:text-[0.9rem] text-[0.7rem] text-[#5B5656]">
                  {new Date(createdAt).toLocaleDateString("ar", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}
                  {" | "}
                  {new Date(createdAt).toLocaleTimeString(lang, {
                    minute: "2-digit",
                    hour: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyPlaceholder
            Icon={noNotifications}
            title={t("noNotifications")}
            description={t("noNotificationsDescription")}
          />
        )}
      </div>
    </div>
  );
}
