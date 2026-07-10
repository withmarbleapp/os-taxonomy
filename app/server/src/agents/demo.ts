import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  GeneratedWorksheetContent,
  WorksheetActivity,
} from '../../../shared/types.js';
import type {
  AssessScanInput,
  AssessScanOutput,
  GenerateWorksheetInput,
  ScanAssessor,
  WorksheetGenerator,
} from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../../../fixtures');

function pickThemeKey(theme: string): string {
  const t = theme.toLowerCase();
  if (t.includes('unicorn')) return 'unicorns';
  if (t.includes('pon')) return 'ponies';
  if (t.includes('sea') || t.includes('ocean') || t.includes('fish')) return 'sea-life';
  return 'sea-life';
}

function loadMockGenerator(themeKey: string): GeneratedWorksheetContent {
  const file = path.join(FIXTURES, 'mocks', `generate-${themeKey}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as GeneratedWorksheetContent;
  }
  return JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'mocks', 'generate-sea-life.json'), 'utf8'),
  ) as GeneratedWorksheetContent;
}

function loadMockAssessor(themeKey: string): AssessScanOutput {
  const file = path.join(FIXTURES, 'mocks', `assess-${themeKey}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as AssessScanOutput;
  }
  return JSON.parse(
    fs.readFileSync(path.join(FIXTURES, 'mocks', 'assess-sea-life.json'), 'utf8'),
  ) as AssessScanOutput;
}

function adaptActivities(
  template: GeneratedWorksheetContent,
  input: GenerateWorksheetInput,
): GeneratedWorksheetContent {
  const activities: WorksheetActivity[] = input.topics.map((topic, i) => {
    const base = template.activities[i % template.activities.length];
    return {
      topicId: topic.id,
      title: base?.title ?? `${topic.name} adventure`,
      instructions:
        base?.instructions ??
        `Explore ${topic.name} through a ${input.theme} adventure.`,
      prompt:
        base?.prompt ??
        (topic.assessmentPrompt
          ? topic.assessmentPrompt.replaceAll('{{name}}', input.child.name)
          : `Show what you know about ${topic.name}.`),
      answerSpaceHint: base?.answerSpaceHint ?? 'Write or draw your answer in the box.',
      illustrationHint:
        base?.illustrationHint ?? `A gentle ${input.theme} illustration for ${topic.name}`,
    };
  });

  return {
    title: template.title.replaceAll('{{name}}', input.child.name),
    intro: template.intro
      .replaceAll('{{name}}', input.child.name)
      .replaceAll('{{theme}}', input.theme),
    theme: input.theme,
    activities,
    closingNote: template.closingNote.replaceAll('{{name}}', input.child.name),
  };
}

export class DemoWorksheetGenerator implements WorksheetGenerator {
  async generate(input: GenerateWorksheetInput): Promise<GeneratedWorksheetContent> {
    const themeKey = pickThemeKey(input.theme);
    const template = loadMockGenerator(themeKey);
    return adaptActivities(template, input);
  }
}

export class DemoScanAssessor implements ScanAssessor {
  async assess(input: AssessScanInput): Promise<AssessScanOutput> {
    const themeKey = pickThemeKey(input.theme);
    const template = loadMockAssessor(themeKey);
    const results = input.topics.map((topic, i) => {
      const base = template.results[i % template.results.length];
      return {
        topicId: topic.id,
        score: base?.score ?? 0.75,
        evidence: base?.evidence ?? [`Demo assessment for ${topic.name}`],
        recommendation: base?.recommendation ?? ('practice' as const),
      };
    });

    return {
      results,
      summary: template.summary
        .replaceAll('{{name}}', input.child.name)
        .replaceAll('{{theme}}', input.theme),
    };
  }
}
