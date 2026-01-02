import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'json', filename);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ success: true, message: `File ${filename} deleted successfully` });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Backend error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete JSON file.' },
      { status: 500 }
    );
  }
}
