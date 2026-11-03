import { parseSlcPdf, type PdfTextItem } from '@/lib/import/parseSlcPdf'

export const MAX_PDF_BYTES = 10 * 1024 * 1024
const MAX_PAGES = 12
const MAX_ITEMS = 30000

export async function readScorecardPdf(file: File, signal?: AbortSignal) {
  if (!file.name.toLowerCase().endsWith('.pdf') || file.size === 0 || file.size > MAX_PDF_BYTES) throw new Error('Choose one PDF smaller than 10 MB.')
  const data = new Uint8Array(await file.arrayBuffer())
  if (new TextDecoder().decode(data.slice(0, 5)) !== '%PDF-') throw new Error('This file is not a valid PDF.')
  signal?.throwIfAborted()
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  const loading = pdfjs.getDocument({ data, stopAtErrors: true, useSystemFonts: true })
  let abort: (() => void) | undefined
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    const cancelled = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('PDF reading took too long. Try a smaller scorecard export.')), 30000)
      abort = () => reject(new Error('PDF reading cancelled.'))
      if (signal?.aborted) abort()
      else signal?.addEventListener('abort', abort, { once: true })
    })
    const extract = async () => {
      const pdf = await loading.promise
      if (pdf.numPages > MAX_PAGES) throw new Error('Choose a scorecard with 12 pages or fewer.')
      const pages: PdfTextItem[][] = []
      let count = 0
      for (let i = 1; i <= pdf.numPages; i++) {
        signal?.throwIfAborted()
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        count += content.items.length
        if (count > MAX_ITEMS) throw new Error('This PDF contains too much text. Choose a scorecard export.')
        pages.push(content.items.flatMap(item => 'str' in item && item.str.trim() ? [{ text: item.str.trim(), x: item.transform[4], y: item.transform[5] }] : []))
        page.cleanup()
      }
      if (pages.every(page => page.length === 0)) throw new Error('This PDF has no readable text. Use a text-based export or the screenshot reader.')
      return parseSlcPdf(pages)
    }
    return await Promise.race([extract(), cancelled])
  } catch (error) {
    if (error instanceof Error && error.name === 'PasswordException') throw new Error('Password-protected PDFs are not supported. Export an unlocked scorecard.')
    throw error
  } finally {
    clearTimeout(timeout)
    if (abort) signal?.removeEventListener('abort', abort)
    await loading.destroy()
  }
}
