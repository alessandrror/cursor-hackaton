import { Metadata } from 'next'
import InputStep from '@/components/input/InputStep'

export const metadata: Metadata = {
  title: 'Cerebryx • Study',
  description: 'Start your study session by uploading a PDF or entering text',
}

export default function StudyPage() {
  return <InputStep />
}

