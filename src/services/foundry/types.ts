import { CandidateContext, Question, Answer, AnswerEvaluation, FeedbackReportData } from '@/types/interview';

export interface NextQuestionDecision {
  action: 'follow_up' | 'new_topic' | 'conclude';
  questionText: string;
  topic: string;
  type: 'intro' | 'technical' | 'behavioural' | 'follow_up' | 'closing';
  difficulty?: 'easy' | 'medium' | 'hard';
  evaluation?: AnswerEvaluation;
}

export interface IFoundryService {
  /**
   * Generates opening introduction and first question based on role, type, and resume
   */
  generateIntroductionAndOpening(context: CandidateContext): Promise<{ introText: string; firstQuestion: Question }>;

  /**
   * Evaluates the candidate's answer and determines the next question or follow-up
   */
  evaluateAndGenerateNext(
    context: CandidateContext,
    previousQuestions: Question[],
    previousAnswers: Answer[],
    latestAnswer: Answer,
    currentQuestion: Question,
    elapsedSeconds?: number
  ): Promise<NextQuestionDecision>;

  /**
   * Generates the comprehensive final feedback report
   */
  generateFeedbackReport(
    context: CandidateContext,
    questions: Question[],
    answers: Answer[]
  ): Promise<FeedbackReportData>;

  isRealAzure(): boolean;
}
