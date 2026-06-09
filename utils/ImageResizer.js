export const resizeImage = (
  file,
  { minWidth = 1, maxWidth = 1500, quality = 1 } = {},
) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let width = img.width;
        let height = img.height;

        if (width < minWidth) {
          return reject(
            new Error(`Image is too small. Minimum width is ${minWidth}px.`),
          );
        }

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with base64
        const resizedBase64 = canvas.toDataURL("image/webp", quality);

        resolve({
          preview: resizedBase64,
          name: file.name,
          type: "image/webp",
          width,
          height,
        });
      };

      img.onerror = (error) => reject(error);
    };

    reader.onerror = (error) => reject(error);
  });
};

// ─── Color & Gradient Extraction Helpers ─────────────────────────────────────

export const extractEdgeColors = (imageData, width, height) => {
  const colors = [];
  const cornerSize = 14;
  const step = 4;
  const regions = [
    [0, Math.min(cornerSize, height), 0, Math.min(cornerSize, width)],
    [0, Math.min(cornerSize, height), Math.max(0, width - cornerSize), width],
    [Math.max(0, height - cornerSize), height, 0, Math.min(cornerSize, width)],
    [Math.max(0, height - cornerSize), height, Math.max(0, width - cornerSize), width],
  ];
  for (const [y0, y1, x0, x1] of regions) {
    for (let y = y0; y < y1; y += step) {
      for (let x = x0; x < x1; x += step) {
        const idx = (y * width + x) * 4;
        colors.push([imageData[idx], imageData[idx + 1], imageData[idx + 2]]);
      }
    }
  }
  return colors;
};

export const enhanceColor = (color) => {
  const rgb = color.match(/\d+/g).map(Number);
  const [r, g, b] = rgb;
  const factor = 0.6;
  const newR = Math.min(255, Math.round(r + (255 - r) * factor));
  const newG = Math.min(255, Math.round(g + (255 - g) * factor));
  const newB = Math.min(255, Math.round(b + (255 - b) * factor));
  return `rgb(${newR}, ${newG}, ${newB})`;
};

export const getDominantColors = (colors) => {
  const colorGroups = {};
  colors.forEach(([r, g, b]) => {
    const groupKey = `${Math.floor(r / 20) * 20}-${Math.floor(g / 20) * 20}-${
      Math.floor(b / 20) * 20
    }`;
    if (!colorGroups[groupKey]) {
      colorGroups[groupKey] = { colors: [], count: 0 };
    }
    colorGroups[groupKey].colors.push([r, g, b]);
    colorGroups[groupKey].count++;
  });

  const sortedGroups = Object.values(colorGroups)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const dominantColors = sortedGroups.map((group) => {
    const avgR = Math.round(
      group.colors.reduce((sum, [r]) => sum + r, 0) / group.colors.length,
    );
    const avgG = Math.round(
      group.colors.reduce((sum, [, g]) => sum + g, 0) / group.colors.length,
    );
    const avgB = Math.round(
      group.colors.reduce((sum, [, , b]) => sum + b, 0) / group.colors.length,
    );
    return `rgb(${avgR}, ${avgG}, ${avgB})`;
  });

  return dominantColors.length >= 2
    ? dominantColors.slice(0, 2)
    : dominantColors.length === 1
      ? [dominantColors[0], enhanceColor(dominantColors[0])]
      : ["#f3f4f6", "#e5e7eb"];
};

export const extractColorsFromCanvas = (ctx, width, height) => {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const edgeColors = extractEdgeColors(imageData.data, width, height);
    return getDominantColors(edgeColors);
  } catch (error) {
    console.error("Error extracting colors:", error);
    return ["#fff", "#fff"];
  }
};

export const extractColorsFromImage = (imgEl) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0, 150, 150);
    return extractColorsFromCanvas(ctx, 150, 150);
  } catch (error) {
    console.error("Error extracting colors from image:", error);
    return ["#fff7f0", "#fff3ea"];
  }
};

