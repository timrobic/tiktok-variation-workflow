import { NextRequest, NextResponse } from 'next/server';
import { analyzeSlides } from '@/lib/claude';
import { AnalyzeRequest, AnalyzeResponse, AnalysisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    
    if (!body.slides || body.slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides provided' },
        { status: 400 }
      );
    }

    const slidesJson = JSON.stringify(body.slides, null, 2);
    const result = await analyzeSlides(slidesJson);
    
    // Parse the JSON response from Claude
    let analysis: AnalysisResult;
    try {
      // Try to extract JSON from the response (Claude might include markdown code blocks)
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(result);
      }
    } catch {
      console.error('Failed to parse Claude response:', result);
      return NextResponse.json(
        { error: 'Failed to parse analysis results' },
        { status: 500 }
      );
    }

    const response: AnalyzeResponse = { analysis };
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze slides' },
      { status: 500 }
    );
  }
}
