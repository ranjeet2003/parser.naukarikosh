import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dirPath = path.join(process.cwd(), 'json');
  try {
    const files = fs.readdirSync(dirPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    return NextResponse.json(jsonFiles);
  } catch (error) {
    console.error('Error reading directory:', error);
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
  }
}