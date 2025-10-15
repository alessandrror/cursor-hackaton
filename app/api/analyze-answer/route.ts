import { NextRequest, NextResponse } from 'next/server'
import { detectLanguage, getLanguageName } from '@/lib/language'

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

async function analyzeOpenEndedAnswer(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<{
  score: number
  maxScore: number
  feedback: string
  isCorrect: boolean
}> {
  // Detect the language of the input content
  const combinedText = `${question} ${userAnswer} ${correctAnswer}`
  const detectedLanguage = detectLanguage(combinedText)
  const languageName = getLanguageName(detectedLanguage)
  
  try {
    
    // Create language-specific instructions
    const languageInstruction = detectedLanguage === 'en' 
      ? '' 
      : `\n\nIMPORTANT: Provide all feedback and analysis in ${languageName}. The question and answers are in ${languageName}, so respond entirely in ${languageName}.`

    const prompt = `Analyze this open-ended question and answer. Rate the user's answer on a scale of 0-1 (where 1 is perfect) and provide constructive feedback.

Question: ${question}
Correct Answer: ${correctAnswer}
User Answer: ${userAnswer}

Respond with a JSON object containing:
- score: number between 0 and 1 (e.g., 0.8 for 80% correct)
- maxScore: always 1
- feedback: string with specific feedback on what they got right/wrong
- isCorrect: boolean (true if score >= 0.7)

Be generous but fair. Consider partial credit for related concepts, even if not perfectly worded.${languageInstruction}`

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

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
              detectedLanguage === 'en'
                ? 'You are an educational assessment AI. Analyze student answers fairly and provide helpful feedback. Always respond with valid JSON only.'
                : `You are an educational assessment AI that provides feedback in ${languageName}. Analyze student answers fairly and provide helpful feedback. Always respond with valid JSON only, and ensure all feedback text is in ${languageName}.`,
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

    const data: OpenAIResponse = await response.json()
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
    console.error('Error analyzing open-ended answer:', error)
    // Fallback to simple string comparison with language-appropriate messages
    const isCorrect =
      userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    
    const feedback = isCorrect
      ? (detectedLanguage === 'es' ? '¡Correcto!' 
         : detectedLanguage === 'fr' ? 'Correct !'
         : detectedLanguage === 'de' ? 'Richtig!'
         : detectedLanguage === 'it' ? 'Corretto!'
         : detectedLanguage === 'pt' ? 'Correto!'
         : 'Correct!')
      : (detectedLanguage === 'es' ? 'Incorrecto. Considera revisar el material.'
         : detectedLanguage === 'fr' ? 'Incorrect. Considérez réviser le matériel.'
         : detectedLanguage === 'de' ? 'Falsch. Betrachten Sie das Material zu überprüfen.'
         : detectedLanguage === 'it' ? 'Sbagliato. Considera di rivedere il materiale.'
         : detectedLanguage === 'pt' ? 'Incorreto. Considere revisar o material.'
         : 'Incorrect. Consider reviewing the material.')
         
    return {
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      feedback,
      isCorrect,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, correctAnswer } = await request.json()

    if (!question || !userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userAnswer, correctAnswer' },
        { status: 400 }
      )
    }

    const analysis = await analyzeOpenEndedAnswer(question, userAnswer, correctAnswer)
    
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error in analyze-answer API:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to analyze answer' 
      },
      { status: 500 }
    )
  }
}
