import { NextResponse } from 'next/server';
import { getFoundryService } from '@/services/foundry/foundryFactory';
import { CandidateContext, Question, Answer } from '@/types/interview';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const context: CandidateContext = body.context;
    const questions: Question[] = body.questions || [];
    const answers: Answer[] = body.answers || [];

    const customEndpoint = request.headers.get('x-foundry-endpoint') || undefined;
    const customApiKey = request.headers.get('x-foundry-key') || undefined;
    const customModel = request.headers.get('x-foundry-model') || undefined;

    const foundry = getFoundryService(body.forceDemo, {
      endpoint: customEndpoint,
      apiKey: customApiKey,
      model: customModel,
    });
    const feedback = await foundry.generateFeedbackReport(context, questions, answers);

    return NextResponse.json({ feedback });
  } catch (err: any) {
    console.error('[API /interviews/[id]/finish] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate rehearsal feedback report' },
      { status: 500 }
    );
  }
}
