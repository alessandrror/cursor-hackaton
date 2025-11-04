'use client'

import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'

if (typeof window !== 'undefined' && 'Worker' in window) {
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()

    const pdf = await getDocument({
      data: arrayBuffer,
      standardFontDataUrl: '/pdfjs_standard_fonts/',
    }).promise

    let fullText = ''

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
    }

    return fullText.trim()
  } catch (error) {
    throw new Error(
      'Failed to extract text from PDF. Please try a different file.'
    )
  }
}
