import OpenAI from 'openai';
import type { AssessScanInput, AssessScanOutput, ScanAssessor } from './types.js';
import { getConfig } from '../config.js';

export class GptScanAssessor implements ScanAssessor {
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey ?? getConfig().openaiApiKey;
    if (!key) throw new Error('OPENAI_API_KEY is required when DEMO_MODE is false');
    this.client = new OpenAI({ apiKey: key });
  }

  async assess(input: AssessScanInput): Promise<AssessScanOutput> {
    const topicBriefs = input.topics.map((t) => ({
      id: t.id,
      name: t.name,
      evidence: t.evidence,
      assessmentPrompt: t.assessmentPrompt?.replaceAll('{{name}}', input.child.name),
    }));

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert UK primary teacher assessing a scanned completed worksheet. Be kind, precise, and pedagogical. Return JSON only.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Child: ${input.child.name}, age ${input.child.age}
Theme: ${input.theme}

Topics and mastery evidence to assess:
${JSON.stringify(topicBriefs, null, 2)}

Activities on the sheet:
${JSON.stringify(input.activities, null, 2)}

Look at the scan. For each topic return score 0-1, short evidence bullets, and recommendation:
- advance (strong understanding)
- practice (partial / needs more work)
- refresh (confused or forgotten prior knowledge)

JSON shape:
{
  "results": [
    { "topicId": string, "score": number, "evidence": string[], "recommendation": "advance"|"practice"|"refresh" }
  ],
  "summary": string (plain English for a non-technical parent)
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${input.mimeType};base64,${input.imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    return JSON.parse(text) as AssessScanOutput;
  }
}
