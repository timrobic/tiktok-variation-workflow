import { NextRequest, NextResponse } from 'next/server';
import { compilePrompt } from '@/lib/claude';
import { CompileRequest, CompileResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CompileRequest = await request.json();
    
    if (!body.slides || body.slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides provided' },
        { status: 400 }
      );
    }

    // Build the configuration object for Claude
    const config = {
      slides: body.slides.map(slide => ({
        number: slide.slide_number,
        text: slide.extracted_text,
        role: slide.role,
        decision: slide.decision,
      })),
      original_pain_point: body.originalPainPoint,
      new_pain_point: body.newPainPoint,
      brand: body.brand,
      tone: body.tone,
      variation_count: body.variationCount,
    };

    const configJson = JSON.stringify(config, null, 2);
    const prompt = await compilePrompt(configJson);

    const response: CompileResponse = { prompt };
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Compile API error:', error);
    return NextResponse.json(
      { error: 'Failed to compile prompt' },
      { status: 500 }
    );
  }
}
