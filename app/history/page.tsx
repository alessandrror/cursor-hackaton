import { Metadata } from 'next'
import HistoryView from '@/components/history/HistoryView'

export const metadata: Metadata = {
  title: 'History • Cerebryx',
  description: 'View your past study sessions',
}

export default function HistoryPage() {
  return <HistoryView />
}

