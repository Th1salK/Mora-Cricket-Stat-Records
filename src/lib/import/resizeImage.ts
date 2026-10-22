const MAX_EDGE = 1280
const QUALITY = 0.8

export type ResizedImage = { mimeType: string; data: string }

export async function resizeImage(file: File): Promise<ResizedImage> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext("2d")
  if (!context) throw new Error("The browser cannot resize images.")

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY)
  const data = dataUrl.split(",")[1]
  if (!data) throw new Error("The image could not be converted.")

  return { mimeType: "image/jpeg", data }
}
