import {
  CandidateContext,
  Question,
  Answer,
  FeedbackReportData,
} from '@/types/interview';
import { IFoundryService, NextQuestionDecision } from './types';
import { InterviewGuardrails } from '@/services/guardrails/guardrailsService';

/**
 * Microsoft Foundry & Azure OpenAI Service Configuration.
 * Compatible with Azure OpenAI resource endpoints and Microsoft Foundry model deployments.
 */
export interface FoundryConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  apiVersion?: string;
}

/**
 * FoundryService: Microsoft Foundry / Azure OpenAI Reasoning Engine
 *
 * Core Capabilities:
 * 1. Evaluates candidate verbal responses against engineering rubrics.
 * 2. Enforces structured JSON output schema for reliable frontend parsing.
 * 3. Ingests candidate resume content to anchor interview challenges in real experience.
 * 4. Implements dynamic counter-questioning: challenges trade-offs rather than testing trivia.
 * 5. Synthesizes a multi-dimensional diagnostic report upon session completion.
 */
export class FoundryService implements IFoundryService {
  private config: FoundryConfig;

  constructor(config: FoundryConfig) {
    this.config = {
      apiVersion: '2024-06-01',
      ...config,
    };
  }

  isRealAzure(): boolean {
    return true;
  }

  /**
   * Dispatches a chat completion request to the Microsoft Foundry / Azure OpenAI endpoint.
   * If a JSON schema is requested, enforces response_format: { type: 'json_object' }.
   */
  private async callChatCompletion(messages: any[], jsonSchema?: any): Promise<any> {
    let cleanEndpoint = this.config.endpoint.replace(/\/$/, '');
    try {
      const parsed = new URL(cleanEndpoint);
      cleanEndpoint = parsed.origin;
    } catch {
      // fallback to cleanEndpoint
    }
    const url = `${cleanEndpoint}/openai/deployments/${this.config.model}/chat/completions?api-version=${this.config.apiVersion}`;

    const body: any = {
      messages,
      temperature: 0.7,
    };

    if (jsonSchema) {
      body.response_format = {
        type: 'json_object',
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Foundry API error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Foundry model');

    if (jsonSchema) {
      try {
        return JSON.parse(content);
      } catch (err) {
        console.warn('[FoundryService] JSON parse error on response:', content);
        throw new Error('Malformed JSON output from Foundry model');
      }
    }

    return content;
  }

  async generateIntroductionAndOpening(
    context: CandidateContext
  ): Promise<{ introText: string; firstQuestion: Question }> {
    const hasResume = !!(context.resumeText && context.resumeText.trim().length > 0);
    const systemPrompt = `You are an expert, calm, and professional technical/behavioral interviewer conducting a high-stakes, realistic interview rehearsal.
Role: "${context.role}" at "${context.company || 'a top technology company'}".
Interview Type: ${context.interviewType}.
Duration: ${context.durationMinutes} minutes.
${context.focusArea ? `Identified Priority/Gap from Prior Rehearsal: ${context.focusArea}` : ''}

GUARDRAILS & INTERVIEW PERSONA DIRECTIVES:
1. Maintain strict interviewer persona at all times. Do not break character, lecture, or output conversational filler like "Great question!" or "Sure!".
2. Never output markdown formatting symbols, asterisks, brackets, or quotes in "questionText" or "introText" so speech synthesis sounds natural.
3. The opening question must be concise, direct, and engaging.

${hasResume ? `CANDIDATE'S ACTUAL UPLOADED RESUME:
"""
${context.resumeText}
"""

CRITICAL RESUME ANCHORING INSTRUCTIONS:
1. The candidate uploaded their actual resume above. You MUST ground the opening question directly in their real background, projects, technologies, or employment history.
2. Pick a specific, prominent project, technology architecture, or key achievement from their resume and ask them to break down their technical implementation, design choices, or system architecture.
3. DO NOT ask generic 'tell me about yourself' questions. Address them professionally as an interviewer who has carefully reviewed their resume and wants to dig into their actual work.` : `CRITICAL DIRECTIVE — NO RESUME UPLOADED:
1. The candidate has NOT uploaded a resume. You MUST NOT ask generic "tell me about a project you worked on" or demand that they recount a past project.
2. Instead, ask a substantive, role-specific question that directly evaluates their core technical understanding, architecture principles, or problem-solving judgment for the "${context.role}" position:
   - Technical/Coding: Pose a concrete architectural concept, runtime trade-off, or practical engineering challenge (e.g. database indexing strategies and query latency, client state management and rendering performance, API design and fault tolerance, concurrency, or memory management).
   - System Design: Present a clear, practical system design prompt (e.g. designing a rate limiter, distributed cache, notification pipeline, or real-time event stream).
   - Behavioural: Pose a situational or philosophy-based question (e.g. navigating technical disagreements on architecture, balancing technical debt vs shipping speed, or debugging an unfamiliar codebase under pressure).
3. The question must be direct, engaging, and professional—testing their technical mind and problem-solving ability directly without requiring a past project story.`}

Generate a concise, natural introduction and the first opening question.
Respond in strict JSON format:
{
  "introText": "Brief 1-2 sentence professional greeting acknowledging the interview context",
  "questionText": "First relevant interview question directly evaluating their technical competence",
  "topic": "Specific Topic Name",
  "difficulty": "medium"
}`;

    const response = await this.callChatCompletion(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate interview introduction and first question.' }],
      true
    );

    const fallbackOpeningText = hasResume
      ? (context.interviewType === 'behavioural'
          ? 'Tell me about a time you faced a significant challenge on a project and how you resolved it.'
          : 'Tell me about a technical project you worked on recently and the key architecture decisions you made.')
      : (context.interviewType === 'behavioural'
          ? 'How do you typically approach resolving technical disagreements when team members have strongly conflicting views on architecture or library selection?'
          : (context.role.toLowerCase().includes('system design') || context.role.toLowerCase().includes('architect'))
          ? 'How would you approach designing a scalable, distributed rate-limiting service to protect backend APIs from unexpected traffic spikes?'
          : 'When designing an API service that handles high-throughput traffic, how do you approach database schema design and indexing to prevent latency bottlenecks?');

    const rawQuestionText = response.questionText || response.question || response.prompt || fallbackOpeningText;
    const sanitizedQuestionText = InterviewGuardrails.sanitizeForSpeech(rawQuestionText);
    const rawIntroText = response.introText || `Welcome to your ${context.interviewType} rehearsal for the ${context.role} position. Let's begin.`;
    const sanitizedIntroText = InterviewGuardrails.sanitizeForSpeech(rawIntroText);

    const firstQuestion: Question = {
      id: `q_1`,
      text: sanitizedQuestionText,
      topic: response.topic || (context.interviewType === 'behavioural' ? 'Collaboration & Disagreements' : 'Core Architecture & Principles'),
      type: context.interviewType === 'behavioural' ? 'behavioural' : 'technical',
      difficulty: response.difficulty || 'medium',
      timestamp: new Date().toISOString(),
    };

    return {
      introText: sanitizedIntroText,
      firstQuestion,
    };
  }

  async evaluateAndGenerateNext(
    context: CandidateContext,
    previousQuestions: Question[],
    previousAnswers: Answer[],
    latestAnswer: Answer,
    currentQuestion: Question,
    elapsedSeconds?: number
  ): Promise<NextQuestionDecision> {
    const questionCount = previousQuestions.length;
    const targetQuestions = context.targetQuestions || (context.durationMinutes >= 30 ? 15 : context.durationMinutes >= 20 ? 10 : 6);
    const totalAllowedSeconds = (context.durationMinutes || 10) * 60;
    const timeRemainingSeconds = elapsedSeconds !== undefined ? Math.max(totalAllowedSeconds - elapsedSeconds, 0) : undefined;
    const isTimeDriven = elapsedSeconds !== undefined;
    const isNearEnd = isTimeDriven
      ? (elapsedSeconds >= totalAllowedSeconds || (timeRemainingSeconds !== undefined && timeRemainingSeconds <= 75 && questionCount >= 3))
      : (questionCount >= targetQuestions) || (context.targetQuestions ? questionCount >= context.targetQuestions : false);
    const wasFollowUp = currentQuestion && (currentQuestion.type === 'follow_up' || currentQuestion.topic?.toLowerCase().includes('follow-up') || currentQuestion.topic?.toLowerCase().includes('trade-off'));

    const history = previousQuestions.map((q, idx) => {
      const a = previousAnswers[idx];
      return `Q${idx + 1} [${q.type || 'technical'}, Topic: "${q.topic || 'General'}"]: ${q.text}\nA${idx + 1}: ${a ? a.transcript : '[No answer]'}`;
    }).join('\n\n');

    const systemPrompt = `You are the AI Interviewer conducting a realistic, multi-faceted software engineering rehearsal.
Role: ${context.role}
Interview Type: ${context.interviewType}
Scheduled Duration: ${context.durationMinutes} minutes
Elapsed Time: ${elapsedSeconds !== undefined ? `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s` : 'N/A'} (Remaining: ${timeRemainingSeconds !== undefined ? `${Math.floor(timeRemainingSeconds / 60)}m ${timeRemainingSeconds % 60}s` : 'N/A'})
Questions Asked So Far: ${questionCount} of ~${targetQuestions} target questions

${context.resumeText ? `CANDIDATE'S UPLOADED RESUME:
"""
${context.resumeText}
"""
` : `NO RESUME UPLOADED — CRITICAL INSTRUCTION:
The candidate did NOT upload a resume. You MUST NOT repeatedly ask the candidate to describe past projects or say "In another project you worked on...".
Instead, evaluate their competence across core engineering principles, hypothetical architectural scenarios, and practical problem-solving for ${context.role}:
- Ask direct conceptual and design questions (e.g., how to prevent race conditions, index optimization, distributed locking, state synchronization, caching trade-offs).
- Present hypothetical real-world scenarios (e.g., "How would you design...", "If a service experiences a sudden 10x traffic spike, what steps would you take...", "How would you architect...").
- Evaluate technical decision-making and engineering judgment rather than demanding past project stories.`}

Interview Questions & Answers So Far:
${history}

Latest Candidate Answer to "${currentQuestion.text}":
"${latestAnswer.transcript}"

CRITICAL RELEVANCE & OFF-TOPIC ENFORCEMENT:
Evaluate whether the candidate's latest answer is actually related, responsive, and relevant to the specific question asked: "${currentQuestion.text}".
1. IF THE ANSWER IS NOT RELATED (e.g. candidate talks about unrelated topics, everyday chatter, hobbies, food, movies, weather, personal life, dodges the technical prompt, or discusses unrelated technologies with no connection to the question):
   - You MUST NOT ignore it or pretend they answered!
   - You MUST set evaluation.isRelevant: false and evaluation.understoodIntent: false.
   - You MUST set action: "follow_up".
   - In "questionText", you MUST explicitly call out that their answer is not related to the question asked, and redirect them back to the topic.
     Required format:
     "That doesn't seem related to the question I asked. We are focusing on [topic or concept of current question]. Could you walk me through [rephrased direct question]?"
     or
     "That doesn't quite address what I asked. Let's stay on topic: [rephrased direct question]?"
   - Do NOT advance to a new topic when candidate gave an unrelated response.
2. IF THE ANSWER IS RELEVANT:
   - Set evaluation.isRelevant: true.
   - Proceed with normal technical evaluation and progression.

${isNearEnd ? `CRITICAL SCHEDULE PACING: The scheduled ${context.durationMinutes}-minute time limit has arrived. You MUST set action: "conclude" now. Provide a warm, gracious closing remark thanking the candidate for their time.` : wasFollowUp ? `CRITICAL PROGRESSION MANDATE: The previous question (Q${questionCount}) was already a follow-up probe. You MUST NOT ask another follow-up on this same project or topic. Action MUST BE "new_topic" (or "conclude" if finished).` : ''}

MANDATORY TOPIC ROTATION & DIVERSITY RULES:
1. MAXIMUM ONE FOLLOW-UP PER TOPIC:
   Never spend more than one follow-up question on any single topic, scenario, or technology. Once a topic has received an initial question and at most 1 follow-up, you MUST advance to a completely new topic (action: "new_topic").
2. ROTATE ACROSS DISTINCT ENGINEERING PILLARS:
   A comprehensive engineering interview must evaluate candidate competence across multiple distinct pillars:
   - Pillar A: Core System Architecture & Framework Fundamentals (architectural design, component lifecycles, runtime mechanics)
   - Pillar B: Scalability Bottlenecks, Data Store Selection, Indexing & Caching Trade-offs
   - Pillar C: Distributed Systems, Concurrency, Message Queuing, or Fault Tolerance
   - Pillar D: Production Incident Debugging, Observability, Root Cause Analysis, or Resiliency
   - Pillar E: Behavioral, Technical Disagreements, Engineering Judgment, or Delivery Trade-offs
   Ensure the next question addresses a pillar that has NOT been covered yet in previous questions.
3. STRICT ZERO REPETITION:
   Under NO circumstances repeat questions or linger on technologies already probed. Pivot to a completely different engineering pillar, backend service, distributed reliability, or incident scenario.
4. NO QUOTES:
   Do NOT wrap questionText in quotation marks.
5. If ${isNearEnd ? 'target questions or time limit is reached, set action: "conclude"' : 'interview is ongoing, advance with action: ' + (wasFollowUp ? '"new_topic"' : '"follow_up" or "new_topic"')}.

Respond in strict JSON format:
{
  "action": "${isNearEnd ? 'conclude' : wasFollowUp ? 'new_topic' : 'follow_up | new_topic'}",
  "questionText": "The question to speak aloud to candidate (clean text, no quotes)",
  "topic": "Distinct Topic Title (e.g. Distributed Concurrency & Reliability)",
  "type": "${isNearEnd ? 'closing' : wasFollowUp ? 'technical' : 'follow_up'}",
  "difficulty": "easy" | "medium" | "hard",
  "evaluation": {
    "understoodIntent": true | false,
    "isRelevant": true | false,
    "clarity": "Strong" | "Good" | "Needs Improvement",
    "technicalAccuracy": "Strong" | "Good" | "Needs Improvement",
    "extractedKeyPoints": ["point 1", "point 2"],
    "requiresFollowUp": ${isNearEnd || wasFollowUp ? 'false' : 'true'},
    "reasoningNote": "Coaching note on answer quality"
  }
}`;

    const response = await this.callChatCompletion(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Evaluate answer and determine next question.' }],
      true
    );

    const validTypes: Question['type'][] = ['follow_up', 'technical', 'behavioural', 'closing'];
    let resolvedType: Question['type'] = validTypes.includes(response.type) ? response.type : 'technical';
    let resolvedAction: 'follow_up' | 'new_topic' | 'conclude' = response.action || (isNearEnd ? 'conclude' : 'new_topic');

    // Strict time-based conclusion guard
    if ((isNearEnd || (timeRemainingSeconds !== undefined && timeRemainingSeconds <= 60)) && resolvedAction !== 'conclude') {
      resolvedAction = 'conclude';
      resolvedType = 'closing';
      response.topic = 'Rehearsal Conclusion';
    }

    // Strict guard: Enforce no back-to-back follow-ups
    if (wasFollowUp && resolvedAction === 'follow_up') {
      resolvedAction = 'new_topic';
      resolvedType = 'technical';
    }

    if (isNearEnd && resolvedAction !== 'conclude' && questionCount >= targetQuestions) {
      resolvedAction = 'conclude';
      resolvedType = 'closing';
    }

    const defaultConclusion = `That brings us to the end of our scheduled ${context.durationMinutes}-minute rehearsal. Thank you for your time and answers today. I am now preparing your feedback report.`;
    const rawQuestionText = resolvedAction === 'conclude'
      ? (response.questionText || response.question || defaultConclusion)
      : (response.questionText || response.question || response.nextQuestion || 'Could you walk me through how you approach system observability and incident debugging in production?');

    const cleanedQuestionText = rawQuestionText
      .replace(/^["'\u201C\u201D\u2018\u2019]+|["'\u201C\u201D\u2018\u2019]+$/g, '')
      .trim();

    const initialDecision: NextQuestionDecision = {
      action: resolvedAction,
      questionText: cleanedQuestionText,
      topic: response.topic || (resolvedAction === 'conclude' ? 'Rehearsal Conclusion' : 'System Architecture & Reliability'),
      type: resolvedType,
      difficulty: response.difficulty || 'medium',
      evaluation: response.evaluation || {
        understoodIntent: true,
        clarity: 'Good',
        technicalAccuracy: 'Good',
        extractedKeyPoints: ['Key points discussed'],
        requiresFollowUp: false,
      },
    };

    return InterviewGuardrails.enforcePacingAndProgression(
      initialDecision,
      context,
      previousQuestions,
      elapsedSeconds
    );
  }

  async generateFeedbackReport(
    context: CandidateContext,
    questions: Question[],
    answers: Answer[]
  ): Promise<FeedbackReportData> {
    const transcriptHistory = questions.map((q, idx) => {
      const a = answers[idx];
      return `Question: ${q.text}\nAnswer: ${a ? a.transcript : '[Unanswered]'}`;
    }).join('\n\n');

    const systemPrompt = `You are an expert interview coach giving rigorous, evidence-based coaching feedback on this rehearsal session.
Role: ${context.role}
Target Company: ${context.company || 'Technology Company'}
Interview Type: ${context.interviewType}
${context.resumeText ? `Candidate's Uploaded Resume:\n"""\n${context.resumeText}\n"""\n` : ''}

Full Interview Transcript:
${transcriptHistory}

CRITICAL ACCURACY & CALIBRATION RULES:
1. Ground all scores and feedback strictly in the actual transcript above. Do not use generic templates or hallucinate experience not stated.
2. Assess how effectively the candidate validated and defended the projects, tools, and technical complexity claimed on their resume.
3. If the candidate gave very short (<20 words), vague, or incomplete answers, you MUST rate Technical Answers and Communication as "Needs Improvement".
4. Award "Good" for solid, competent answers that addressed the question clearly with reasonable explanation.
5. Only award "Strong" if the candidate showed deep technical mastery, articulated specific engineering trade-offs or clear behavioral metrics (STAR), and handled follow-up probes with precision.
6. In "whatWentWell", you MUST cite 2-3 specific topics, technologies, or examples the candidate actually mentioned.
7. In "whatToImprove", give 2-3 precise, actionable techniques directly addressing where their answers fell short (e.g. missing trade-offs, lacking measurable metrics, missing error handling).
8. "nextRehearsalFocus" must be a single, high-impact focus sentence tailored to this candidate's primary gap.

Respond in strict JSON format:
{
  "technicalScore": "Strong" | "Good" | "Needs Improvement",
  "communicationScore": "Strong" | "Good" | "Needs Improvement",
  "interviewHandlingScore": "Strong" | "Good" | "Needs Improvement",
  "summaryVerdict": "1-2 sentence honest, calibrated coaching summary directly assessing their performance.",
  "whatWentWell": ["item 1 citing candidate topic", "item 2", "item 3"],
  "whatToImprove": ["concrete technique 1", "concrete technique 2", "concrete technique 3"],
  "nextRehearsalFocus": "Specific focus area for Rehearse Again button"
}`;

    const response = await this.callChatCompletion(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: 'Generate feedback report.' }],
      true
    );

    return {
      technicalScore: response.technicalScore || 'Good',
      communicationScore: response.communicationScore || 'Good',
      interviewHandlingScore: response.interviewHandlingScore || 'Good',
      summaryVerdict: response.summaryVerdict || 'Promising rehearsal session with solid technical communication.',
      whatWentWell: response.whatWentWell || [
        'Explained technical choices clearly.',
        'Responded calmly to follow-up questions.',
      ],
      whatToImprove: response.whatToImprove || [
        'Provide deeper architectural justification when choosing databases.',
        'Structure responses with the approach first, then reasoning, then results.',
      ],
      nextRehearsalFocus: response.nextRehearsalFocus || 'Focus on explaining technical decisions and architectural trade-offs.',
      completedAt: new Date().toISOString(),
    };
  }
}
