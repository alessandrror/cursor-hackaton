import { Metadata } from 'next'
import DashboardView from '@/components/dashboard/DashboardView'

export const metadata: Metadata = {
  title: 'Dashboard • Cerebryx',
  description: 'Your study dashboard and progress overview',
}

export default function DashboardPage() {
  return <DashboardView />
}

