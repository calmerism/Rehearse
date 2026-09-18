import { describe, it, expect } from 'vitest';
import { MockFoundryService } from '@/services/foundry/mockFoundryService';
import { MockSpeechService } from '@/services/speech/mockSpeechService';
import { CandidateContext, Question, Answer } from '@/types/interview';

describe('Error Handling and Edge Cases', () => {
  const context: CandidateContext = {
    role: 'Software Engineer Intern',
    interviewType: 'technical',
    durationMinutes: 10,
  };

  it('handles very brief answers by prompting for elaboration', async () => {
    const foundry = new MockFoundryService();
    const q1 = {
      id: 'q_1',
      text: 'Tell me about a technical project.',
      topic: 'Projects',
      type: 'technical' as const,
      timestamp: new Date().toISOString(),
    };
    const shortAnswer = {
      id: 'ans_brief',
      questionId: 'q_1',
      transcript: 'I made a website.',
      durationSeconds: 3,
      timestamp: new Date().toISOString(),
    };

    const decision = await foundry.evaluateAndGenerateNext(
      context,
      [q1],
      [],
      shortAnswer,
      q1
    );

    expect(decision.action).toBe('follow_up');
    expect(decision.questionText.toLowerCase()).toContain('elaborate');
    expect(decision.evaluation?.clarity).toBe('Needs Improvement');
  });

  it('handles empty answers gracefully without crashing', async () => {
    const foundry = new MockFoundryService();
    const q1 = {
      id: 'q_1',
      text: 'Tell me about a technical project.',
      topic: 'Projects',
      type: 'technical' as const,
      timestamp: new Date().toISOString(),
    };
    const emptyAnswer = {
      id: 'ans_empty',
      questionId: 'q_1',
      transcript: '',
      durationSeconds: 1,
      timestamp: new Date().toISOString(),
    };

    const decision = await foundry.evaluateAndGenerateNext(
      context,
      [q1],
      [],
      emptyAnswer,
      q1
    );

    expect(decision).toBeDefined();
    expect(decision.questionText).toBeDefined();
  });

  it('MockSpeechService reports demo mode status accurately', () => {
    const speech = new MockSpeechService();
    expect(speech.isRealAzure()).toBe(false);
  });

  it('selectBestVoice rejects robotic voices and prioritizes natural/neural voices', () => {
    const mockVoices = [
      { name: 'Fred', lang: 'en-US', voiceURI: 'fred' } as SpeechSynthesisVoice,
      { name: 'Albert', lang: 'en-US', voiceURI: 'albert' } as SpeechSynthesisVoice,
      { name: 'Samantha', lang: 'en-US', voiceURI: 'samantha' } as SpeechSynthesisVoice,
      { name: 'Siri Voice 4', lang: 'en-US', voiceURI: 'siri-4' } as SpeechSynthesisVoice,
    ];

    // Should pick Siri Voice 4 over Fred/Albert/Samantha
    const best = MockSpeechService.selectBestVoice(mockVoices);
    expect(best?.name).toBe('Siri Voice 4');

    // If no Siri, should pick Samantha over Fred/Albert
    const nonSiriVoices = [
      { name: 'Fred', lang: 'en-US', voiceURI: 'fred' } as SpeechSynthesisVoice,
      { name: 'Albert', lang: 'en-US', voiceURI: 'albert' } as SpeechSynthesisVoice,
      { name: 'Samantha', lang: 'en-US', voiceURI: 'samantha' } as SpeechSynthesisVoice,
    ];
    const best2 = MockSpeechService.selectBestVoice(nonSiriVoices);
    expect(best2?.name).toBe('Samantha');

    // Should honor explicit user choice
    const custom = MockSpeechService.selectBestVoice(nonSiriVoices, 'Samantha');
    expect(custom?.name).toBe('Samantha');
  });

  it('Azure Neural TTS route validates input properly', async () => {
    const { POST } = await import('../src/app/api/speech/tts/route');
    const badReq = new Request('http://localhost:3000/api/speech/tts', {
      method: 'POST',
      body: JSON.stringify({ text: '' }),
    });
    const res = await POST(badReq);
    expect(res.status).toBe(400);

    const validReq = new Request('http://localhost:3000/api/speech/tts', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello, candidate!' }),
    });
    const validRes = await POST(validReq);
    // Should return 200 with audio/mpeg when keys are configured
    expect([200, 503]).toContain(validRes.status);
    if (validRes.status === 200) {
      expect(validRes.headers.get('content-type')).toBe('audio/mpeg');
    }
  });

  it('concludes the interview session when scheduled duration limit (10 minutes) is reached', async () => {
    const foundry = new MockFoundryService();
    const context: CandidateContext = {
      role: 'Full Stack Engineer',
      interviewType: 'technical',
      durationMinutes: 10,
    };
    const q1 = {
      id: 'q_1',
      text: 'Tell me about your tech stack.',
      topic: 'Architecture',
      type: 'technical' as const,
      timestamp: new Date().toISOString(),
    };
    const ans = {
      id: 'ans_1',
      questionId: 'q_1',
      transcript: 'I worked with Next.js and TypeScript.',
      durationSeconds: 25,
      timestamp: new Date().toISOString(),
    };

    // Evaluate when elapsed time is 600s (exactly 10 minutes)
    const decision = await foundry.evaluateAndGenerateNext(
      context,
      [q1],
      [],
      ans,
      q1,
      600
    );

    expect(decision.action).toBe('conclude');
    expect(decision.type).toBe('closing');
    expect(decision.questionText.toLowerCase()).toContain('scheduled 10-minute rehearsal');
  });

  it('does not conclude prematurely when ample time remains in the rehearsal', async () => {
    const foundry = new MockFoundryService();
    const context: CandidateContext = {
      role: 'Full Stack Engineer',
      interviewType: 'technical',
      durationMinutes: 10,
    };
    const previousQuestions: Question[] = Array.from({ length: 6 }, (_, i) => ({
      id: `q_${i + 1}`,
      text: `Question ${i + 1}`,
      topic: `Topic ${i + 1}`,
      type: 'technical' as const,
      timestamp: new Date().toISOString(),
    }));
    const ans: Answer = {
      id: 'ans_6',
      questionId: 'q_6',
      transcript: 'I implemented distributed locking using Redis.',
      durationSeconds: 20,
      timestamp: new Date().toISOString(),
    };

    // Candidate answered 6 questions quickly in only 180 seconds (3 mins into 10 min meeting, 7 mins left)
    const decision = await foundry.evaluateAndGenerateNext(
      context,
      previousQuestions,
      [],
      ans,
      previousQuestions[5],
      180
    );

    // Should NOT conclude: there are still 7 minutes left!
    expect(decision.action).not.toBe('conclude');
  });
});


