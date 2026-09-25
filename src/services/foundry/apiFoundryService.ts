import {
  CandidateContext,
  Question,
  Answer,
  FeedbackReportData,
} from '@/types/interview';
import { IFoundryService, NextQuestionDecision } from './types';
import { sessionStore } from '@/services/storage/sessionStore';
import { MockFoundryService } from './mockFoundryService';

export class ApiFoundryService implements IFoundryService {
  private isReal: boolean = true;
  private fallbackService = new MockFoundryService();

  constructor() {
    this.checkIsReal();
  }

  private checkIsReal(): void {
    const prefs = sessionStore.getPreferences();
    if (prefs.forceDemoMode) {
      this.isReal = false;
      return;
    }
    this.isReal = true;
  }

  isRealAzure(): boolean {
    return this.isReal;
  }

  private getAuthHeaders(): Record<string, string> {
    const prefs = sessionStore.getPreferences();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (prefs.azureOpenAiEndpoint) {
      headers['x-foundry-endpoint'] = prefs.azureOpenAiEndpoint;
    }
    if (prefs.azureOpenAiKey) {
      headers['x-foundry-key'] = prefs.azureOpenAiKey;
    }
    if (prefs.azureOpenAiModel) {
      headers['x-foundry-model'] = prefs.azureOpenAiModel;
    }
    return headers;
  }

  async generateIntroductionAndOpening(
    context: CandidateContext
  ): Promise<{ introText: string; firstQuestion: Question }> {
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(context),
      });

      if (!res.ok) {
        console.warn(`[ApiFoundryService] /api/interviews returned ${res.status}, falling back`);
        return this.fallbackService.generateIntroductionAndOpening(context);
      }

      const data = await res.json();
      this.isReal = !data.isDemoMode;
      return {
        introText: data.introText,
        firstQuestion: data.firstQuestion,
      };
    } catch (err) {
      console.warn('[ApiFoundryService] Opening request failed, falling back to local reasoning:', err);
      return this.fallbackService.generateIntroductionAndOpening(context);
    }
  }

  async evaluateAndGenerateNext(
    context: CandidateContext,
    previousQuestions: Question[],
    previousAnswers: Answer[],
    latestAnswer: Answer,
    currentQuestion: Question,
    elapsedSeconds?: number
  ): Promise<NextQuestionDecision> {
    try {
      const res = await fetch('/api/interviews/session/answer', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          context,
          previousQuestions,
          previousAnswers,
          latestAnswer,
          currentQuestion,
          elapsedSeconds,
        }),
      });

      if (!res.ok) {
        console.warn(`[ApiFoundryService] /api/interviews/session/answer returned ${res.status}, falling back`);
        return this.fallbackService.evaluateAndGenerateNext(
          context,
          previousQuestions,
          previousAnswers,
          latestAnswer,
          currentQuestion,
          elapsedSeconds
        );
      }

      const decision = await res.json();
      return decision;
    } catch (err) {
      console.warn('[ApiFoundryService] Answer evaluation failed, falling back to local reasoning:', err);
      return this.fallbackService.evaluateAndGenerateNext(
        context,
        previousQuestions,
        previousAnswers,
        latestAnswer,
        currentQuestion,
        elapsedSeconds
      );
    }
  }

  async generateFeedbackReport(
    context: CandidateContext,
    questions: Question[],
    answers: Answer[]
  ): Promise<FeedbackReportData> {
    try {
      const res = await fetch('/api/interviews/session/finish', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          context,
          questions,
          answers,
        }),
      });

      if (!res.ok) {
        console.warn(`[ApiFoundryService] /api/interviews/session/finish returned ${res.status}, falling back`);
        return this.fallbackService.generateFeedbackReport(context, questions, answers);
      }

      const data = await res.json();
      return data.feedback;
    } catch (err) {
      console.warn('[ApiFoundryService] Feedback generation failed, falling back to local report:', err);
      return this.fallbackService.generateFeedbackReport(context, questions, answers);
    }
  }
}
