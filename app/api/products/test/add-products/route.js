import connectDB from "@/lib/db";

import { NextResponse } from "next/server";
const products = [];
const newProduct = ({
  NameAr,
  NameEn,
  descriptionAr,
  descriptionEn,
  rentprice,
  supCategory,
}) => ({
  nameAr: NameAr,
  nameEn: NameEn,
  descriptionAr: descriptionAr,
  descriptionEn: descriptionEn,
  quantity: 500,
  status: "used",
  category: "Games",
  subCategory: "ElectricalAppliances",
  images: [
    {
      preview:
        "https://res.cloudinary.com/dhfzkadm2/image/upload/v1754967177/istockphoto-1147544807-612x612_nmqsvn.webp",
      gradientColors: ["rgb(203 201 201)", "rgb(203 201 201)"],
      gradientStyle: "linear-gradient(rgb(203 201 201), rgb(203 201 201))",
    },
  ],
  approved: false,
  location: {
    type: "Point",
    coordinates: [46.677808017822485, 24.712468732639],
  },
  addressAr: {
    country: "السعودية",
    governorate: "منطقة الرياض",
    city: "امارة منطقة الرياض",
  },
  addressEn: {
    city: "Riyadh Principality",
    governorate: "Riyadh Province",
    country: "Saudi Arabia",
  },
  rental: {
    value: rentprice,
    insurance: 0,
    delivery: { cost: 0, type: "delivery" },
    discountTiers: [],
    packages: [],
    minDays: 1,
  },
  services: [],
  owner: "68a6fa1e01934cfaceeb1b3b",
});

// const extractColorsFromImage = async (imageUrl) => {
//   try {
//     // Fetch the image from URL
//     const response = await fetch(imageUrl);
//     if (!response.ok) {
//       throw new Error(`Failed to fetch image: ${response.statusText}`);
//     }

//     const imageBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(imageBuffer);

//     // Resize image to smaller size for faster processing (similar to your 150x150 analysis canvas)
//     const resizedBuffer = await sharp(buffer)
//       .resize(150, 150, { fit: "cover" })
//       .raw()
//       .toBuffer({ resolveWithObject: true });

//     const { data, info } = resizedBuffer;
//     const { width, height, channels } = info;

//     // Extract colors from edges (corners) similar to your frontend logic
//     const edgeColors = extractEdgeColorsFromBuffer(
//       data,
//       width,
//       height,
//       channels
//     );

//     // Get dominant colors
//     const dominantColors = getDominantColors(edgeColors);

//     return {
//       gradientColors: dominantColors,
//       gradientStyle: `linear-gradient(135deg, ${dominantColors[0]}, ${dominantColors[1]})`,
//     };
//   } catch (error) {
//     console.error("Error extracting colors:", error);
//     return {
//       gradientColors: ["#f3f4f6", "#e5e7eb"],
//       gradientStyle: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
//     };
//   }
// };

// const extractEdgeColorsFromBuffer = (data, width, height, channels) => {
//   const colors = [];
//   const cornerSize = 15;
//   const step = 6;

//   // Helper function to get pixel color at position
//   const getPixelColor = (x, y) => {
//     const idx = (y * width + x) * channels;
//     return [data[idx], data[idx + 1], data[idx + 2]]; // RGB
//   };

//   // Top-left corner
//   for (let y = 0; y < Math.min(cornerSize, height); y += step) {
//     for (let x = 0; x < Math.min(cornerSize, width); x += step) {
//       colors.push(getPixelColor(x, y));
//     }
//   }

//   // Top-right corner
//   for (let y = 0; y < Math.min(cornerSize, height); y += step) {
//     for (let x = Math.max(0, width - cornerSize); x < width; x += step) {
//       colors.push(getPixelColor(x, y));
//     }
//   }

//   // Bottom-left corner
//   for (let y = Math.max(0, height - cornerSize); y < height; y += step) {
//     for (let x = 0; x < Math.min(cornerSize, width); x += step) {
//       colors.push(getPixelColor(x, y));
//     }
//   }

