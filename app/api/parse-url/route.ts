import { NextResponse } from 'next/server';
import axios from 'axios';
import { convertHtmlToJson } from '@/lib/gemini';

// CRITICAL: This ensures the API route is always dynamic and not statically optimized,
// resolving the "Page with dynamic = 'error' couldn't be rendered statically because it used request.json" error.
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const htmlContent = response.data;

    // 2. Send HTML to Gemini AI for conversion
    const jsonOutput = await convertHtmlToJson(htmlContent);

    // In a real application, you might save jsonOutput to a database here.
    // For this example, we'll just return it to the client.
    console.log('JSON output from Gemini:', JSON.stringify(jsonOutput, null, 2));

    return NextResponse.json({ success: true, data: jsonOutput });
  } catch (error: any) {
    console.error('Backend error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process URL. Ensure it is accessible and valid.' },
      { status: 500 }
    );
  }
}
