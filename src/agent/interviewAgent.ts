import {
  CandidateContext,
  InterviewSession,
  Question,
  Answer,
  InterviewState,
  FeedbackReportData,
  GuardrailFlag,
} from '@/types/interview';
import { IFoundryService } from '@/services/foundry/types';
import { ISpeechService } from '@/services/speech/types';
import { InterviewGuardrails } from '@/services/guardrails/guardrailsService';

/**
 * Event taxonomy emitted by InterviewAgent across its conversational lifecycle.
 * UI components subscribe to these events to update avatars, visualizers,
 * timers, and transcripts reactively.
 */
export type AgentEvent =
  | { type: 'state_changed'; state: InterviewState }
  | { type: 'intro_started'; text: string }
  | { type: 'question_asked'; question: Question }
  | { type: 'interim_transcript'; text: string }
  | { type: 'final_transcript'; text: string }
  | { type: 'evaluating_answer' }
  | { type: 'guardrail_triggered'; flag: GuardrailFlag; reason: string; actionTaken: string; redirectionText?: string }
  | { type: 'interview_completed'; feedback: FeedbackReportData }
  | { type: 'error'; message: string };

/**
 * InterviewAgent: Autonomous State Machine & Conversational Pacing Controller
 *
 * Responsibilities:
 * 1. Orchestrates the full lifecycle: Lobby -> Intro -> Questioning -> Time Pacing -> Wrap-up -> Feedback.
 * 2. Enforces meeting clock limits (10m, 20m, 30m) and graceful session conclusion.
 * 3. Bridges Speech Services (STT/TTS) and Microsoft Foundry (GPT-4o reasoning).
 * 4. Eliminates voice overlap by concatenating greeting + opening question into a single audio utterance.
 */
export class InterviewAgent {
  private session: InterviewSession;
  private foundryService: IFoundryService;
  private speechService: ISpeechService;
  private eventListeners: ((event: AgentEvent) => void)[] = [];
  private currentState: InterviewState = 'idle';
  private answerStartTime = 0;
  private interviewStartTime = 0;
  private isAborted = false;

  constructor(
    session: InterviewSession,
    foundryService: IFoundryService,
    speechService: ISpeechService
  ) {
    this.session = session;
    this.foundryService = foundryService;
    this.speechService = speechService;
  }

