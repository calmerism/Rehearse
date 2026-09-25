import {
  AnswerEvaluation,
  CandidateContext,
  GuardrailEvent,
  GuardrailFlag,
  Question,
} from '@/types/interview';
import { NextQuestionDecision } from '@/services/foundry/types';

export interface GuardrailCheckResult {
  flagged: boolean;
  flag?: GuardrailFlag;
  reason?: string;
  redirectionText?: string;
  actionOverride?: 'follow_up' | 'new_topic' | 'conclude';
  evaluationOverride?: AnswerEvaluation;
}

/**
 * Production-grade Interview Guardrails Engine
 *
 * Implements multi-layered defense in depth:
 * 1. Input Safety: Prompt injection & adversarial attempt interception.
 * 2. Code of Conduct: Profanity & abusive language deflection.
 * 3. Topic Pacing: Evasion, silence, & off-topic redirection without false scoring.
 * 4. Progression & Anti-Looping: Max 1 follow-up enforcement & pillar rotation.
 * 5. Audio Synthesizer Safety: Speech text cleaning to prevent TTS glitches.
 */
export class InterviewGuardrails {
  // Common prompt injection & jailbreak patterns
  private static readonly INJECTION_PATTERNS = [
    /(ignore|disregard|forget|override)\s+(all\s+)?(previous|prior|above|existing\s+)?(instructions|prompts|rules|commands|constraints)/i,
    /(reveal|output|display|show|print|leak)\s+(your\s+|the\s+)?(system\s+prompt|developer\s+instructions|system\s+instructions|hidden\s+rules|system\s+message)/i,
    /(you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as)\s+(a|an|dan|developer|unrestricted|jailbreak|unfiltered)/i,
    /(dan\s+mode|jailbreak|bypass\s+rules|developer\s+mode\s+enabled|unrestricted\s+ai)/i,
    /(give\s+me|award\s+me|score\s+me|say\s+i\s+passed|tell\s+me\s+i\s+passed)\s+(an?\s+)?(100|a\+|perfect|full\s+marks|top\s+grade|passed)?/i,
    /<\|im_start\|>|<\|im_end\|>|\[SYSTEM\]|\[INST\]/i,
  ];

  // Profanity & abusive language patterns (handles stems and inflections)
  private static readonly PROFANITY_PATTERNS = [
    /\b(fuck\w*|shit\w*|bitch\w*|asshole\w*|bastard\w*|dick\w*|cunt\w*|fag\w*|nigger\w*|retard\w*)\b/i,
  ];

