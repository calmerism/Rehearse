import { NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Limit to 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB' },
        { status: 400 }
      );
    }

    const filename = file.name || 'resume';
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    if (extension === 'pdf') {
      try {
        const { text } = await extractText(new Uint8Array(buffer));
        extractedText = Array.isArray(text) ? text.join('\n') : (text || '');
      } catch (pdfErr) {
        console.warn('[unpdf Error]', pdfErr);
        extractedText = buffer.toString('utf-8');
      }
    } else if (extension === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } else {
      // Fallback: attempt UTF-8 string decoding
      try {
        extractedText = buffer.toString('utf-8');
      } catch {
        return NextResponse.json(
          { error: `Unsupported file format: .${extension}. Please upload a PDF, DOCX, or TXT file.` },
          { status: 400 }
        );
      }
    }

    // Clean up text: collapse excessive empty lines and spaces
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 20) {
      return NextResponse.json(
        { error: 'Could not extract sufficient text from this file. Please ensure the document contains readable text.' },
        { status: 422 }
      );
    }

    // Cap text to 15,000 characters to prevent excessive token consumption
    const truncatedText = cleanedText.slice(0, 15000);

    return NextResponse.json({
      success: true,
      filename,
      fileSize: file.size,
      characterCount: truncatedText.length,
      text: truncatedText,
      preview: truncatedText.slice(0, 200) + (truncatedText.length > 200 ? '...' : ''),
    });
  } catch (err: any) {
    console.error('[API /resume/parse] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to parse resume file' },
      { status: 500 }
    );
  }
}