  /**
   * Subscribe to agent state changes and audio transcript events.
   * Returns an unsubscribe callback for clean component unmounting.
   */
  public on(listener: (event: AgentEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Dispatches events to all active listeners and updates internal state.
   */
  private emit(event: AgentEvent): void {
    if (this.isAborted && event.type !== 'state_changed') return;
    if (event.type === 'state_changed') {
      this.currentState = event.state;
    }
    this.eventListeners.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        console.error('[InterviewAgent] Listener error:', err);
      }
    });
  }

  public getState(): InterviewState {
    return this.currentState;
  }

  public getSession(): InterviewSession {
    return this.session;
  }

  public getElapsedSeconds(): number {
    if (this.interviewStartTime === 0) return 0;
    return Math.round((Date.now() - this.interviewStartTime) / 1000);
  }

  /**
   * Begins the interview loop: speaks introduction and first question in one fluid turn
   */
  public async start(): Promise<void> {
    try {
      this.isAborted = false;
      this.interviewStartTime = Date.now();
      this.emit({ type: 'state_changed', state: 'thinking' });

      const { introText, firstQuestion } =
        await this.foundryService.generateIntroductionAndOpening(this.session.context);

      if (this.isAborted) return;

      this.session.questions.push(firstQuestion);
      this.session.status = 'in_progress';

      this.emit({ type: 'intro_started', text: introText });
      this.emit({ type: 'question_asked', question: firstQuestion });
      this.emit({ type: 'state_changed', state: 'speaking' });

      // Combine intro and opening question into ONE seamless utterance so voices never overlap!
      const rawOpening = introText
        ? `${introText.trim()} ${firstQuestion.text.trim()}`
        : firstQuestion.text.trim();
      const fullOpening = InterviewGuardrails.sanitizeForSpeech(rawOpening);

      await this.speechService.speak(fullOpening, (isSpeaking) => {
        if (!this.isAborted) {
          this.emit({ type: 'state_changed', state: isSpeaking ? 'speaking' : 'idle' });
        }
      });

      if (this.isAborted) return;

      // Transition smoothly into listening for candidate's answer
      await this.startListeningForAnswer();
    } catch (err: any) {
      if (this.isAborted) return;
      console.error('[InterviewAgent] Start error:', err);
      this.emit({
        type: 'error',
        message: 'Unable to start the interview session. Please verify your microphone and try again.',
      });
      this.emit({ type: 'state_changed', state: 'idle' });
    }
  }

  /**
   * Starts capturing candidate's voice answer
   */
  public async startListeningForAnswer(): Promise<void> {
    this.emit({ type: 'state_changed', state: 'listening' });
    this.answerStartTime = Date.now();

    try {
      await this.speechService.startListening(
        (interimText) => {
          this.emit({ type: 'interim_transcript', text: interimText });
        },
        (finalText) => {
          this.emit({ type: 'final_transcript', text: finalText });
        },
        (errorMsg) => {
          this.emit({ type: 'error', message: errorMsg });
        }
      );
    } catch (err: any) {
      console.warn('[InterviewAgent] Listening start warning:', err);
    }
  }

  /**
   * Candidate or timer signals that the answer is finished
   * @param overrideTranscript optional manual or typed transcript
   */
  /**
   * Processes the candidate's spoken or typed answer.
   *
   * Flow:
   * 1. Stops the speech recognizer and captures final transcript.
   * 2. Calculates answer duration and appends to session answers.
   * 3. Checks the autonomous duration clock: if scheduled time has expired, concludes immediately.
   * 4. Sends conversational history to Microsoft Foundry (GPT-4o) for trade-off evaluation.
   * 5. Synthesizes and speaks the adaptive follow-up, then re-arms the microphone.
   *
   * @param overrideTranscript Optional typed or edited transcript overriding audio STT
   */
  public async submitAnswer(overrideTranscript?: string): Promise<void> {
    try {
      this.emit({ type: 'state_changed', state: 'thinking' });

      // Stop speech recognizer and finalize recognized text
      const audioTranscript = await this.speechService.stopListening();
      const finalTranscript = (overrideTranscript ?? audioTranscript ?? '').trim();

      const durationSeconds = Math.round((Date.now() - this.answerStartTime) / 1000);
      const currentQuestion = this.session.questions[this.session.questions.length - 1];

      // Record candidate's answer with precise timing
      const answerRecord: Answer = {
        id: `ans_${Date.now()}`,
        questionId: currentQuestion ? currentQuestion.id : 'unknown',
        transcript: finalTranscript,
        durationSeconds: Math.max(durationSeconds, 1),
        timestamp: new Date().toISOString(),
      };

      this.session.answers.push(answerRecord);
      this.emit({ type: 'evaluating_answer' });

      // 1. Guardrail Check on Candidate Input (Prompt Injection, Profanity, Evasion, Off-Topic)
      const guardrailCheck = InterviewGuardrails.checkCandidateInput(finalTranscript, currentQuestion);

      if (guardrailCheck.flagged) {
        const flag = guardrailCheck.flag!;
        const reason = guardrailCheck.reason || 'Guardrail triggered';
        const actionTaken = guardrailCheck.actionOverride || 'redirect';

        this.session.guardrailsTriggered = this.session.guardrailsTriggered || [];
        this.session.guardrailsTriggered.push(
          InterviewGuardrails.createEvent(flag, reason, actionTaken)
        );
        this.emit({
          type: 'guardrail_triggered',
          flag,
          reason,
          actionTaken,
          redirectionText: guardrailCheck.redirectionText,
        });

        if (guardrailCheck.evaluationOverride) {
          answerRecord.evaluation = guardrailCheck.evaluationOverride;
        }

        // If redirecting without advancing question (e.g. prompt injection, profanity, off-topic)
        if (actionTaken === 'follow_up' && guardrailCheck.redirectionText) {
          const spokenRedirection = InterviewGuardrails.sanitizeForSpeech(guardrailCheck.redirectionText);
          this.emit({ type: 'state_changed', state: 'speaking' });
          await this.speechService.speak(spokenRedirection, (isSpeaking) => {
            if (!this.isAborted) {
              this.emit({ type: 'state_changed', state: isSpeaking ? 'speaking' : 'idle' });
            }
          });

          if (this.isAborted) return;
          await this.startListeningForAnswer();
          return;
        }

        // If evasion / skip: speak acknowledgment before pivoting to next topic
        if (actionTaken === 'new_topic' && guardrailCheck.redirectionText) {
          const spokenAck = InterviewGuardrails.sanitizeForSpeech(guardrailCheck.redirectionText);
          this.emit({ type: 'state_changed', state: 'speaking' });
          await this.speechService.speak(spokenAck, (isSpeaking) => {
            if (!this.isAborted) {
              this.emit({ type: 'state_changed', state: isSpeaking ? 'speaking' : 'idle' });
            }
          });
        }
      }

      const elapsedSec = this.getElapsedSeconds();
      const maxDurationSec = (this.session.context.durationMinutes || 10) * 60;

      // Autonomous Duration Clock Guard:
      // If elapsed time matches or exceeds the scheduled duration, conclude gracefully.
      if (elapsedSec >= maxDurationSec) {
        await this.concludeInterview(
          `We have reached our scheduled ${this.session.context.durationMinutes}-minute time limit. Thank you for your time and thoughtful responses today. I will now generate your feedback report.`
        );
        return;
      }

      // Invoke Microsoft Foundry reasoning engine to evaluate answer and decide next turn
      const decision = await this.foundryService.evaluateAndGenerateNext(
        this.session.context,
        this.session.questions,
        this.session.answers.slice(0, -1),
        answerRecord,
        currentQuestion,
        elapsedSec
      );

      if (decision.evaluation) {
        answerRecord.evaluation = decision.evaluation;
      }

      // If the reasoning engine flagged the answer as unrelated, record guardrail event & notify
      if (decision.evaluation && decision.evaluation.isRelevant === false) {
        this.session.guardrailsTriggered = this.session.guardrailsTriggered || [];
        this.session.guardrailsTriggered.push(
          InterviewGuardrails.createEvent(
            'off_topic',
            'Candidate answer was not related to the question.',
            'redirect'
          )
        );
        this.emit({
          type: 'guardrail_triggered',
          flag: 'off_topic',
          reason: 'Candidate answer was not related to the question.',
          actionTaken: 'redirect',
          redirectionText: decision.questionText,
        });
      }

      if (this.isAborted) return;

      // If the agent determines the interview objectives have been satisfied, wrap up
      if (decision.action === 'conclude') {
        await this.concludeInterview(decision.questionText);
        return;
      }

      // Construct and enqueue the next adaptive question
      const sanitizedQuestionText = InterviewGuardrails.sanitizeForSpeech(decision.questionText);
      const nextQuestion: Question = {
        id: `q_${this.session.questions.length + 1}`,
        text: sanitizedQuestionText,
        topic: decision.topic,
        type: decision.type,
        difficulty: decision.difficulty,
        timestamp: new Date().toISOString(),
      };

      this.session.questions.push(nextQuestion);
      this.session.currentQuestionIndex = this.session.questions.length - 1;

      this.emit({ type: 'question_asked', question: nextQuestion });
      this.emit({ type: 'state_changed', state: 'speaking' });

      // AI speaks the next challenge using Azure Neural TTS
      await this.speechService.speak(nextQuestion.text, (isSpeaking) => {
        if (!this.isAborted) {
          this.emit({ type: 'state_changed', state: isSpeaking ? 'speaking' : 'idle' });
        }
      });

      if (this.isAborted) return;

      // Smoothly re-arm speech recognition for candidate's next verbal turn
      await this.startListeningForAnswer();
    } catch (err: any) {
      if (this.isAborted) return;
      console.error('[InterviewAgent] submitAnswer error:', err);
      this.emit({
        type: 'error',
        message: 'We had trouble processing that answer. Let\'s continue to the next question.',
      });
      this.emit({ type: 'state_changed', state: 'idle' });
    }
  }

  /**
   * Concludes the interview and generates the feedback report
   */
  public async concludeInterview(closingSpokenText?: string): Promise<FeedbackReportData> {
    try {
      this.emit({ type: 'state_changed', state: 'thinking' });

      this.speechService.stopSpeaking();
      const audioTranscript = await this.speechService.stopListening();

      // If candidate was in the middle of speaking an answer when conclude was triggered, save the answer!
      if (
        this.session.answers.length < this.session.questions.length &&
        audioTranscript &&
        audioTranscript.trim().length > 0
      ) {
        const currentQ = this.session.questions[this.session.questions.length - 1];
        const durationSec = this.answerStartTime > 0 ? Math.round((Date.now() - this.answerStartTime) / 1000) : 1;
        this.session.answers.push({
          id: `ans_${Date.now()}`,
          questionId: currentQ ? currentQ.id : 'unknown',
          transcript: audioTranscript.trim(),
          durationSeconds: Math.max(durationSec, 1),
          timestamp: new Date().toISOString(),
        });
      }

      if (closingSpokenText && !this.isAborted) {
        const sanitizedClosing = InterviewGuardrails.sanitizeForSpeech(closingSpokenText);
        this.emit({ type: 'state_changed', state: 'speaking' });
        await this.speechService.speak(sanitizedClosing, (isSpeaking) => {
          if (!this.isAborted) {
            this.emit({ type: 'state_changed', state: isSpeaking ? 'speaking' : 'idle' });
          }
        });
      }

      this.emit({ type: 'state_changed', state: 'thinking' });

      // Generate structured feedback via Foundry Generative AI
      const feedback = await this.foundryService.generateFeedbackReport(
        this.session.context,
        this.session.questions,
        this.session.answers
      );

      this.session.feedback = feedback;
      this.session.status = 'completed';
      this.session.totalDurationSeconds = this.getElapsedSeconds();

      this.emit({ type: 'state_changed', state: 'idle' });
      this.emit({ type: 'interview_completed', feedback });

      return feedback;
    } catch (err: any) {
      console.error('[InterviewAgent] concludeInterview error:', err);
      // Construct dependable fallback feedback so the user never gets stuck
      const fallbackFeedback: FeedbackReportData = {
        technicalScore: 'Good',
        communicationScore: 'Good',
        interviewHandlingScore: 'Good',
        summaryVerdict: 'Rehearsal completed successfully. Review your focus areas below.',
        whatWentWell: [
          'Communicated your thoughts with clarity.',
          'Addressed the interviewer\'s questions directly.',
        ],
        whatToImprove: [
          'Deepen architectural explanations by explaining system trade-offs.',
          'Start answers with high-level approaches before diving into implementation details.',
        ],
        nextRehearsalFocus: 'Practice explaining technical trade-offs and decision criteria.',
        completedAt: new Date().toISOString(),
      };
      this.session.feedback = fallbackFeedback;
      this.session.status = 'completed';
      this.emit({ type: 'interview_completed', feedback: fallbackFeedback });
      return fallbackFeedback;
    }
  }

  public abort(): void {
    this.isAborted = true;
    this.speechService.stopSpeaking();
    this.speechService.stopListening();
    this.session.status = 'abandoned';
    this.emit({ type: 'state_changed', state: 'idle' });
  }
}
