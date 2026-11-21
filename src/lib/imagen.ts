import sharp from "sharp";

export const MAX_BYTES = 4 * 1024 * 1024;
const LIMITE_PIXELES = 40_000_000;
const FORMATOS = new Set(["jpeg", "png", "webp"]);

export class ImagenInvalida extends Error {}

export async function procesarImagen(entrada: Buffer): Promise<Buffer> {
  if (entrada.length === 0 || entrada.length > MAX_BYTES) throw new ImagenInvalida("La imagen debe pesar menos de 4 MB");

  let formato: string | undefined;
  try {
    formato = (await sharp(entrada, { limitInputPixels: LIMITE_PIXELES }).metadata()).format;
  } catch {
    throw new ImagenInvalida("El archivo no es una imagen válida");
  }
  if (!formato || !FORMATOS.has(formato)) throw new ImagenInvalida("Usa una imagen JPG, PNG o WebP");

  return sharp(entrada, { limitInputPixels: LIMITE_PIXELES })
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}
