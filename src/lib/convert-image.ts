import sharp from "sharp";

export const convertToWebP = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const webpBuffer = await sharp(Buffer.from(buffer))
    .rotate() // ini yang memperbaiki orientasi sesuai EXIF
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({
      quality: 70,
      effort: 6,
      smartSubsample: true,
    })
    .toBuffer();

  return webpBuffer;
};
