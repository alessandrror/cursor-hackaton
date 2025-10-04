import { Metadata } from 'next'
import SettingsView from '@/components/settings/SettingsView'

export const metadata: Metadata = {
  title: 'Settings • Study Timer & Quiz',
  description: 'Configure your study session preferences',
}

export default function SettingsPage() {
  return <SettingsView />
}

