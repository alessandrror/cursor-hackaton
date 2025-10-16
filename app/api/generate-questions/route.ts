import { NextRequest, NextResponse } from 'next/server'
import { Question } from '@/types/session'
import { detectLanguage, getLanguageName } from '@/lib/language'

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

async function generateQuestions(text: string, questionRange?: { min: number; max: number }): Promise<Question[]> {
  const wordCount = text.trim().split(/\s+/).length
  
  let questionCount: number
  if (questionRange) {
    // Generate random number within the specified range
    questionCount = Math.floor(Math.random() * (questionRange.max - questionRange.min + 1)) + questionRange.min
  } else {
    // Fallback to automatic calculation
    questionCount = Math.min(Math.max(Math.floor(wordCount / 100), 5), 20)
  }
  
  // Detect the language of the input text
  const detectedLanguage = detectLanguage(text)
  const languageName = getLanguageName(detectedLanguage)
  
  // Create language-specific instructions
  const languageInstruction = detectedLanguage === 'en' 
    ? '' 
    : `\n\nIMPORTANT: Generate all questions, options, and answers in ${languageName}. The user's text is in ${languageName}, so respond entirely in ${languageName}.`

  const prompt = `Generate ${questionCount} quiz questions based on the following text. Return a JSON array where each question has:
- id: unique string identifier
- type: "multiple-choice", "true-false", or "short-answer"
- question: the question text
- options: array of 4 options (for multiple-choice) or ["True", "False"] (for true-false), omit for short-answer
- correctAnswer: the correct answer
- difficulty: "easy", "medium", or "hard"
- sourceQuote: the exact text excerpt from the source material that contains the information needed to answer this question (quote the relevant sentence or paragraph)

Mix question types and difficulties. For multiple-choice, make options plausible but only one correct. For true-false, make statements that are clearly true or false. For short-answer, expect concise answers. Always include a sourceQuote that directly supports the correct answer.${languageInstruction}

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

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

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
    const validatedQuestions = questions.map((q, index) => {
      const question = {
        id: q.id || `q${index + 1}`,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty,
        sourceQuote: q.sourceQuote,
      }

      // Ensure true-false questions have proper options and correct answer
      if (question.type === 'true-false') {
        if (!question.options || question.options.length === 0) {
          // Use language-appropriate true/false options
          question.options = detectedLanguage === 'es' 
            ? ['Verdadero', 'Falso']
            : detectedLanguage === 'fr'
            ? ['Vrai', 'Faux']
            : detectedLanguage === 'de'
            ? ['Wahr', 'Falsch']
            : detectedLanguage === 'it'
            ? ['Vero', 'Falso']
            : detectedLanguage === 'pt'
            ? ['Verdadeiro', 'Falso']
            : ['True', 'False']
        }
        
        // Ensure correctAnswer matches the language
        const trueOptions = ['True', 'Verdadero', 'Vrai', 'Wahr', 'Vero', 'Verdadeiro']
        const falseOptions = ['False', 'Falso', 'Faux', 'Falsch', 'Falso', 'Falso']
        
        if (question.correctAnswer && !trueOptions.includes(question.correctAnswer) && !falseOptions.includes(question.correctAnswer)) {
          // Try to normalize the answer
          const normalizedAnswer = question.correctAnswer.toLowerCase().trim()
          const isTrue = ['true', 'verdadero', 'vrai', 'wahr', 'vero', 'verdadeiro'].includes(normalizedAnswer)
          const isFalse = ['false', 'falso', 'faux', 'falsch'].includes(normalizedAnswer)
          
          if (isTrue) {
            question.correctAnswer = detectedLanguage === 'es' 
              ? 'Verdadero'
              : detectedLanguage === 'fr'
              ? 'Vrai'
              : detectedLanguage === 'de'
              ? 'Wahr'
              : detectedLanguage === 'it'
              ? 'Vero'
              : detectedLanguage === 'pt'
              ? 'Verdadeiro'
              : 'True'
          } else if (isFalse) {
            question.correctAnswer = detectedLanguage === 'es' 
              ? 'Falso'
              : detectedLanguage === 'fr'
              ? 'Faux'
              : detectedLanguage === 'de'
              ? 'Falsch'
              : detectedLanguage === 'it'
              ? 'Falso'
              : detectedLanguage === 'pt'
              ? 'Falso'
              : 'False'
          } else {
            // Default to "True" equivalent if we can't determine
            question.correctAnswer = detectedLanguage === 'es' 
              ? 'Verdadero'
              : detectedLanguage === 'fr'
              ? 'Vrai'
              : detectedLanguage === 'de'
              ? 'Wahr'
              : detectedLanguage === 'it'
              ? 'Vero'
              : detectedLanguage === 'pt'
              ? 'Verdadeiro'
              : 'True'
          }
        }
      }

      return question
    })

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

export async function POST(request: NextRequest) {
  try {
    const { text, questionRange } = await request.json()

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Validate question range if provided
    if (questionRange) {
      if (typeof questionRange.min !== 'number' || typeof questionRange.max !== 'number') {
        return NextResponse.json(
          { error: 'Question range must have numeric min and max values' },
          { status: 400 }
        )
      }
      if (questionRange.min < 5 || questionRange.max > 50 || questionRange.min > questionRange.max) {
        return NextResponse.json(
          { error: 'Question range must be between 5-50 with min <= max' },
          { status: 400 }
        )
      }
    }

    const questions = await generateQuestions(text, questionRange)
    
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error generating questions:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate questions' 
      },
      { status: 500 }
    )
  }
}
