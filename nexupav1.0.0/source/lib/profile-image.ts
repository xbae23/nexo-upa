/** Decode and re-encode uploads to a bounded raster; reject SVG and oversized files. */
export async function profileImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Elige una foto JPG, PNG o WebP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("La foto de perfil admite hasta 5 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url; await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error("No se pudo leer la foto.");
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("No se pudo preparar la foto.");
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    ctx.drawImage(image, (image.naturalWidth-side)/2, (image.naturalHeight-side)/2, side, side, 0, 0, 512, 512);
    return canvas.toDataURL("image/webp", .85);
  } finally { URL.revokeObjectURL(url); }
}
