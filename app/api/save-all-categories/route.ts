
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface CategoryData {
  mainContent?: Record<string, any>;
  [key: string]: any;
}

export async function POST(req: Request) {
  try {
    const { jsonData }: { jsonData: CategoryData } = await req.json();

    if (!jsonData) {
      return NextResponse.json({ error: 'jsonData is required' }, { status: 400 });
    }

    const dirPath = path.join(process.cwd(), 'json');
    await fs.mkdir(dirPath, { recursive: true });

    const categories = jsonData.mainContent ? jsonData.mainContent : jsonData;

    for (const category in categories) {
      if (Object.prototype.hasOwnProperty.call(categories, category)) {
        const filename = `${category}_${Date.now()}.json`;
        const filePath = path.join(dirPath, filename);
        await fs.writeFile(filePath, JSON.stringify(categories[category], null, 2));
      }
    }

    return NextResponse.json({ success: true, message: `All categories saved to the json folder.` });
  } catch (error: any) {
    console.error('Backend error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save JSON files.' },
      { status: 500 }
    );
  }
}