//   // Bottom-right corner
//   for (let y = Math.max(0, height - cornerSize); y < height; y += step) {
//     for (let x = Math.max(0, width - cornerSize); x < width; x += step) {
//       colors.push(getPixelColor(x, y));
//     }
//   }

//   return colors;
// };

// const getDominantColors = (colors) => {
//   const colorGroups = {};

//   colors.forEach(([r, g, b]) => {
//     // Group colors by similarity (reduce precision for grouping)
//     const groupKey = `${Math.floor(r / 20) * 20}-${Math.floor(g / 20) * 20}-${
//       Math.floor(b / 20) * 20
//     }`;

//     if (!colorGroups[groupKey]) {
//       colorGroups[groupKey] = { colors: [], count: 0 };
//     }

//     colorGroups[groupKey].colors.push([r, g, b]);
//     colorGroups[groupKey].count++;
//   });

//   // Sort by frequency and get top colors
//   const sortedGroups = Object.values(colorGroups)
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 3);

//   // Calculate average color for each group
//   const dominantColors = sortedGroups.map((group) => {
//     const avgR = Math.round(
//       group.colors.reduce((sum, [r]) => sum + r, 0) / group.colors.length
//     );
//     const avgG = Math.round(
//       group.colors.reduce((sum, [, g]) => sum + g, 0) / group.colors.length
//     );
//     const avgB = Math.round(
//       group.colors.reduce((sum, [, , b]) => sum + b, 0) / group.colors.length
//     );

//     return `rgb(${avgR}, ${avgG}, ${avgB})`;
//   });

//   return dominantColors.length >= 2
//     ? dominantColors.slice(0, 2)
//     : dominantColors.length === 1
//     ? [dominantColors[0], enhanceColor(dominantColors[0])]
//     : ["#f3f4f6", "#e5e7eb"];
// };

// const enhanceColor = (color) => {
//   const rgb = color.match(/\d+/g).map(Number);
//   const [r, g, b] = rgb;
//   const factor = 0.6;

//   const newR = Math.min(255, Math.round(r + (255 - r) * factor));
//   const newG = Math.min(255, Math.round(g + (255 - g) * factor));
//   const newB = Math.min(255, Math.round(b + (255 - b) * factor));

//   return `rgb(${newR}, ${newG}, ${newB})`;
// };

// // Usage example:
// const processImage = async (imageUrl) => {
//   const colorData = await extractColorsFromImage(imageUrl);
//   console.log("Extracted colors:", colorData);
//   return colorData;
// };

export async function GET(req) {
  try {
    await connectDB();

    const urls = [];
    // const productData = await fetch("http://localhost:3001/api/products/test", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ urls }),
    // });
    // const tempData = await productData.json();
    // const a = await Promise.all(
    //   tempData.map(async (data) => {
    //     const images = await Promise.all(
    //       data.images.map(async (image) => {
    //         const uploaded = await cloudinary.uploader.upload(image.url, {
    //           folder: "products",
    //         });
    //         return {
    //           preview: uploaded.secure_url,
    //           gradientColors: image.gradientColors,
    //           gradientStyle: image.gradientStyle,
    //         };
    //       })
    //     );
    //     return Product.create({ ...data, images });
    //   })
    // );

    const a = await Promise
      .all
      // products.map(async (product) => Product.create(newProduct(product)))
      ();
    // const a = await Product.updateMany(
    //   { owner: "689869994224bc44b7739954" },
    //   { $set: { "rental.delivery.cost": 5 } }
    // );

    // change all products approve = flase

    // const products = await Product.find({
    //   owner: "687b962ce5bb4b5fac4eae7e",
    // }).limit(2);
    // const a = await Promise
    //   .all
    //   // products.map(async (p) =>
    //   //   Product.findByIdAndUpdate(p._id, { approved: false })
    //   // )
    //   ();

    return NextResponse.json({
      count: a.length,
      success: true,
      data: a,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
