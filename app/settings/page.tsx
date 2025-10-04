import { Metadata } from 'next'
import SettingsView from '@/components/settings/SettingsView'

export const metadata: Metadata = {
  title: 'Settings • Cerebryx',
  description: 'Configure your study session preferences',
}

export default function SettingsPage() {
  return <SettingsView />
}

