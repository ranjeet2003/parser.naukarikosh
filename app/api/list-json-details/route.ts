import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const dirPath = path.join(process.cwd(), 'json', 'details', 'jobDetailPage-json');
    const files = await fs.readdir(dirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    return NextResponse.json({ files: jsonFiles });
  } catch (error) {
    console.error('Error reading JSON details directory:', error);
    return NextResponse.json({ error: 'Failed to list JSON files.' }, { status: 500 });
  }
}