  // Evasion, "I don't know", and explicit skip requests
  private static readonly EVASION_PATTERNS = [
    /^(i\s+(really\s+)?don'?t\s+know|i\s+do\s+not\s+know|no\s+idea|i\s+have\s+no\s+idea)[\s.?!]*$/i,
    /^(skip(\s+this)?|pass|next\s+question|can\s+we\s+skip|let'?s\s+move\s+on)(\s+please)?[\s.?!]*$/i,
    /^(i\s+haven'?t\s+worked\s+with\s+that|never\s+used\s+it|not\s+familiar\s+with\s+this)[\s.?!]*$/i,
    /^(i'?m\s+not\s+sure|no\s+clue|dunno)[\s.?!]*$/i,
    /^next\s+question(\s+please)?[\s.?!]*$/i,
  ];

  // Off-topic personal, conversational queries, hobbies, food, weather, entertainment
  private static readonly OFF_TOPIC_PATTERNS = [
    /\b(what'?s\s+the\s+weather|who\s+won\s+the\s+(game|match)|tell\s+me\s+a\s+joke|how\s+old\s+are\s+you|are\s+you\s+human|who\s+made\s+you)\b/i,
    /\b(what\s+is\s+your\s+favorite\s+color|can\s+you\s+write\s+a\s+poem|sing\s+a\s+song|do\s+you\s+have\s+feelings)\b/i,
    /\b(i('m|\s+am)?\s+(eating|cooking|having|making)|i\s+(really\s+)?(love|like)\s+(eating|pizza|burger|sushi|tacos|ice\s+cream|pasta|food))\b/i,
    /\b(did\s+you\s+see\s+the\s+(movie|film|match|game)|watching\s+(netflix|youtube|movies|tv|anime)|play(ing)?\s+(video\s+games|games|minecraft|fortnite|cricket|football|soccer|basketball))\b/i,
    /\b(the\s+weather\s+is\s+(nice|bad|hot|cold|rainy)|it('s|\s+is)\s+raining\s+outside|sunny\s+day\s+today)\b/i,
    /\b(my\s+dog|my\s+cat|my\s+pet|went\s+to\s+the\s+mall|went\s+shopping|bought\s+a\s+new\s+car)\b/i,
    /\b(not\s+related\s+to\s+(the|this)\s+question|off[- ]topic|unrelated\s+but|change\s+the\s+topic|talk\s+about\s+something\s+else)\b/i,
    /\b(i\s+don'?t\s+want\s+to\s+answer\s+(that|this)|can\s+we\s+talk\s+about\s+something\s+else)\b/i,
  ];

  /**
   * Evaluates candidate verbal/typed input against safety, prompt injection,
   * conduct, and pacing guardrails before querying reasoning models.
   */
  public static checkCandidateInput(
    transcript: string,
    currentQuestion?: Question
  ): GuardrailCheckResult {
    const text = transcript.trim();

    // 1. Empty / Inaudible Guardrail
    if (text.length < 2) {
      return {
        flagged: true,
        flag: 'evasion',
        reason: 'Candidate input was empty or inaudible.',
        actionOverride: 'new_topic',
        redirectionText: `I wasn't able to hear your response clearly. Let's move ahead to our next technical topic.`,
        evaluationOverride: {
          understoodIntent: false,
          isRelevant: false,
          clarity: 'Needs Improvement',
          technicalAccuracy: 'Needs Improvement',
          extractedKeyPoints: ['No audible response captured'],
          requiresFollowUp: false,
          reasoningNote: 'Input was empty or inaudible. Guardrail advanced to next topic without stalling.',
          guardrailStatus: 'pivoted',
          guardrailNote: 'Empty input detected. Pacing guardrail advanced to next question.',
        },
      };
    }

    // 2. Prompt Injection & Jailbreak Guardrail
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        const questionPrompt = currentQuestion?.text
          ? `Returning to our question: ${currentQuestion.text}`
          : `Could you walk me through your engineering design choices?`;

        return {
          flagged: true,
          flag: 'prompt_injection',
          reason: 'Detected prompt injection attempt trying to hijack interviewer persona.',
          actionOverride: 'follow_up',
          redirectionText: `I am your technical interviewer today, and our goal is to evaluate your software engineering background and architectural judgment. Let's stay focused. ${questionPrompt}`,
          evaluationOverride: {
            understoodIntent: false,
            isRelevant: false,
            clarity: 'Needs Improvement',
            technicalAccuracy: 'Needs Improvement',
            extractedKeyPoints: ['Adversarial prompt injection attempt intercepted'],
            requiresFollowUp: false,
            reasoningNote: 'Candidate attempted to override system instructions. Intercepted by prompt security guardrail.',
            guardrailStatus: 'redirected',
            guardrailNote: 'Prompt injection blocked. Interviewer maintained persona and redirected candidate.',
          },
        };
      }
    }

    // 3. Profanity & Conduct Guardrail
    for (const pattern of this.PROFANITY_PATTERNS) {
      if (pattern.test(text)) {
        const questionPrompt = currentQuestion?.text
          ? `Let's refocus on the problem: ${currentQuestion.text}`
          : `Let's return to your technical project experience.`;

        return {
          flagged: true,
          flag: 'profanity',
          reason: 'Detected unprofessional or offensive language.',
          actionOverride: 'follow_up',
          redirectionText: `Please keep our discussion professional throughout our technical rehearsal. ${questionPrompt}`,
          evaluationOverride: {
            understoodIntent: false,
            isRelevant: false,
            clarity: 'Needs Improvement',
            technicalAccuracy: 'Needs Improvement',
            extractedKeyPoints: ['Unprofessional language flagged by conduct guardrail'],
            requiresFollowUp: false,
            reasoningNote: 'Unprofessional communication flagged by conduct guardrail.',
            guardrailStatus: 'redirected',
            guardrailNote: 'Conduct guardrail triggered. Professional decorum maintained.',
          },
        };
      }
    }

    // 4. Evasion & Explicit Skip Guardrail
    for (const pattern of this.EVASION_PATTERNS) {
      if (pattern.test(text)) {
        return {
          flagged: true,
          flag: 'evasion',
          reason: 'Candidate indicated unfamiliarity or requested to skip.',
          actionOverride: 'new_topic',
          redirectionText: `That's completely fine. Engineering domains are vast, and it's standard not to have encountered every specific scenario. Let's explore a different technical area.`,
          evaluationOverride: {
            understoodIntent: true,
            isRelevant: true,
            clarity: 'Needs Improvement',
            technicalAccuracy: 'Needs Improvement',
            extractedKeyPoints: ['Candidate skipped or noted unfamiliarity with the topic'],
            requiresFollowUp: false,
            reasoningNote: 'Candidate candidly passed on this question. Guardrail gracefully pivoted to a new technical pillar.',
            guardrailStatus: 'pivoted',
            guardrailNote: 'Skip/Evasion acknowledged. Anti-stalling guardrail advanced to a fresh technical topic.',
          },
        };
      }
    }

    // 5. Off-Topic & Unrelated Answer Guardrail
    const unrelatedCheck = this.isAnswerUnrelated(text, currentQuestion);
    if (unrelatedCheck.isUnrelated) {
      const questionPrompt = currentQuestion?.text
        ? `Let's refocus on the question: ${currentQuestion.text}`
        : `Let's refocus on your technical software engineering background.`;

      return {
        flagged: true,
        flag: 'off_topic',
        reason: unrelatedCheck.reason || 'Candidate response is not related to the question.',
        actionOverride: 'follow_up',
        redirectionText: `That doesn't seem related to the question I asked. As your interviewer, I am here to assess your technical competencies and problem-solving experience. ${questionPrompt}`,
        evaluationOverride: {
          understoodIntent: false,
          isRelevant: false,
          clarity: 'Needs Improvement',
          technicalAccuracy: 'Needs Improvement',
          extractedKeyPoints: ['Off-topic response intercepted by interview guardrails'],
          requiresFollowUp: true,
          reasoningNote: 'Candidate gave an answer unrelated to the interview question. Interviewer redirected back to question.',
          guardrailStatus: 'redirected',
          guardrailNote: 'Off-topic response intercepted. Candidate notified that response is not related to the question.',
        },
      };
    }

    return { flagged: false };
  }

  /**
   * Evaluates whether a candidate's answer is unrelated to the question asked.
   * Detects casual chit-chat, conversational tangents, food/sports/entertainment,
   * or a total disconnect from technical domains.
   */
  public static isAnswerUnrelated(
    transcript: string,
    currentQuestion?: Question
  ): { isUnrelated: boolean; reason?: string } {
    const text = transcript.trim();
    if (!text || text.length < 3) return { isUnrelated: false };

    // 1. Check against explicit off-topic patterns
    for (const pattern of this.OFF_TOPIC_PATTERNS) {
      if (pattern.test(text)) {
        return {
          isUnrelated: true,
          reason: 'Candidate asked unrelated conversational or personal questions.',
        };
      }
    }

    if (!currentQuestion) return { isUnrelated: false };

    const lowerText = text.toLowerCase();

    // General technical and professional keywords that indicate legitimate interview discourse
    const technicalKeywords = [
      'code', 'function', 'class', 'method', 'api', 'endpoint', 'service',
      'database', 'table', 'schema', 'query', 'index', 'sql', 'nosql', 'cache',
      'redis', 'postgres', 'mongo', 'latency', 'scale', 'scaling', 'throughput',
      'system', 'architecture', 'design', 'component', 'state', 'render', 'react',
      'frontend', 'backend', 'server', 'client', 'network', 'http', 'rest', 'grpc',
      'async', 'sync', 'thread', 'concurrency', 'lock', 'mutex', 'transaction',
      'acid', 'event', 'queue', 'kafka', 'message', 'worker', 'job', 'pipeline',
      'test', 'testing', 'deploy', 'docker', 'container', 'kubernetes', 'cloud',
      'aws', 'azure', 'git', 'debug', 'log', 'metric', 'monitor', 'error', 'bug',
      'memory', 'cpu', 'load', 'balancer', 'failover', 'replica', 'partition',
      'sharding', 'lead', 'team', 'stakeholder', 'project', 'agile', 'sprint',
      'deadline', 'trade-off', 'tradeoff', 'approach', 'pattern', 'implemented',
      'built', 'developed', 'optimized', 'resolved', 'problem', 'solution',
      'worked', 'feature', 'library', 'framework', 'challenge', 'decision'
    ];

    const hasAnyTechnicalTerm = technicalKeywords.some((kw) => lowerText.includes(kw));

    // Casual everyday topics that strongly indicate off-topic conversation
    const casualChatterKeywords = [
      'pizza', 'burger', 'sushi', 'taco', 'breakfast', 'lunch', 'dinner',
      'netflix', 'movie', 'cinema', 'actor', 'gaming', 'minecraft',
      'weather', 'rain', 'sunny', 'snow', 'cold outside', 'hot outside',
      'vacation', 'beach', 'party', 'weekend', 'mall', 'shopping', 'clothes',
      'cat', 'dog', 'pet', 'football', 'cricket', 'basketball', 'soccer',
      'dating', 'sleepy', 'sleeping'
    ];

    const hasCasualChatter = casualChatterKeywords.some((kw) => lowerText.includes(kw));

    // If candidate mentions casual non-technical chatter and has zero technical relevance
    if (hasCasualChatter && !hasAnyTechnicalTerm) {
      return {
        isUnrelated: true,
        reason: 'Answer discusses casual everyday topics with no relevance to the question.',
      };
    }

    return { isUnrelated: false };
  }

  /**
   * Sanitizes AI speech output to ensure clean, natural pronunciation by Azure Neural TTS.
   * Strips markdown symbols, asterisks, brackets, code blocks, and formatting tags.
   */
  public static sanitizeForSpeech(rawText: string): string {
    if (!rawText) return '';

    return rawText
      // Remove markdown bold/italics
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
      // Remove code fences and inline backticks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bullet points
      .replace(/^\s*[-*+]\s+/gm, '')
      // Remove parenthetical internal notes e.g. "(Note: ...)"
      .replace(/\((?:note|aside|instruction):[^)]*\)/gi, '')
      // Remove JSON formatting artifacts if model leaked brackets
      .replace(/[{}\[\]"]/g, '')
      // Clean up multiple spaces, linebreaks, and trim
      .replace(/\s+/g, ' ')
      .replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, '')
      .trim();
  }

  /**
   * Enforces pacing clock, target question limits, and strict anti-looping rules:
   * 1. Max 1 follow-up probe on any given topic or scenario.
   * 2. Pacing clock: concludes automatically if remaining time <= 60 seconds.
   * 3. Prevents re-asking about topics already thoroughly evaluated.
   */
  public static enforcePacingAndProgression(
    decision: NextQuestionDecision,
    context: CandidateContext,
    previousQuestions: Question[],
    elapsedSeconds?: number
  ): NextQuestionDecision {
    const questionCount = previousQuestions.length;
    const targetQuestions = context.targetQuestions || (context.durationMinutes >= 30 ? 15 : context.durationMinutes >= 20 ? 10 : 6);
    const totalAllowedSeconds = (context.durationMinutes || 10) * 60;
    const timeRemainingSeconds = elapsedSeconds !== undefined ? Math.max(totalAllowedSeconds - elapsedSeconds, 0) : undefined;

    const lastQuestion = previousQuestions[previousQuestions.length - 1];
    const wasFollowUp = lastQuestion && (
      lastQuestion.type === 'follow_up' ||
      lastQuestion.topic?.toLowerCase().includes('follow-up') ||
      lastQuestion.topic?.toLowerCase().includes('trade-off')
    );

    let resolvedAction = decision.action;
    let resolvedType = decision.type;
    let resolvedTopic = decision.topic;
    let resolvedQuestion = this.sanitizeForSpeech(decision.questionText);

    // 1. Clock Guard: If time has expired or <= 60s remaining with at least 3 questions asked
    const isTimeExpired = elapsedSeconds !== undefined && elapsedSeconds >= totalAllowedSeconds;
    const isClockEnding = timeRemainingSeconds !== undefined && timeRemainingSeconds <= 60 && questionCount >= 3;
    const isQuestionLimitReached = questionCount >= targetQuestions;

    if (isTimeExpired || isClockEnding || isQuestionLimitReached) {
      resolvedAction = 'conclude';
      resolvedType = 'closing';
      resolvedTopic = 'Rehearsal Conclusion';
      if (!resolvedQuestion || resolvedAction !== decision.action) {
        resolvedQuestion = `That brings us to the end of our scheduled ${context.durationMinutes}-minute rehearsal. Thank you for walking through your engineering experiences and technical trade-offs today. I am now preparing your feedback report.`;
      }
      return {
        ...decision,
        action: 'conclude',
        type: 'closing',
        topic: 'Rehearsal Conclusion',
        questionText: resolvedQuestion,
        evaluation: decision.evaluation ? {
          ...decision.evaluation,
          requiresFollowUp: false,
        } : {
          understoodIntent: true,
          clarity: 'Good',
          extractedKeyPoints: ['Conclusion reached'],
          requiresFollowUp: false,
        },
      };
    }

    // 2. Anti-Looping Guard: Strictly prohibit back-to-back follow-up questions
    if (wasFollowUp && resolvedAction === 'follow_up') {
      resolvedAction = 'new_topic';
      resolvedType = 'technical';
      resolvedTopic = decision.topic || 'Engineering Architecture & Reliability';
    }

    // 3. Fallback safe question if model returned blank or corrupt question text
    if (!resolvedQuestion || resolvedQuestion.length < 10) {
      resolvedQuestion = `Could you walk me through how you approach system observability, fault isolation, and incident debugging in production environments?`;
      resolvedTopic = 'Production Observability & Fault Tolerance';
      resolvedType = 'technical';
      resolvedAction = 'new_topic';
    }

    return {
      ...decision,
      action: resolvedAction,
      type: resolvedType,
      topic: resolvedTopic,
      questionText: resolvedQuestion,
    };
  }

  /**
   * Helper to construct a recorded GuardrailEvent for auditing in the session.
   */
  public static createEvent(
    flag: GuardrailFlag,
    reason: string,
    actionTaken: string
  ): GuardrailEvent {
    return {
      id: `gr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      flag,
      reason,
      actionTaken,
    };
  }
}
