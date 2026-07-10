import type {
  Child,
  Topic,
  GeneratedWorksheetContent,
  WorksheetActivity,
} from '../../../shared/types.js';

export interface GenerateWorksheetInput {
  child: Child;
  theme: string;
  durationMinutes: number;
  topics: Topic[];
}

export interface AssessScanInput {
  child: Child;
  theme: string;
  topics: Topic[];
  activities: WorksheetActivity[];
  imageBase64: string;
  mimeType: string;
}

export interface AssessScanOutput {
  results: Array<{
    topicId: string;
    score: number;
    evidence: string[];
    recommendation: 'advance' | 'practice' | 'refresh';
  }>;
  summary: string;
}

export interface WorksheetGenerator {
  generate(input: GenerateWorksheetInput): Promise<GeneratedWorksheetContent>;
}

export interface ScanAssessor {
  assess(input: AssessScanInput): Promise<AssessScanOutput>;
}
