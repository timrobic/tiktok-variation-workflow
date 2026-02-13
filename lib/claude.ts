import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const EXTRACT_SYSTEM_PROMPT = `You are analyzing TikTok slideshow content. Extract the text from each slide image and identify its structural role.

For each slide, output:
{
  "slide_number": 1,
  "extracted_text": "[exact text from slide]",
  "role": "[HOOK/TIP/APP_MENTION/EMOTIONAL_CLOSE/OTHER]",
  "contains_brand_mention": true/false,
  "brand_mentioned": "[brand name if applicable]"
}

Return as JSON array. Only return the JSON array, no other text.`;

export const ANALYZE_SYSTEM_PROMPT = `You are a UGC TikTok virality expert. Analyze this slideshow format and provide:

1. FORMAT ANALYSIS
- Hook type (listicle/controversial/curiosity gap/etc.)
- Emotional arc
- Target audience pain point
- Conversion strategy used

2. TONE ANALYSIS
- Describe the tone of the original content (e.g., "warm, supportive, mom-to-mom" or "direct, expert-like, informative")
- Key tone markers (specific phrases or patterns that define the voice)

3. VARIATION RECOMMENDATIONS
For each slide, explain:
- What makes it work
- Risk level if varied (LOW/MEDIUM/HIGH)
- Suggested variation approaches if varied

4. PAIN POINT EXTRACTION
- Current pain point: [extract from content]
- Related pain points this format could address: [list 5 alternatives]

Return as structured JSON with this exact schema:
{
  "format_analysis": {
    "hook_type": "string",
    "emotional_arc": "string",
    "target_pain_point": "string",
    "conversion_strategy": "string"
  },
  "tone_analysis": {
    "description": "string",
    "key_markers": ["string"]
  },
  "slide_analysis": [
    {
      "slide_number": 1,
      "role": "string",
      "what_makes_it_work": "string",
      "risk_if_varied": "LOW|MEDIUM|HIGH",
      "variation_approaches": "string"
    }
  ],
  "pain_point_alternatives": ["string"]
}

Only return the JSON, no other text.`;

export const COMPILE_SYSTEM_PROMPT = `You are a prompt engineer specializing in content variation systems. 

Given:
- Slide content and roles
- User's KEEP/VARY decisions for each slide
- Pain point (original and new if changed)
- Tone setting (either matched from original or custom)
- Number of variations requested
- Brand to maintain

Compile a production-ready prompt that will generate copy variations.

The compiled prompt must:
1. Clearly mark which slides are FIXED (with exact text to keep)
2. Provide detailed instructions for VARY slides
3. Include the tone instruction (matched or custom)
4. Specify output format
5. Include the variation count
6. If pain point changed, include instructions for adapting language

Output ONLY the compiled prompt, ready to copy-paste. Do not include any preamble or explanation.`;

export async function extractSlides(images: string[]): Promise<string> {
  const imageContent = images.map((base64, index) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: 'image/png' as const,
      data: base64.replace(/^data:image\/\w+;base64,/, ''),
    },
  }));

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 4096,
    system: EXTRACT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContent,
          {
            type: 'text',
            text: `Please analyze these ${images.length} TikTok slideshow images and extract the text from each.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

export async function analyzeSlides(slidesJson: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 4096,
    system: ANALYZE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this TikTok slideshow content:\n\n${slidesJson}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

export async function compilePrompt(configJson: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-5-20251101',
    max_tokens: 4096,
    system: COMPILE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Compile a production-ready prompt based on this configuration:\n\n${configJson}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

export default anthropic;
