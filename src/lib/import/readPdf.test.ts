import { beforeEach, describe, expect, it, vi } from 'vitest'
import fixture from '@/lib/import/fixtures/slc-scorecard.json'
import { MAX_PDF_BYTES, readScorecardPdf } from '@/lib/import/readPdf'

const mock = vi.hoisted(() => ({ load: vi.fn(), destroy: vi.fn(), blank: false, pages: 4 }))
vi.mock('pdfjs-dist', () => ({ GlobalWorkerOptions: { workerSrc: '' }, getDocument: mock.load }))

beforeEach(() => {
  mock.pages = 4; mock.blank = false
  mock.destroy.mockReset().mockResolvedValue(undefined)
  mock.load.mockReset().mockImplementation(() => ({ destroy: mock.destroy, promise: Promise.resolve({ numPages: mock.pages, getPage: async (index: number) => ({ cleanup: vi.fn(), getTextContent: async () => ({ items: mock.blank ? [] : fixture[index - 1].map(item => ({ str: item.text, transform: [1, 0, 0, 1, item.x, item.y] })) }) }) }) }))
})

const file = () => new File(['%PDF-1.4\n'], 'scorecard.pdf', { type: 'application/pdf' })

describe('browser PDF reader', () => {
  it('extracts Mora rows locally and destroys the worker after success', async () => {
    const data = await readScorecardPdf(file())
    expect(data.innings[0].batting).toHaveLength(11)
    expect(data.innings[1].bowling).toHaveLength(7)
    expect(mock.load).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Uint8Array), stopAtErrors: true }))
    expect(mock.destroy).toHaveBeenCalledOnce()
  })

  it('rejects fake, empty and oversized files before loading the PDF library', async () => {
    await expect(readScorecardPdf(new File(['hello'], 'scorecard.pdf'))).rejects.toThrow('not a valid PDF')
    await expect(readScorecardPdf(new File([], 'scorecard.pdf'))).rejects.toThrow('10 MB')
    await expect(readScorecardPdf(new File(['%PDF-'], 'image.png'))).rejects.toThrow('10 MB')
    await expect(readScorecardPdf({ name: 'large.pdf', size: MAX_PDF_BYTES + 1 } as File)).rejects.toThrow('10 MB')
    expect(mock.load).not.toHaveBeenCalled()
  })

  it('rejects too many pages and image-only scans and releases resources', async () => {
    mock.pages = 13
    await expect(readScorecardPdf(file())).rejects.toThrow('12 pages')
    expect(mock.destroy).toHaveBeenCalledOnce()
    mock.pages = 4; mock.blank = true
    await expect(readScorecardPdf(file())).rejects.toThrow('no readable text')
    expect(mock.destroy).toHaveBeenCalledTimes(2)
  })

  it('rejects locked documents and releases resources on failure', async () => {
    const error = new Error('Password needed'); error.name = 'PasswordException'
    mock.load.mockReturnValue({ promise: Promise.reject(error), destroy: mock.destroy })
    await expect(readScorecardPdf(file())).rejects.toThrow('Password-protected')
    expect(mock.destroy).toHaveBeenCalledOnce()
  })

  it('cancels an in-flight read and destroys its worker', async () => {
    const controller = new AbortController()
    mock.load.mockReturnValue({ promise: new Promise(() => {}), destroy: mock.destroy })
    const result = readScorecardPdf(file(), controller.signal)
    const rejected = expect(result).rejects.toThrow('cancelled')
    await vi.waitFor(() => expect(mock.load).toHaveBeenCalledOnce())
    controller.abort()
    await rejected
    expect(mock.destroy).toHaveBeenCalledOnce()
  })
})
