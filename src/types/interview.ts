export type InterviewType = 'technical' | 'behavioural' | 'mixed';

export type InterviewDuration = 10 | 20 | 30; // minutes

export type InterviewState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type QualitativeScore = 'Strong' | 'Good' | 'Needs Improvement';

export interface CandidateContext {
  role: string;
  company?: string;
  interviewType: InterviewType;
  durationMinutes: InterviewDuration;
  resumeText?: string;
  focusArea?: string; // Seeded from previous rehearsal weakness if applicable
  targetQuestions?: number; // Override question count if specified
  isSampleDemo?: boolean; // Deprecated, kept for backward compatibility
}

export type GuardrailFlag =
  | 'prompt_injection'
  | 'profanity'
  | 'off_topic'
  | 'evasion'
  | 'topic_loop_prevented'
  | 'pacing_enforced';

export interface GuardrailEvent {
  id: string;
  timestamp: string;
  flag: GuardrailFlag;
  reason: string;
  actionTaken: string;
}

export interface Question {
  id: string;
  text: string;
  topic: string;
  type: 'intro' | 'technical' | 'behavioural' | 'follow_up' | 'closing';
  difficulty?: 'easy' | 'medium' | 'hard';
  timestamp: string;
}

export interface Answer {
  id: string;
  questionId: string;
  transcript: string;
  durationSeconds: number;
  timestamp: string;
  evaluation?: AnswerEvaluation;
}

export interface AnswerEvaluation {
  understoodIntent: boolean;
  isRelevant?: boolean;
  technicalAccuracy?: QualitativeScore;
  clarity: QualitativeScore;
  extractedKeyPoints: string[];
  suggestedFollowUpTopic?: string;
  requiresFollowUp: boolean;
  reasoningNote?: string;
  guardrailStatus?: 'passed' | 'redirected' | 'pivoted';
  guardrailNote?: string;
}

export interface FeedbackReportData {
  technicalScore: QualitativeScore;
  communicationScore: QualitativeScore;
  interviewHandlingScore: QualitativeScore;
  summaryVerdict: string;
  whatWentWell: string[];
  whatToImprove: string[];
  nextRehearsalFocus: string; // Actionable priority for "Rehearse Again"
  completedAt: string;
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  context: CandidateContext;
  status: 'lobby' | 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  questions: Question[];
  answers: Answer[];
  feedback?: FeedbackReportData;
  totalDurationSeconds: number;
  isDemoMode: boolean;
  guardrailsTriggered?: GuardrailEvent[];
}

export interface UserPreferences {
  userName: string;
  voiceName: string;
  speechRate: number;
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;
  enableCamera: boolean;
  forceDemoMode: boolean;
  azureOpenAiKey?: string;
  azureOpenAiEndpoint?: string;
  azureOpenAiModel?: string;
  azureSpeechKey?: string;
  azureSpeechRegion?: string;
}
