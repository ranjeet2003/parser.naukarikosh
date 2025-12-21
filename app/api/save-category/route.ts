
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { category, jsonData } = await req.json();

    if (!category || !jsonData) {
      return NextResponse.json({ error: 'category and jsonData are required' }, { status: 400 });
    }

    const dirPath = path.join(process.cwd(), 'json');
    await fs.mkdir(dirPath, { recursive: true });

    const filename = `${category}_${Date.now()}.json`;
    const filePath = path.join(dirPath, filename);

    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

    return NextResponse.json({ success: true, message: `File saved to ${filePath}` });
  } catch (error: any) {
    console.error('Backend error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save JSON file.' },
      { status: 500 }
    );
  }
}
