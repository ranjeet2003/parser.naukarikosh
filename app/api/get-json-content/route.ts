import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'json', 'details', 'jobDetailPage-json', filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonContent = JSON.parse(fileContent);
    return NextResponse.json(jsonContent);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return NextResponse.json({ error: 'Failed to read JSON file.' }, { status: 500 });
  }
}
