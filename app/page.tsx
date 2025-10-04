import { Metadata } from 'next'
import InputStep from '@/components/input/InputStep'

export const metadata: Metadata = {
  title: 'Study Session • Home',
  description: 'Start your study session by uploading a PDF or entering text',
}

export default function HomePage() {
  return <InputStep />
}



