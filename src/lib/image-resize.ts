import { UPLOAD_MAX_EDGE } from '@/constants/const';

const RESIZE_ABOVE_BYTES = 1.5 * 1024 * 1024;

/**
 * Downscale a photo in the browser before upload (phone photos are often 5-10 MB). Small images are sent untouched;
 * larger ones are redrawn with the longest edge capped and re-encoded as JPEG. Any failure returns the original file.
 */
export const resizeImage = async (file: File, maxEdge = UPLOAD_MAX_EDGE): Promise<Blob> => {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size <= RESIZE_ABOVE_BYTES) {
      bitmap.close();

      return file;
    }

    const canvas = document.createElement('canvas');

    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');

    if (!context) return file;

    // JPEG has no transparency: paint white first so transparent PNG areas do not turn black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));

    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
};
