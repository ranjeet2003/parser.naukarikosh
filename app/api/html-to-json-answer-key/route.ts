import { NextRequest, NextResponse } from 'next/server';
import { convertAnswerKeyHtmlToJson } from '@/lib/gemini-answer-key';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch HTML content from the provided URL
    const htmlResponse = await fetch(url);
    if (!htmlResponse.ok) {
      throw new Error(`Failed to fetch HTML from ${url}: ${htmlResponse.statusText}`);
    }
    const htmlContent = await htmlResponse.text();

    // Convert HTML to JSON using Gemini AI for answer keys
    const jsonOutput = await convertAnswerKeyHtmlToJson(htmlContent);

    return NextResponse.json({ data: jsonOutput }, { status: 200 });
  } catch (error: any) {
    console.error('Error in /api/html-to-json-answer-key:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
