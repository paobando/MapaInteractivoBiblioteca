import { projectId, publicAnonKey } from "../../utils/supabase/info";

/* Las fotos se guardan como archivos en el bucket público "images" de Supabase
   Storage; en el mapa solo queda su enlace. Guardarlas como texto (base64)
   dentro de map_state hacía que el guardado superara el tiempo límite. */
const BUCKET = "images";
const STORAGE_URL = `https://${projectId}.supabase.co/storage/v1/object`;
const MAX_IMAGE_SIDE = 1280;

/* Reduce la foto a un tamaño razonable para el mapa (máx. 1280 px, JPEG). */
export async function compressImage(image: Blob): Promise<Blob> {
  if (image.type === "image/gif") return image;
  const bitmap = await createImageBitmap(image);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return image;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  return blob && blob.size < image.size ? blob : image;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/* Comprime y sube la foto; devuelve su enlace público. */
export async function uploadImage(file: Blob, name = "foto"): Promise<string> {
  let image = file;
  try {
    image = await compressImage(file);
  } catch {
    /* si el navegador no puede procesarla, se sube el archivo original */
  }
  const baseName = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_") || "foto";
  const fileName = `${Date.now()}-${baseName}.${EXTENSIONS[image.type] ?? "img"}`;
  const response = await fetch(`${STORAGE_URL}/${BUCKET}/${fileName}`, {
    method: "POST",
    headers: {
      apikey: publicAnonKey,
      Authorization: `Bearer ${publicAnonKey}`,
      "Content-Type": image.type,
    },
    body: image,
  });
  if (!response.ok) throw new Error(`Error ${response.status} al subir la foto`);
  return `${STORAGE_URL}/public/${BUCKET}/${fileName}`;
}

/* Sube una foto guardada como texto (data:...) y devuelve su enlace. */
export async function uploadDataUrl(dataUrl: string, name: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  return uploadImage(blob, name);
}
