import { describe, it, expect } from 'vitest';
import { MockFoundryService, SAMPLE_BEHAVIORAL_DEMO_QUESTIONS } from '../src/services/foundry/mockFoundryService';
import { CandidateContext, InterviewSession, Question, Answer } from '../src/types/interview';
import { SAMPLE_DEMO_RESUME_TEXT } from '../src/services/storage/sessionStore';

describe('Sample Behavioral Demo Flow (5 Questions)', () => {
  const foundry = new MockFoundryService();

  const demoContext: CandidateContext = {
    role: 'AI & Software Engineer',
    company: 'Chitkara University',
    interviewType: 'behavioural',
    durationMinutes: 10,
    targetQuestions: 5,
    isSampleDemo: true,
    resumeText: SAMPLE_DEMO_RESUME_TEXT,
  };

  it('guarantees exactly 5 preset behavioral questions in sequence and concludes with diagnostic report', async () => {
    // 1. Initial question
    const { introText, firstQuestion } = await foundry.generateIntroductionAndOpening(demoContext);
    expect(introText).toContain('Welcome Kashish');
    expect(introText).toContain('5 key technical and project areas');
    expect(firstQuestion.text).toBe(SAMPLE_BEHAVIORAL_DEMO_QUESTIONS[0].text);

    const questions: Question[] = [firstQuestion];
    const answers: Answer[] = [];

    // Step through Q1 -> Q2 -> Q3 -> Q4 -> Q5
    const candidateAnswers = [
      "Hi, I'm Kashish from Chitkara University. For my Telecom Churn project, I tested Logistic Regression and Random Forest, evaluating with Recall and ROC-AUC because the churn data was imbalanced.",
      "With Pandas, I imputed missing total charges with median values and used get_dummies for categorical encoding, while using StandardScaler with NumPy for continuous values.",
      "In TOGETHERLY, I built relational models for profiles, posts, and messages in Django ORM with SQLite, session auth, and real-time AJAX messaging.",
      "For INNOFIND, I stored the to-do list, calendar events, and theme in window.localStorage with JSON serialization so user state persisted across page reloads.",
      "During the Intellex hackathon, when CORS and race conditions broke our app before judging, I debugged the middleware and async fetch calls while my partner prepped the slides, winning 2nd place."
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
    expect(concludeDecision.questionText).toContain('concludes our 5-question interview rehearsal');

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
