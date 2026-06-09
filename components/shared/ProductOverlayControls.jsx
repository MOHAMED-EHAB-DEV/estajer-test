"use client";
import Button from "../ui/Button";
import { Love } from "../ui/svgs/icons/LoveSvg";
import { Star } from "../ui/svgs/icons/StarSvg";
import { Checkbox } from "@heroui/checkbox";

export default function ProductOverlayControls({
  admin,
  owner,
  product,
  favoriteProducts = [],
  toggleFavorite,
  handleToggleMain,
  onSelect,
  isSelected,
  isFirstSelected,
}) {
  return (
    <>
      {/* Regular User - Favorite Button */}
      {!owner && !admin && (
        <div className="absolute top-0 end-0 z-10 p-4">
          <button
            type="button"
            onClick={() => toggleFavorite(product._id)}
            className="shadow rounded-full"
            aria-label="add to favorites"
          >
            <Love
              filled={favoriteProducts.includes(product._id)}
              className="md:w-10 w-7 h-auto"
            />
          </button>
        </div>
      )}

      {/* Admin - Star Toggle for Main Product */}
      {admin && (
        <div className="absolute top-0 end-0 z-10 p-4">
          <Button
            color="transparent"
            className="min-w-0 w-12 p-3 bg-[#EAEEF3] rounded-full"
            onPress={() => handleToggleMain(product._id, product.isMain)}
            title={
              product.isMain ? "إلغاء المنتج الرئيسي" : "تعيين كمنتج رئيسي"
            }
          >
            <Star
              size={18}
              filled={product.isMain}
              className="md:w-[18px] w-[14px] h-auto"
            />
          </Button>
        </div>
      )}

      {/* Owner Product Selection Checkbox */}
      {owner && onSelect && (
        <div className="absolute top-0 start-0 z-10 p-4">
          <Checkbox
            isSelected={isSelected || false}
            onValueChange={() => onSelect(product._id)}
            color="warning"
            size="lg"
            classNames={{
              base: `bg-white rounded shadow-lg flex rounded-xl item-center justify-center ${
                isSelected ? "ring-2 ring-[#f48a42]" : ""
              }`,
              wrapper: isSelected
                ? "ring-2 ring-[#f48a42] bg-[#f48a42] !mx-0"
                : "!mx-0",
            }}
          />
        </div>
      )}

      {/* Admin Product Selection Checkbox (for pending products) */}
      {admin && onSelect && !product.approved && !product.rejected && (
        <div className="absolute top-0 start-0 z-10 p-4">
          <Checkbox
            isSelected={isSelected || false}
            onValueChange={() => onSelect(product._id)}
            color={isFirstSelected ? "warning" : "primary"}
            size="lg"
            classNames={{
              base: `bg-white rounded shadow-lg flex rounded-xl  item-center justify-center`,
              wrapper: isFirstSelected
                ? "ring-2 ring-warning-400 bg-warning-500 !mx-0"
                : "!mx-0",
            }}
          />
        </div>
      )}
    </>
  );
}
