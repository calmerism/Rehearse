import { describe, it, expect, vi } from 'vitest';
import { InterviewAgent, AgentEvent } from '@/agent/interviewAgent';
import { MockFoundryService } from '@/services/foundry/mockFoundryService';
import { ISpeechService } from '@/services/speech/types';
import { CandidateContext, InterviewSession, Question, Answer } from '@/types/interview';

// Lightweight mock speech service for test runner
class TestSpeechService implements ISpeechService {
  public spokenTexts: string[] = [];
  public isListening = false;

  async initialize() {
    return true;
  }
  isRealAzure() {
    return false;
  }
  async startListening() {
    this.isListening = true;
  }
  async stopListening() {
    this.isListening = false;
    return 'I built a food delivery application using React, Node, and PostgreSQL.';
  }
  async speak(text: string, onSpeakingState?: (isSpeaking: boolean) => void) {
    this.spokenTexts.push(text);
    onSpeakingState?.(true);
    onSpeakingState?.(false);
  }
  stopSpeaking() {}
}

describe('AI Interview Agent & Foundry Service', () => {
  const sampleContext: CandidateContext = {
    role: 'Software Engineer Intern',
    company: 'Microsoft',
    interviewType: 'technical',
    durationMinutes: 10,
    resumeText: 'React, Node.js, PostgreSQL project',
  };

  it('generates a relevant opening question based on context', async () => {
    const foundry = new MockFoundryService();
    const { introText, firstQuestion } = await foundry.generateIntroductionAndOpening(sampleContext);

    expect(introText).toContain('Software Engineer Intern');
    expect(firstQuestion.text).toBeDefined();
    expect(firstQuestion.topic).toBe('Projects & Architecture');
    expect(firstQuestion.type).toBe('technical');
  });

  it('generates an adaptive follow-up when candidate mentions PostgreSQL', async () => {
    const foundry = new MockFoundryService();
    const { firstQuestion } = await foundry.generateIntroductionAndOpening(sampleContext);

    const answer = {
      id: 'ans_1',
      questionId: firstQuestion.id,
      transcript: 'I built a food delivery application using React, Node and PostgreSQL.',
      durationSeconds: 20,
      timestamp: new Date().toISOString(),
    };

    const decision = await foundry.evaluateAndGenerateNext(
      sampleContext,
      [firstQuestion],
      [],
      answer,
      firstQuestion
    );

    expect(decision.action).toBe('follow_up');
    expect(decision.questionText.toLowerCase()).toContain('postgresql');
    expect(decision.evaluation?.technicalAccuracy).toBe('Good');
    expect(decision.evaluation?.requiresFollowUp).toBe(true);
  });

  it('deepens the follow-up when candidate discusses relational data schema', async () => {
    const foundry = new MockFoundryService();
    const q1 = {
      id: 'q_1',
      text: 'Tell me about your project.',
      topic: 'Projects',
      type: 'technical' as const,
      timestamp: new Date().toISOString(),
    };
    const q2 = {
      id: 'q_2',
      text: 'Why did you choose PostgreSQL?',
      topic: 'Database Selection',
      type: 'follow_up' as const,
      timestamp: new Date().toISOString(),
    };

    const a1 = {
      id: 'a_1',
      questionId: 'q_1',
      transcript: 'I built a project with PostgreSQL.',
      durationSeconds: 15,
      timestamp: new Date().toISOString(),
    };
    const a2 = {
      id: 'a_2',
      questionId: 'q_2',
      transcript: 'We needed relational data for users and orders with strict ACID transaction guarantees.',
      durationSeconds: 25,
      timestamp: new Date().toISOString(),
    };

    const decision = await foundry.evaluateAndGenerateNext(
      sampleContext,
      [q1, q2],
      [a1],
      a2,
      q2
    );

    expect(decision.action).toBe('follow_up');
    // Follow up asks how database design or scaling would change
    expect(decision.questionText.toLowerCase()).toContain('database');
    expect(decision.difficulty).toBe('hard');
    expect(decision.evaluation?.technicalAccuracy).toBe('Strong');
  });

  it('manages the entire agent interview lifecycle and maintains context', async () => {
    const session: InterviewSession = {
      id: 'test_session',
      createdAt: new Date().toISOString(),
      context: sampleContext,
      status: 'in_progress',
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      totalDurationSeconds: 0,
      isDemoMode: true,
    };

    const speech = new TestSpeechService();
    const foundry = new MockFoundryService();
    const agent = new InterviewAgent(session, foundry, speech);

    const emittedEvents: AgentEvent[] = [];
    agent.on((e) => emittedEvents.push(e));

    // 1. Start agent
    await agent.start();
    expect(session.questions.length).toBe(1);
    expect(speech.spokenTexts.length).toBeGreaterThanOrEqual(1); // Unified opening (Intro + Question 1 in one utterance)
    expect(speech.spokenTexts[0]).toContain(session.questions[0].text);
    expect(agent.getState()).toBe('listening');

    // 2. Candidate answers Q1
    await agent.submitAnswer('I built a food delivery application using React, Node and PostgreSQL.');
    expect(session.answers.length).toBe(1);
    expect(session.questions.length).toBe(2);
    expect(session.questions[1].type).toBe('follow_up');

    // 3. Candidate answers Q2 (Relational scaling)
    await agent.submitAnswer('We needed relational data for users and orders with strict ACID guarantees.');
    expect(session.answers.length).toBe(2);
    expect(session.questions.length).toBe(3);

    // 4. Candidate answers Q3 (Scale design)
    await agent.submitAnswer('I would introduce read replicas, partition tables by month, and add Redis caching.');
    expect(session.answers.length).toBe(3);

    // 5. Conclude interview and verify feedback report
    const feedback = await agent.concludeInterview('Interview completed.');
    expect(session.status).toBe('completed');
    expect(feedback.technicalScore).toBeDefined();
    expect(feedback.whatWentWell.length).toBeGreaterThanOrEqual(2);
    expect(feedback.whatToImprove.length).toBeGreaterThanOrEqual(2);
    expect(feedback.nextRehearsalFocus).toBeDefined();
  });

  it('seeds next rehearsal focusing on prior identified weakness', async () => {
    const weaknessContext: CandidateContext = {
      role: 'Software Engineer Intern',
      interviewType: 'technical',
      durationMinutes: 10,
      focusArea: 'Focus on explaining technical decisions and trade-offs',
    };

    const foundry = new MockFoundryService();
    const { firstQuestion } = await foundry.generateIntroductionAndOpening(weaknessContext);

    expect(firstQuestion.topic).toBe('Technical Trade-offs');
    expect(firstQuestion.text.toLowerCase()).toContain('trade-off');
  });

  it('strictly rotates topics and prevents repetitive questions across consecutive answers', async () => {
    const foundry = new MockFoundryService();
    const { firstQuestion } = await foundry.generateIntroductionAndOpening(sampleContext);

    const questions: Question[] = [firstQuestion];
    const answers: Answer[] = [];

    // Simulate 4 consecutive answers continuously mentioning database
    for (let i = 0; i < 4; i++) {
      const ans: Answer = {
        id: `ans_${i + 1}`,
        questionId: questions[questions.length - 1].id,
        transcript: 'I used PostgreSQL database with relational indexing and database transactions.',
        durationSeconds: 20,
        timestamp: new Date().toISOString(),
      };
      answers.push(ans);

      const decision = await foundry.evaluateAndGenerateNext(
        sampleContext,
        questions,
        answers.slice(0, -1),
        ans,
        questions[questions.length - 1]
      );

      const nextQ: Question = {
        id: `q_${questions.length + 1}`,
        text: decision.questionText,
        topic: decision.topic,
        type: decision.type,
        timestamp: new Date().toISOString(),
      };
      questions.push(nextQ);
    }

    // Verify all question texts are distinct (no loops or repeats)
    const texts = questions.map((q) => q.text.toLowerCase());
    const uniqueTexts = new Set(texts);
    expect(uniqueTexts.size).toBe(questions.length);

    // Verify progression to diverse competencies after initial follow-up
    const laterTopics = questions.slice(2).map((q) => q.topic);
    expect(laterTopics.some((t) => t.includes('Observability') || t.includes('Concurrency') || t.includes('Engineering'))).toBe(true);
  });

  it('does not just ask about a project when resume is not uploaded', async () => {
    const foundry = new MockFoundryService();
    const noResumeContext: CandidateContext = {
      role: 'Backend Engineer',
      interviewType: 'technical',
      durationMinutes: 10,
    };

    const { firstQuestion } = await foundry.generateIntroductionAndOpening(noResumeContext);

    // Opening question should not force candidate to talk about a past project
    expect(firstQuestion.text.toLowerCase()).not.toContain('tell me about a technical project');
    expect(firstQuestion.text.toLowerCase()).not.toContain('project you have worked on');
    expect(firstQuestion.topic).toBe('Database Design & Indexing Strategy');
    expect(firstQuestion.text.toLowerCase()).toContain('database');
  });

  it('evaluates role-specific technical concepts when no resume is uploaded for Frontend', async () => {
    const foundry = new MockFoundryService();
    const frontendContext: CandidateContext = {
      role: 'Frontend Engineer',
      interviewType: 'technical',
      durationMinutes: 10,
    };

    const { firstQuestion } = await foundry.generateIntroductionAndOpening(frontendContext);

    expect(firstQuestion.text.toLowerCase()).not.toContain('project');
    expect(firstQuestion.topic).toBe('State Architecture & Rendering Performance');
    expect(firstQuestion.text.toLowerCase()).toContain('state management');
  });

  it('evaluates practical system design scenarios when no resume is uploaded for System Design', async () => {
    const foundry = new MockFoundryService();
    const sysDesignContext: CandidateContext = {
      role: 'System Design Engineer',
      interviewType: 'technical',
      durationMinutes: 20,
    };

    const { firstQuestion } = await foundry.generateIntroductionAndOpening(sysDesignContext);

    expect(firstQuestion.text.toLowerCase()).not.toContain('project you have worked on');
    expect(firstQuestion.topic).toBe('Distributed Rate Limiter Design');
    expect(firstQuestion.text.toLowerCase()).toContain('rate-limiting');
  });
});

