import CustomDrawer from "./CustomDrawer";
import Button from "./Button";
import Link from "next/link";
import { Plus } from "./svgs/icons/PlusSvg";

export default function AddProductDrawer({ open, setOpen, langPrefix, t }) {
  return (
    <CustomDrawer
      isOpen={open}
      onClose={() => setOpen(false)}
      placement="bottom"
      hideCloseButton
    >
      <div className="py-16">
        <div className="px-10 mb-14">
          <Button
            className="font-semibold w-full gap-2 ps-6 pe-8 bg-darkNavy !opacity-100"
            as={Link}
            href={`/${langPrefix}add-product`}
            title={t("addAdTitle")}
          >
            <Plus color="#F48A42" />
            {t("addAd")}
          </Button>
        </div>
      </div>
    </CustomDrawer>
  );
}
