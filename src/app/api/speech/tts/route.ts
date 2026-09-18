import { NextResponse } from 'next/server';

const AZURE_VOICE_MAP: Record<string, string> = {
  jenny: 'en-US-JennyNeural',
  guy: 'en-US-GuyNeural',
  aria: 'en-US-AriaNeural',
  davis: 'en-US-DavisNeural',
  ava: 'en-US-AvaMultilingualNeural',
  andrew: 'en-US-AndrewMultilingualNeural',
  sonia: 'en-GB-SoniaNeural',
  ryan: 'en-GB-RyanNeural',
};

function resolveAzureVoice(voiceName?: string): string {
  if (!voiceName || voiceName.toLowerCase().includes('auto')) {
    return 'en-US-JennyNeural';
  }
  if (voiceName.includes('Neural')) {
    return voiceName;
  }
  const lower = voiceName.toLowerCase();
  for (const [key, val] of Object.entries(AZURE_VOICE_MAP)) {
    if (lower.includes(key)) return val;
  }
  return 'en-US-JennyNeural';
}

function cleanTextForSSML(text: string): string {
  return text
    .replace(/[`*_~#>[\]()]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = body.text;
    const requestedVoice = body.voice;

    if (!rawText || typeof rawText !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const cleanedText = cleanTextForSSML(rawText);
    if (!cleanedText) {
      return NextResponse.json({ error: 'Text parameter is empty' }, { status: 400 });
    }

    const speechKey =
      request.headers.get('x-speech-key') ||
      process.env.AZURE_SPEECH_KEY ||
      process.env.FOUNDRY_API_KEY;

    const speechRegion =
      request.headers.get('x-speech-region') ||
      process.env.AZURE_SPEECH_REGION ||
      'koreacentral';

    if (!speechKey) {
      return NextResponse.json(
        { error: 'Speech key is not configured' },
        { status: 503 }
      );
    }

    const voiceName = resolveAzureVoice(requestedVoice);

    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='en-US'>
  <voice name='${voiceName}'>
    <break time='350ms'/>
    <mstts:express-as style='chat'>
      ${cleanedText}
    </mstts:express-as>
  </voice>
</speak>`;

    const ttsUrl = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const res = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
        'User-Agent': 'Rehearse-AI-Interview',
      },
      body: ssml,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[API/speech/tts] Azure TTS returned error:', res.status, errText);
      return NextResponse.json(
        { error: `Azure TTS failed with status ${res.status}: ${errText}` },
        { status: res.status }
      );
    }

    const audioBuffer = await res.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('[API/speech/tts] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error synthesizing speech' },
      { status: 500 }
    );
  }
}
