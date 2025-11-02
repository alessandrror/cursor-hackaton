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
      content:
        'You are a helpful assistant that generates educational quiz questions. Always respond with valid JSON only, no markdown formatting or additional text.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 1,
        max_completion_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`
      )
    }

    const data: OpenAIResponse = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI API')
    }

    // Clean up the response - remove markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

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
      throw new Error(
        'Failed to parse questions from OpenAI. Please try again.'
      )
    }

    if (error instanceof Error && error.message.includes('API error')) {
      throw error
    }

    throw new Error(
      'Failed to generate questions. Please check your API key and try again.'
    )
  }
}

export async function analyzeOpenEndedAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  apiKey: string
): Promise<{
  score: number
  maxScore: number
  feedback: string
  isCorrect: boolean
}> {
  try {
    const prompt = `Analyze this open-ended question and answer. Rate the user's answer on a scale of 0-1 (where 1 is perfect) and provide constructive feedback.

Question: ${question}
Correct Answer: ${correctAnswer}
User Answer: ${userAnswer}

Respond with a JSON object containing:
- score: number between 0 and 1 (e.g., 0.8 for 80% correct)
- maxScore: always 1
- feedback: string with specific feedback on what they got right/wrong
- isCorrect: boolean (true if score >= 0.7)

Be generous but fair. Consider partial credit for related concepts, even if not perfectly worded.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an educational assessment AI. Analyze student answers fairly and provide helpful feedback. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze answer')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No analysis received')
    }

    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    const analysis = JSON.parse(cleanedContent)

    return {
      score: Math.max(0, Math.min(1, analysis.score || 0)),
      maxScore: 1,
      feedback: analysis.feedback || 'No feedback available',
      isCorrect: analysis.isCorrect || false,
    }
  } catch (error) {
    // Error analyzing open-ended answer - fallback to simple string comparison
    const isCorrect =
      userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    return {
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      feedback: isCorrect
        ? 'Correct!'
        : 'Incorrect. Consider reviewing the material.',
      isCorrect,
    }
  }
}

// Normalize true/false answers across languages
function normalizeTrueFalseAnswer(answer: string): 'true' | 'false' | null {
  const normalized = answer.toLowerCase().trim()
  
  // English
  if (normalized === 'true') return 'true'
  if (normalized === 'false') return 'false'
  
  // Spanish
  if (normalized === 'verdadero') return 'true'
  if (normalized === 'falso') return 'false'
  
  // French
  if (normalized === 'vrai') return 'true'
  if (normalized === 'faux') return 'false'
  
  // German
  if (normalized === 'wahr') return 'true'
  if (normalized === 'falsch') return 'false'
  
  // Italian
  if (normalized === 'vero') return 'true'
  if (normalized === 'falso') return 'false'
  
  // Portuguese
  if (normalized === 'verdadeiro') return 'true'
  if (normalized === 'falso') return 'false'
  
  return null
}

export function calculateScore(
  questions: Question[],
  answers: Array<{ questionId: string; answer: string }>
): {
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

  questions.forEach((question) => {
    const userAnswer = answers.find((a) => a.questionId === question.id)
    const points = difficultyPoints[question.difficulty]
    totalPoints += points

    if (userAnswer) {
      if (question.type === 'short-answer') {
        // For short-answer questions, we'll use a more lenient comparison
        const userAnswerLower = userAnswer.answer.toLowerCase().trim()
        const correctAnswerLower = question.correctAnswer.toLowerCase().trim()

        // Check for exact match first
        if (userAnswerLower === correctAnswerLower) {
          score += points
          correctAnswers++
        } else {
          // Check for partial matches (contains key words)
          const correctWords = correctAnswerLower
            .split(/\s+/)
            .filter((word) => word.length > 2)
          const userWords = userAnswerLower
            .split(/\s+/)
            .filter((word) => word.length > 2)
          const matchingWords = correctWords.filter((word) =>
            userWords.some(
              (userWord) => userWord.includes(word) || word.includes(userWord)
            )
          )

          // Give partial credit if at least 50% of key words match
          const partialScore = matchingWords.length / correctWords.length
          if (partialScore >= 0.5) {
            score += points * partialScore
            if (partialScore >= 0.7) {
              correctAnswers++
            }
          }
        }
      } else {
        // For multiple choice and true/false, use appropriate comparison
        let isCorrect = false
        
        if (question.type === 'true-false') {
          // For true/false questions, normalize both answers to handle language equivalents
          const userNormalized = normalizeTrueFalseAnswer(userAnswer.answer)
          const correctNormalized = normalizeTrueFalseAnswer(question.correctAnswer)
          
          if (userNormalized && correctNormalized) {
            isCorrect = userNormalized === correctNormalized
          } else {
            // Fallback to exact match if normalization fails
            isCorrect = userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
          }
        } else {
          // For multiple choice, use exact match
          isCorrect = userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        }
        
        if (isCorrect) {
          score += points
          correctAnswers++
        }
      }
    }
  })

  const percentage =
    totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0

  return {
    score,
    totalPoints,
    percentage,
    correctAnswers,
    totalQuestions: questions.length,
  }
}
