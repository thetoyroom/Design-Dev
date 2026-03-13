import Tesseract from "tesseract.js";
import sharp from "sharp";
import axios from "axios";

/**
 * Downloads an image, crops it to the bottom region where metadata resides,
 * and performs optimized OCR.
 */
export async function extractTextFromImage(imageUrl: string) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 1080;
    const height = metadata.height || 1080;

    // Crop to the bottom 35% of the image (region for Tool Name + URL)
    const processedImageBuffer = await sharp(buffer)
      .extract({ 
        left: 0, 
        top: Math.floor(height * 0.65), 
        width: width, 
        height: Math.floor(height * 0.35) 
      })
      .resize(width * 2) // Upscale for better OCR character recognition
      .grayscale()
      .normalize()
      .threshold(160) // High contrast for clean text isolation
      .toBuffer();

    const result = await Tesseract.recognize(processedImageBuffer, "eng", {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK as any,
    } as any);

    return result.data.text;
  } catch (error) {
    console.error("OCR Preprocessing Error:", error);
    return "";
  }
}
