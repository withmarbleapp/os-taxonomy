import Anthropic from '@anthropic-ai/sdk';
import type { GeneratedWorksheetContent } from '../../../shared/types.js';
import type { GenerateWorksheetInput, WorksheetGenerator } from './types.js';
import { getConfig } from '../config.js';

export class ClaudeWorksheetGenerator implements WorksheetGenerator {
  private client: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey ?? getConfig().anthropicApiKey;
    if (!key) throw new Error('ANTHROPIC_API_KEY is required when DEMO_MODE is false');
    this.client = new Anthropic({ apiKey: key });
  }

  async generate(input: GenerateWorksheetInput): Promise<GeneratedWorksheetContent> {
    const topicBriefs = input.topics.map((t) => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      domain: t.domain,
      description: t.description,
      evidence: t.evidence,
      assessmentPrompt: t.assessmentPrompt?.replaceAll('{{name}}', input.child.name),
    }));

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are an expert UK primary school teacher creating a beautiful printable worksheet.

Child: ${input.child.name}, age ${input.child.age}
Theme: ${input.theme}
Duration: about ${input.durationMinutes} minutes

Create themed activities for these micro-topics (use each topic exactly once):
${JSON.stringify(topicBriefs, null, 2)}

Return ONLY valid JSON matching this shape:
{
  "title": string,
  "intro": string (warm, 1-2 sentences for the child),
  "theme": string,
  "activities": [
    {
      "topicId": string (must match input ids),
      "title": string,
      "instructions": string,
      "prompt": string (the actual question/task),
      "answerSpaceHint": string,
      "illustrationHint": string (for decorative margin art)
    }
  ],
  "closingNote": string (encouraging note for parents/child)
}

Make it imaginative, age-appropriate, and tightly tied to the theme "${input.theme}".
UK English spelling. No markdown fences.`,
        },
      ],
    });

    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as GeneratedWorksheetContent;
  }
}
