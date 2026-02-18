/**
 * Compress an image file to a maximum file size (default 500KB).
 * Uses canvas and iterative quality/dimension reduction.
 */
const MAX_SIZE_BYTES = 500 * 1024; // 500KB

export async function compressImageToMaxSize(
  file: File,
  maxSizeBytes: number = MAX_SIZE_BYTES
): Promise<File> {
  if (file.size <= maxSizeBytes) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      let width = img.naturalWidth;
      let height = img.naturalHeight;
      let quality = 0.85;

      const tryCompress = (): Promise<File> => {
        return new Promise((res, rej) => {
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                rej(new Error("Failed to compress"));
                return;
              }
              if (blob.size <= maxSizeBytes) {
                res(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
              } else if (quality > 0.35) {
                quality -= 0.1;
                tryCompress().then(res).catch(rej);
              } else if (width > 600 || height > 600) {
                const ratio = Math.sqrt(maxSizeBytes / blob.size) * 0.9;
                width = Math.max(400, Math.floor(width * ratio));
                height = Math.max(300, Math.floor(height * ratio));
                quality = 0.75;
                tryCompress().then(res).catch(rej);
              } else {
                res(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
              }
            },
            "image/jpeg",
            quality
          );
        });
      };

      tryCompress().then(resolve).catch(reject);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
