import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This route serves the favicon.ico file
export async function GET() {
  try {
    // Use SVG file since we don't have an ico file
    const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
    const svgContent = fs.readFileSync(svgPath);

    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to serve favicon' },
      { status: 500 }
    );
  }
} 