import { describe, it, expect } from 'vitest';
import { MockFoundryService, SAMPLE_BEHAVIORAL_DEMO_QUESTIONS } from '../src/services/foundry/mockFoundryService';
import { CandidateContext, InterviewSession, Question, Answer } from '../src/types/interview';
import { SAMPLE_DEMO_RESUME_TEXT } from '../src/services/storage/sessionStore';

describe('Sample Behavioral Demo Flow (5 Questions)', () => {
  const foundry = new MockFoundryService();

  const demoContext: CandidateContext = {
    role: 'Software Engineer',
    company: 'TechCorp Solutions',
    interviewType: 'behavioural',
    durationMinutes: 10,
    targetQuestions: 5,
    isSampleDemo: true,
    resumeText: SAMPLE_DEMO_RESUME_TEXT,
  };

  it('guarantees exactly 5 preset behavioral questions in sequence and concludes with diagnostic report', async () => {
    // 1. Initial question
    const { introText, firstQuestion } = await foundry.generateIntroductionAndOpening(demoContext);
    expect(introText).toContain('5 key behavioral competencies');
    expect(firstQuestion.text).toBe(SAMPLE_BEHAVIORAL_DEMO_QUESTIONS[0].text);

    const questions: Question[] = [firstQuestion];
    const answers: Answer[] = [];

    // Step through Q1 -> Q2 -> Q3 -> Q4 -> Q5
    const candidateAnswers = [
      "I was working on a project with a frontend and backend engineer under a strict two-week deadline. I established daily standups and API contract documentation early on.",
      "A teammate and I disagreed on whether to use REST or GraphQL. We benchmarked the payload sizes and client requirements, and agreed REST suited our timeline best.",
      "During deployment, our database migration failed in staging. I stayed calm, rolled back immediately, debugged the index constraint, and re-applied without downtime.",
      "I noticed our onboarding docs had broken links for new contributors, so I voluntarily updated the environment setup scripts and guide over the weekend.",
      "I used the Eisenhower matrix to triage high-urgency bug fixes against roadmap deliverables, communicating timeline expectations transparently to stakeholders."
    ];

    for (let i = 0; i < 4; i++) {
      const currentQ = questions[i];
      const ans: Answer = {
        id: `ans_${i + 1}`,
        questionId: currentQ.id,
        transcript: candidateAnswers[i],
        durationSeconds: 25,
        timestamp: new Date().toISOString(),
      };
      answers.push(ans);

      const decision = await foundry.evaluateAndGenerateNext(
        demoContext,
        questions,
        answers,
        ans,
        currentQ
      );

      expect(decision.action).toBe('new_topic');
      expect(decision.questionText).toBe(SAMPLE_BEHAVIORAL_DEMO_QUESTIONS[i + 1].text);

      questions.push({
        id: `q_${i + 2}`,
        text: decision.questionText,
        topic: decision.topic,
        type: decision.type,
        difficulty: decision.difficulty,
        timestamp: new Date().toISOString(),
      });
    }

    expect(questions.length).toBe(5);

    // Answer Q5 -> concludes
    const lastQ = questions[4];
    const lastAns: Answer = {
      id: 'ans_5',
      questionId: lastQ.id,
      transcript: candidateAnswers[4],
      durationSeconds: 25,
      timestamp: new Date().toISOString(),
    };
    answers.push(lastAns);

    const concludeDecision = await foundry.evaluateAndGenerateNext(
      demoContext,
      questions,
      answers,
      lastAns,
      lastQ
    );

    expect(concludeDecision.action).toBe('conclude');
    expect(concludeDecision.questionText).toContain('concludes our 5-question behavioral interview rehearsal');

    const report = await foundry.generateFeedbackReport(demoContext, questions, answers);
    expect(report).toBeDefined();
    expect(report.technicalScore).toBeDefined();
    expect(report.communicationScore).toBeDefined();
    expect(report.summaryVerdict.length).toBeGreaterThan(10);
    expect(report.whatWentWell.length).toBeGreaterThan(0);
    expect(report.whatToImprove.length).toBeGreaterThan(0);
    expect(report.nextRehearsalFocus).toBeDefined();
  });
});
