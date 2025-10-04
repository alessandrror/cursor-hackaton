'use client'

import { Question, Difficulty } from '@/types/session'

interface OpenAIMessage {
  role: 'system' | 'user'
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function generateQuestions(
  text: string,
  apiKey: string
): Promise<Question[]> {
  const wordCount = text.trim().split(/\s+/).length
  const questionCount = Math.min(Math.max(Math.floor(wordCount / 100), 5), 20)

  const prompt = `Generate ${questionCount} quiz questions based on the following text. Return a JSON array where each question has:
- id: unique string identifier
- type: "multiple-choice", "true-false", or "short-answer"
- question: the question text
- options: array of 4 options (for multiple-choice) or ["True", "False"] (for true-false), omit for short-answer
- correctAnswer: the correct answer
- difficulty: "easy", "medium", or "hard"

Mix question types and difficulties. For multiple-choice, make options plausible but only one correct. For true-false, make statements that are clearly true or false. For short-answer, expect concise answers.

Text: ${text.substring(0, 4000)}`

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant that generates educational quiz questions. Always respond with valid JSON only, no markdown formatting or additional text.'
    },
    {
      role: 'user',
      content: prompt
    }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`)
    }

    const data: OpenAIResponse = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI API')
    }

    // Clean up the response - remove markdown code blocks if present
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const questions: Question[] = JSON.parse(cleanedContent)
    
    // Validate the response
    if (!Array.isArray(questions)) {
      throw new Error('Invalid response format: expected array of questions')
    }

    // Add IDs if missing and validate structure
    const validatedQuestions = questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      type: q.type,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
    }))

    return validatedQuestions
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse questions from OpenAI. Please try again.')
    }
    
    if (error instanceof Error && error.message.includes('API error')) {
      throw error
    }
    
    throw new Error('Failed to generate questions. Please check your API key and try again.')
  }
}

export function calculateScore(questions: Question[], answers: Array<{ questionId: string; answer: string }>): {
  score: number
  totalPoints: number
  percentage: number
  correctAnswers: number
  totalQuestions: number
} {
  const difficultyPoints = { easy: 1, medium: 2, hard: 3 }
  
  let score = 0
  let totalPoints = 0
  let correctAnswers = 0

  questions.forEach(question => {
    const userAnswer = answers.find(a => a.questionId === question.id)
    const points = difficultyPoints[question.difficulty]
    totalPoints += points

    if (userAnswer) {
      const isCorrect = userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      if (isCorrect) {
        score += points
        correctAnswers++
      }
    }
  })

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0

  return {
    score,
    totalPoints,
    percentage,
    correctAnswers,
    totalQuestions: questions.length,
  }
}
