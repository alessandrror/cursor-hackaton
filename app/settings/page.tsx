import { Metadata } from 'next'
import SettingsView from '@/components/settings/SettingsView'

export const metadata: Metadata = {
  title: 'Settings • Cerebryx',
  description: 'Configure your study session preferences',
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SettingsView />
    </div>
  )
}

