'use client'

import { GlobalWorkerOptions } from 'pdfjs-dist'

// Configure PDF.js worker - using CDN for now
GlobalWorkerOptions.workerSrc =
  'https://unpkg.com/pdfjs-dist@4.0.0/build/pdf.worker.min.js'

// Placeholder function - will be implemented in next phase
export async function extractTextFromPdf(file: File): Promise<string> {
  // TODO: Implement PDF text extraction
  throw new Error('PDF extraction not yet implemented')
}
