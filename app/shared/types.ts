export type TopicType =
  | 'CONCEPTUAL'
  | 'PROCEDURAL'
  | 'REPRESENTATIONAL'
  | 'LANGUAGE'
  | 'META';

export type MasteryStatus =
  | 'not_started'
  | 'introduced'
  | 'practicing'
  | 'mastered'
  | 'needs_refresh';

export type WorksheetStatus =
  | 'draft'
  | 'ready'
  | 'printed'
  | 'submitted'
  | 'assessed';

export type AssessmentRecommendation = 'advance' | 'practice' | 'refresh';

export type DependencyStrength = 'hard' | 'soft';

export interface Topic {
  id: string;
  type: TopicType;
  subject: string;
  domain: string | null;
  name: string | null;
  description: string;
  ageRangeStart: number | null;
  ageRangeEnd: number | null;
  centrality: number | null;
  evidence: string[];
  assessmentPrompt: string | null;
  standards: string[];
}

export interface Dependency {
  topicId: string;
  prerequisiteId: string;
  strength: DependencyStrength;
  reason: string;
}

export interface Cluster {
  subject: string;
  domain: string;
  ageRangeStart: number;
  summary: string;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  /** Derived from dateOfBirth at read time. */
  age: number;
  /** Derived England/Wales year group from dateOfBirth. */
  yearGroup: string | null;
  interests: string[];
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopicMastery {
  childId: string;
  topicId: string;
  status: MasteryStatus;
  confidence: number;
  lastAssessedAt: string | null;
  notes: string | null;
}

export interface Worksheet {
  id: string;
  childId: string;
  theme: string;
  durationMinutes: number;
  subjectFocus: string | null;
  domainFocus: string | null;
  topicIds: string[];
  title: string;
  pdfPath: string | null;
  contentJson: string;
  status: WorksheetStatus;
  createdAt: string;
}

export interface AssessmentResult {
  topicId: string;
  score: number;
  evidence: string[];
  recommendation: AssessmentRecommendation;
}

export interface Assessment {
  id: string;
  worksheetId: string;
  childId: string;
  scanPath: string;
  results: AssessmentResult[];
  summary: string;
  createdAt: string;
}

export interface WorksheetActivity {
  topicId: string;
  title: string;
  instructions: string;
  prompt: string;
  answerSpaceHint: string;
  illustrationHint: string;
}

export interface GeneratedWorksheetContent {
  title: string;
  intro: string;
  theme: string;
  activities: WorksheetActivity[];
  closingNote: string;
}

export interface DurationOption {
  minutes: number;
  topicCount: number;
  label: string;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { minutes: 15, topicCount: 1, label: '15 minutes' },
  { minutes: 20, topicCount: 2, label: '20 minutes' },
  { minutes: 30, topicCount: 3, label: '30 minutes' },
  { minutes: 45, topicCount: 4, label: '45 minutes' },
];

export type RagLevel = 'red' | 'amber' | 'green';

export interface RagCounts {
  red: number;
  amber: number;
  green: number;
}

export interface ProgressSummary {
  childId: string;
  totalTracked: number;
  mastered: number;
  practicing: number;
  needsRefresh: number;
  introduced: number;
  ragCounts: RagCounts;
  bySubject: Record<
    string,
    {
      mastered: number;
      practicing: number;
      needsRefresh: number;
      introduced: number;
      total: number;
    }
  >;
  story: string;
  suggestedTheme: string | null;
  frontier: LearningPathFrontier | null;
}

export interface LearningPathTopic {
  id: string;
  name: string | null;
  description: string;
  evidence: string[];
  rag: RagLevel;
  status: MasteryStatus;
  centrality: number | null;
  subject: string;
  domain: string;
}

export interface LearningPathEdge {
  from: string;
  to: string;
}

export interface LearningPathDomain {
  domain: string;
  summary: string | null;
  topics: LearningPathTopic[];
  edges: LearningPathEdge[];
}

export interface LearningPathSubject {
  subject: string;
  domains: LearningPathDomain[];
  ragCounts: RagCounts;
}

export interface LearningPathFrontier {
  subject: string;
  domain: string;
  topicId: string;
  topicName: string | null;
}

export interface LearningPath {
  childId: string;
  age: number;
  ragCounts: RagCounts;
  subjects: LearningPathSubject[];
  frontier: LearningPathFrontier | null;
  constellation: LearningPathTopic[];
}

export interface AppSettings {
  demoMode: boolean;
  anthropicConfigured: boolean;
  openaiConfigured: boolean;
}
