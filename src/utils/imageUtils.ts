/**
 * Convert Base64 string to HTMLImageElement for AI processing
 */
export const createImageFromBase64 = async (base64: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => resolve(img);
  });
};

