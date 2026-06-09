const isProduction = process.env.NODE_ENV === "production";
export const anyImgUrl = ({
  src,
  size = 512,
  quality = 80,
  aspectRatio,
  crop,
}) => {
  // Extract image ID from Cloudinary URL (e.g., products/xej9lxfadq58blaskx98)
  const getImageId = (previewUrl) => {
    const match = previewUrl.match(/\/upload\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : previewUrl;
  };
  // Check if URL contains Cloudinary identifier
  const processedSrc = src?.includes("dhfzkadm2") ? getImageId(src) : src;
  // Build URL with query parameters
  const params = new URLSearchParams({ w: size, q: quality });
  if (aspectRatio) params.set("ar", aspectRatio);
  if (crop) params.set("crop", "true");

  return `${
    isProduction ? "https://assets.estajer.com" : ""
  }/estajer/images/${encodeURIComponent(processedSrc)}?${params.toString()}`;
};
