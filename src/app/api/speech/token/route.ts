import { NextResponse } from 'next/server';

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
