import { NextResponse } from 'next/server';

/**
 * GET /api/speech/token
 *
 * Ephemeral Security Token Exchange for Azure Cognitive Speech.
 *
 * Security Architecture:
 * - Direct Azure Speech subscription keys are kept strictly in server-side environment variables.
 * - This endpoint issues a short-lived (10-minute) authorization token via Azure STS.
 * - The browser client uses this token to connect to the Azure Speech WebSocket without
 *   ever possessing or leaking the underlying subscription key.
 */
export async function GET(request: Request) {
  const speechKey =
    request.headers.get('x-speech-key') ||
    process.env.AZURE_SPEECH_KEY ||
    process.env.FOUNDRY_API_KEY;
  const speechRegion =
    request.headers.get('x-speech-region') ||
    process.env.AZURE_SPEECH_REGION ||
    'koreacentral';

  if (!speechKey || !speechRegion || speechKey.includes('your_azure_speech_key')) {
    return NextResponse.json({
      mock: true,
      message: 'Azure Speech credentials not set; client will use Web Speech / Demo Mode.',
    });
  }

  try {
    const fetchTokenRes = await fetch(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!fetchTokenRes.ok) {
      return NextResponse.json(
        { mock: true, error: 'Failed to issue Azure Speech token' },
        { status: 502 }
      );
    }

    const token = await fetchTokenRes.text();
    return NextResponse.json({
      token,
      region: speechRegion,
      mock: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { mock: true, error: err.message || 'Error communicating with Azure STS' },
      { status: 500 }
    );
  }
}
