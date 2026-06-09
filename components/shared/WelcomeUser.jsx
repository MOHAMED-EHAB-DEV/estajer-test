"use client";
import Link from "next/link";
import Button from "../ui/Button";
import { useUser } from "@/context/UserContext";
import { useTranslations } from "@/hooks/useTranslations";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { Filter } from "../ui/svgs/icons/FilterSvg";

export default function WelcomeUser({
  langPrefix,
  translate,
  isAdminPage,
  OrderCount,
  newChatsCount,
  viewsCount,
  queryParams,
  notificationsCount = 0,
}) {
  const trans = useTranslations(translate);
  const [isPending, startTransition] = useTransition();

  const t = (text) =>
    trans(`${isAdminPage ? "admin" : "dashboard"}.home.welcome.${text}`);
  const { user } = useUser();
  const userFirstName = user?.fullName.split(" ")[0] || "";
  const router = useRouter();

  // Parse date range from query params
  const getDateRangeFromParams = () => {
    const startDate = queryParams?.startDate;
    const endDate = queryParams?.endDate;

    if (startDate && endDate)
      return { from: new Date(startDate), to: new Date(endDate) };
  };

  const [selectedRange, setSelectedRange] = useState(getDateRangeFromParams());

  const handleDateRangeSelect = (range) => {
    setSelectedRange(range);
  };

  const handleApplyFilter = () => {
    startTransition(() => {
      const params = new URLSearchParams(queryParams);
      if (selectedRange?.from)
        params.set(
          "startDate",
          selectedRange.from.toLocaleDateString("en").replaceAll("/", "-"),
        );
      if (selectedRange?.to)
        params.set(
          "endDate",
          selectedRange.to.toLocaleDateString("en").replaceAll("/", "-"),
        );
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div
      className={`relative flex md:gap-6 gap-4 flex-wrap justify-between items-center ${
        isAdminPage ? "bg-white md:px-12" : "bg-[#FFECC8]"
      } md:p-8 p-3 md:rounded-3xl rounded-lg md:mb-6 mb-3`}
    >
      <div className="absolute bottom-0 end-0">
        <svg width="236" height="129" viewBox="0 0 236 129" fill="#FACA65">
          <g fill="#FACA65" opacity="0.286551">
            <path d="M204.76 103.822C170.835 108.894 185.066 92.6309 163.956 91.7088C142.569 90.7868 151.583 62.5929 113.777 78.779C91.2534 85.0043 104.124 45.1618 65.2018 56.9118C54.2431 60.22 46.3697 72.1266 33.894 75.1323C27.3996 76.697 14.1403 66.7643 10.3044 71.307C-4.66222 89.0314 1.37857 131.76 1.37857 131.76L236 131.237C236 131.237 224.856 100.826 204.76 103.822Z" />
            <path d="M111.676 132.512C81.7725 137.583 92.031 103.469 73.4226 102.547C58.7656 101.83 56.9469 82.2522 41.5447 85.3326C31.9813 87.2453 31.9813 94.2584 24.3306 85.9702C16.6799 64.9308 8.39164 75.1317 8.39164 75.1317L10.3043 133.787C10.3043 133.787 129.391 129.515 111.676 132.512Z" />
          </g>
          <g fill="#FAB833">
            <path d="M28.0122 111.155C28.0122 111.13 28.0122 111.155 28.0122 111.155C28.0375 111.105 28.0629 111.08 28.0883 111.056C29.7129 108.969 29.2052 105.914 29.0529 105.244C29.0529 105.194 29.0275 105.169 29.0275 105.12V105.095C28.9768 104.797 28.9514 104.499 28.9514 104.201C28.9514 101.543 31.1598 99.3574 33.9012 99.3574C36.6173 99.3574 38.8511 101.518 38.8511 104.201C38.8511 104.499 38.8257 104.797 38.7496 105.095V105.12C38.7496 105.169 38.7242 105.194 38.7242 105.244C38.5719 105.939 38.0896 108.994 39.6888 111.056C39.7142 111.08 39.7142 111.105 39.7396 111.13C39.7396 111.13 39.7396 111.13 39.7396 111.155C40.4757 112.248 40.9072 113.564 40.9072 114.98C40.9072 118.78 37.7596 121.859 33.8759 121.859C29.9921 121.859 26.8445 118.78 26.8445 114.98C26.8191 113.564 27.2506 112.248 28.0122 111.155Z" />
            <path d="M49.0517 102.868C49.0517 102.843 49.0517 102.868 49.0517 102.868C49.0771 102.818 49.1025 102.793 49.1279 102.768C50.7524 100.682 50.2448 97.6272 50.0925 96.9566C50.0925 96.9069 50.0671 96.8821 50.0671 96.8324V96.8076C50.0163 96.5096 49.9909 96.2115 49.9909 95.9135C49.9909 93.2559 52.1993 91.0703 54.9408 91.0703C57.6569 91.0703 59.8907 93.2311 59.8907 95.9135C59.8907 96.2115 59.8653 96.5096 59.7891 96.8076V96.8324C59.7891 96.8821 59.7638 96.9069 59.7638 96.9566C59.6115 97.652 59.1292 100.707 60.7283 102.768C60.7537 102.793 60.7537 102.818 60.7791 102.843C60.7791 102.843 60.7791 102.843 60.7791 102.868C61.5152 103.961 61.9468 105.277 61.9468 106.693C61.9468 110.493 58.7992 113.572 54.9154 113.572C51.0317 113.572 47.8841 110.493 47.8841 106.693C47.8587 105.277 48.2902 103.961 49.0517 102.868Z" />
          </g>
          <g stroke="white" strokeWidth="0.754941">
            <path d="M33.8755 105.918V130.145" />
            <path d="M37.8191 111.062L33.8812 116.688" />
            <path d="M31.0332 106.941L33.8459 110.317" />
            <path d="M54.9149 97.6309L54.9209 129.642" />
            <path d="M58.8586 102.775L54.9208 108.401" />
            <path d="M52.0727 98.6562L54.8855 102.032" />
          </g>
          <path
            className="md:block hidden"
            d="M205.791 11.8789C209.592 12.8394 212.851 10.2717 212.851 10.2717C212.851 10.2717 216.654 5.65918 210.631 4.09015C209.029 3.67288 208.631 2.89978 208.257 2.17301C207.932 1.54203 207.626 0.945975 206.565 0.648025C204.728 0.132221 203.834 0.902196 203.116 1.5208C202.343 2.18684 201.773 2.67741 200.45 1.19875C197.198 -2.43407 193.1 4.09015 193.1 4.09015C193.1 4.09015 185.936 0.364706 184.055 6.03753C182.174 11.7104 188.685 12.783 192.005 11.8789C192.78 11.6679 193.572 12.1986 194.532 12.8424C195.693 13.6203 197.1 14.5632 199.022 14.5632C200.929 14.5632 202.218 13.6346 203.292 12.8603C204.197 12.2086 204.95 11.6663 205.791 11.8789ZM60.9071 21.9541C66.7672 23.4157 71.7911 19.5083 71.7911 19.5083C71.7911 19.5083 77.654 12.4893 68.3684 10.1016C65.899 9.46663 65.2855 8.29017 64.7087 7.18421C64.208 6.22403 63.735 5.31698 62.0992 4.86358C59.2674 4.07866 57.8895 5.25036 56.7825 6.19172C55.5906 7.20526 54.7127 7.95178 52.6723 5.70164C47.6593 0.173431 41.3413 10.1016 41.3413 10.1016C41.3413 10.1016 30.2976 4.43244 27.3972 13.065C24.4967 21.6976 34.5354 23.3299 39.6529 21.9541C40.8476 21.6329 42.0685 22.4405 43.5497 23.4203C45.3391 24.6039 47.5084 26.0389 50.4706 26.0389C53.4105 26.0389 55.3977 24.6257 57.0546 23.4474C58.449 22.4558 59.6095 21.6305 60.9071 21.9541Z"
            opacity="0.654971"
          />
        </svg>
      </div>
      <div className="flex lg:gap-8 gap-4 items-center">
        <div className="md:block hidden">
          <svg
            className="md:w-16 md:h-16 w-12 h-12"
            viewBox="0 0 64 64"
            fill="#F48A42"
          >
            <path d="M37.9087 9.31909C37.5361 8.9468 37.0938 8.65166 36.607 8.45058C36.1202 8.24949 35.5985 8.1464 35.0718 8.14721C34.5452 8.14802 34.0238 8.25272 33.5376 8.45531C33.0515 8.6579 32.6101 8.9544 32.2387 9.32784L16.9145 24.7337L18.2124 21.5399C19.8457 17.5149 15.2782 13.8108 11.6791 16.2345C11.1249 16.6049 10.667 17.0949 10.3345 17.6637L3.39282 29.552C1.05662 33.5536 0.111523 38.2163 0.705147 42.8117C1.29877 47.4072 3.3977 51.6767 6.67407 54.9533L9.13574 57.4149C13.0685 61.3475 18.4024 63.5569 23.9641 63.5569C29.5257 63.5569 34.8596 61.3475 38.7924 57.4149L53.4749 42.7295C54.2189 41.9759 54.6346 40.9586 54.6313 39.8996C54.628 38.8407 54.206 37.826 53.4574 37.077C52.7088 36.328 51.6943 35.9055 50.6354 35.9016C49.5764 35.8978 48.5589 36.313 47.8049 37.0566L43.1266 41.7349L41.5778 40.1862L52.3403 29.4237C53.0843 28.6701 53.5 27.6528 53.4967 26.5938C53.4935 25.5348 53.0715 24.5201 52.3228 23.7711C51.5742 23.0221 50.5598 22.5996 49.5008 22.5958C48.4418 22.592 47.4243 23.0072 46.6703 23.7508L35.9078 34.5133L34.362 32.9674L49.1087 18.2178C49.5012 17.8504 49.8159 17.4077 50.0339 16.9162C50.252 16.4247 50.3689 15.8943 50.3779 15.3567C50.3868 14.8191 50.2876 14.2851 50.086 13.7866C49.8844 13.2881 49.5847 12.8352 49.2046 12.4549C48.8244 12.0746 48.3717 11.7746 47.8733 11.5728C47.3749 11.3709 46.841 11.2714 46.3034 11.2801C45.7657 11.2887 45.2353 11.4054 44.7437 11.6232C44.252 11.841 43.8092 12.1555 43.4416 12.5478L28.692 27.2974L27.1462 25.7516L37.9116 14.9833C38.2836 14.6114 38.5786 14.1699 38.78 13.6839C38.9813 13.198 39.0849 12.6772 39.0849 12.1512C39.0849 11.6252 38.9813 11.1043 38.78 10.6184C38.5786 10.1325 38.2836 9.69096 37.9116 9.31909M15.5582 0.294922L13.1578 1.94867C9.63914 4.37829 6.59129 7.42713 4.16282 10.9466L2.50907 13.347L7.3099 16.6574L8.96657 14.2541C10.9925 11.3202 13.5343 8.77839 16.4682 6.75242L18.8716 5.09576L15.5582 0.294922ZM58.6928 44.9141L57.0362 47.3174C55.0093 50.2516 52.4665 52.7934 49.5316 54.8191L47.1312 56.4758L50.4416 61.2766L52.842 59.6228C56.3614 57.1944 59.4103 54.1465 61.8399 50.6278L63.4937 48.2245L58.6928 44.9141Z" />
          </svg>
        </div>
        <div className="text-darkNavy ">
          {isAdminPage ? (
            <>
              <div className="font-IBMPlex font-semibold text-[0.9rem] md:text-[1.55rem] xl:text-[1.7rem] flex flex-wrap items-center gap-1 md:gap-2">
                {t("greeting").replace("{name}", userFirstName)}
              </div>
              <div className="text-[0.65rem] xl:text-[1.2rem] mt-0.5 md:mt-1">
                {t("desc")
                  .replace("{productsCount}", OrderCount)
                  .replace("{chatsCount}", newChatsCount)
                  .replace("{viewsCount}", viewsCount)}
              </div>
            </>
          ) : (
            <>
              <div className="font-IBMPlex font-semibold text-[1rem] md:text-[1.7rem] xl:text-[1.85rem] flex flex-wrap items-center gap-1 md:gap-2">
                {t("greeting").replace("{name}", userFirstName)}
              </div>
              <div className="text-[0.75rem] xl:text-[1.25rem] mt-0.5 md:mt-1">
                {t("notifications").replace("{count}", notificationsCount)}
              </div>
            </>
          )}
        </div>
      </div>
      {isAdminPage ? (
        <div className="flex flex-row-reverse items-center justify-center gap-4 flex-wrap">
          <Button
            onClick={handleApplyFilter}
            isLoading={isPending}
            className="bg-darkNavy md:py-4 md:px-12 py-3 h-auto px-3 md:rounded-full rounded-xl min-w-0 shadow-[#F48A4233] shadow-lg flex items-center justify-center md:gap-1 gap-0.5"
          >
            <Filter className="md:!w-5 md:!h-5 !w-3 !h-3" />
            <span className="hidden md:block font-semibold text-sm md:text-lg font-IBMPlex">
              {t("filter")}
            </span>
          </Button>
          <DateRangePicker
            lang={langPrefix === "" ? "ar" : "en"}
            onSelect={handleDateRangeSelect}
            translate={trans}
            selectedRange={selectedRange}
            hideText={true}
          />
        </div>
      ) : (
        <div>
          <Button
            as={Link}
            href={`/${langPrefix}dashboard/settings`}
            className="text-xs md:text-base md:px-10 px-5 md:py-4 py-3 h-auto"
          >
            {t("settings")}
          </Button>
        </div>
      )}
    </div>
  );
}
