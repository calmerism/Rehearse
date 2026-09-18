import { NextResponse } from 'next/server';
import { CandidateContext, InterviewSession } from '@/types/interview';
import { getFoundryService } from '@/services/foundry/foundryFactory';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const context: CandidateContext = {
      role: body.role || 'Software Engineer Intern',
      company: body.company || undefined,
      interviewType: body.interviewType || 'technical',
      durationMinutes: body.durationMinutes || 10,
      resumeText: body.resumeText || undefined,
      focusArea: body.focusArea || undefined,
    };

    const customEndpoint = request.headers.get('x-foundry-endpoint') || undefined;
    const customApiKey = request.headers.get('x-foundry-key') || undefined;
    const customModel = request.headers.get('x-foundry-model') || undefined;

    const foundry = getFoundryService(body.forceDemo, {
      endpoint: customEndpoint,
      apiKey: customApiKey,
      model: customModel,
    });
    const { introText, firstQuestion } = await foundry.generateIntroductionAndOpening(context);

    const session: InterviewSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      context,
      status: 'in_progress',
      currentQuestionIndex: 0,
      questions: [firstQuestion],
      answers: [],
      totalDurationSeconds: 0,
      isDemoMode: !foundry.isRealAzure(),
    };

    return NextResponse.json({
      session,
      introText,
      firstQuestion,
      isDemoMode: session.isDemoMode,
    });
  } catch (err: any) {
    console.error('[API /interviews] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize rehearsal session' },
      { status: 500 }
    );
  }
}
