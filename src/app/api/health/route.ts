import { NextResponse } from 'next/server';
import { getGraphQLUrl } from '@/lib/wordpress';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  const wordpressApiUrl = getGraphQLUrl();

  return NextResponse.json(
    {
      status: 'healthy',
      timestamp,
      uptime,
      service: 'blfa-frontend',
      version: '1.0.0',
      wordpressApiUrl,
      nodeVersion: process.version,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
