import { NextResponse } from 'next/server';
import { getFoundryService } from '@/services/foundry/foundryFactory';
import { CandidateContext, Question, Answer } from '@/types/interview';

/**
 * POST /api/interviews/[id]/answer
 *
 * Evaluates candidate's spoken or typed answer in real time.
 *
 * Steps:
 * 1. Validates answer transcript and matching question payload.
 * 2. Invokes Microsoft Foundry to extract entities, verify trade-offs, and assess depth.
 * 3. Formulates either an adaptive follow-up question or a wrap-up action.
 * 4. Returns the decision payload ({ evaluation, action, questionText, topic, difficulty }).
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const context: CandidateContext = body.context;
    const previousQuestions: Question[] = body.previousQuestions || [];
    const previousAnswers: Answer[] = body.previousAnswers || [];
    const latestAnswer: Answer = body.latestAnswer;
    const currentQuestion: Question = body.currentQuestion;

    if (!latestAnswer || !currentQuestion) {
      return NextResponse.json(
        { error: 'Missing answer or question payload' },
        { status: 400 }
      );
    }

    const customEndpoint = request.headers.get('x-foundry-endpoint') || undefined;
    const customApiKey = request.headers.get('x-foundry-key') || undefined;
    const customModel = request.headers.get('x-foundry-model') || undefined;

    const foundry = getFoundryService(body.forceDemo, {
      endpoint: customEndpoint,
      apiKey: customApiKey,
      model: customModel,
    });
    const decision = await foundry.evaluateAndGenerateNext(
      context,
      previousQuestions,
      previousAnswers,
      latestAnswer,
      currentQuestion,
      body.elapsedSeconds
    );

    return NextResponse.json(decision);
  } catch (err: any) {
    console.error('[API /interviews/[id]/answer] Error:', err);
    return NextResponse.json(
      { error: 'Failed to process answer evaluation' },
      { status: 500 }
    );
  }
}
