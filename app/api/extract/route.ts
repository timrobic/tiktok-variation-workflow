import { NextRequest, NextResponse } from 'next/server';
import { extractSlides } from '@/lib/claude';
import { ExtractRequest, ExtractResponse, SlideData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ExtractRequest = await request.json();
    
    if (!body.images || body.images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (body.images.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    const result = await extractSlides(body.images);
    
    // Parse the JSON response from Claude
    let slides: SlideData[];
    try {
      // Try to extract JSON from the response (Claude might include markdown code blocks)
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      } else {
        slides = JSON.parse(result);
      }
    } catch {
      console.error('Failed to parse Claude response:', result);
      return NextResponse.json(
        { error: 'Failed to parse slide extraction results' },
        { status: 500 }
      );
    }

    const response: ExtractResponse = { slides };
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Extract API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to extract slides: ${errorMessage}` },
      { status: 500 }
    );
  }
}
