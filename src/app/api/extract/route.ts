import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const EXTRACTION_PROMPT = `You are a document intelligence system. Extract structured data from the uploaded document. Return ONLY valid JSON with these fields:
- document_type: one of "subscription" | "bill" | "warranty" | "appointment" | "deadline" | "receipt" | "insurance" | "other"
- vendor_name: string or null
- amount: number or null (numeric value only, no currency symbol)
- currency: string (e.g. "USD", default "USD" if unclear)
- billing_cycle: one of "monthly" | "annual" | "one-time" | "weekly" | null
- key_date: most important date in ISO format (YYYY-MM-DD) or null
- expiry_date: expiry/end date in ISO format or null
- description: brief 1-sentence description of what this document is
- category: one of "school" | "personal" | "work" | "financial" | "medical" | "government" | "entertainment" | "utilities" | "insurance" | "software" | "other"
- confidence_score: number between 0 and 1 representing your confidence

Never include explanation text outside the JSON. Never include markdown code blocks. Only output the raw JSON object.`

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { base64, mediaType } = await request.json()
    if (!base64 || !mediaType) {
      return NextResponse.json({ error: 'Missing base64 or mediaType' }, { status: 400 })
    }

    // Only allow image types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(mediaType)) {
      return NextResponse.json({ error: 'Unsupported file type for AI extraction' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      EXTRACTION_PROMPT,
      {
        inlineData: {
          mimeType: mediaType,
          data: base64,
        },
      },
    ])

    const text = result.response.text().trim()
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json({ error: 'AI extraction failed' }, { status: 500 })
  }
}
