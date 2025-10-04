'use client'

import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'

// Configure PDF.js worker using npm package
GlobalWorkerOptions.workerSrc =
  '//unpkg.com/pdfjs-dist@4.0.0/build/pdf.worker.min.js'

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise

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
