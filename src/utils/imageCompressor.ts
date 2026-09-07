export interface CompressedImageResult {
  data: string; // base64 without data URI prefix
  mimeType: string;
  previewUrl: string;
}

export async function compressAndProcessImage(
  file: File,
  maxDimension = 1280,
  quality = 0.85
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, don't recompress on canvas to preserve vectors
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const match = base64String.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
        if (match) {
          resolve({
            mimeType: match[1],
            data: match[2],
            previewUrl: base64String,
          });
        } else {
          reject(new Error("Failed to parse SVG"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Calculate new dimensions preserving aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback to basic file reader
        readFallback(file, resolve, reject);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Determine export format (JPEG is most space-efficient for photos)
      const targetMimeType = file.type === "image/png" && !hasTransparency(ctx, width, height)
        ? "image/jpeg"
        : file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg";

      const compressedDataUrl = canvas.toDataURL(targetMimeType, quality);
      const match = compressedDataUrl.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);

      if (match) {
        resolve({
          mimeType: match[1],
          data: match[2],
          previewUrl: compressedDataUrl,
        });
      } else {
        readFallback(file, resolve, reject);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readFallback(file, resolve, reject);
    };

    img.src = objectUrl;
  });
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    const data = ctx.getImageData(0, 0, Math.min(width, 100), Math.min(height, 100)).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function readFallback(
  file: File,
  resolve: (res: CompressedImageResult) => void,
  reject: (err: unknown) => void
) {
  const reader = new FileReader();
  reader.onload = () => {
    const base64String = reader.result as string;
    const match = base64String.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,(.+)$/);
    if (match) {
      resolve({
        mimeType: match[1],
        data: match[2],
        previewUrl: base64String,
      });
    } else {
      reject(new Error("Failed to process image"));
    }
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
}
