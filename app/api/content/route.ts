import { NextRequest, NextResponse } from 'next/server';
import { getContent, saveContent } from '../../../lib/content';
import { timingSafeEqual } from 'node:crypto';
import type { PortfolioContent } from '../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  return NextResponse.json(getContent(), { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: NextRequest) {
  const required = process.env.CMS_PASSWORD;
  if (!required) return NextResponse.json({ error: 'CMS_PASSWORD is not configured on the server.' }, { status: 503 });
  const supplied = request.headers.get('x-cms-password') ?? '';
  const a = Buffer.from(required); const b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: 'Incorrect CMS password.' }, { status: 401 });
  return NextResponse.json({ ok: true });
}
export async function PUT(request: NextRequest) {
  const required = process.env.CMS_PASSWORD;
  if (!required) return NextResponse.json({ error: 'CMS_PASSWORD is not configured on the server.' }, { status: 503 });
  const supplied = request.headers.get('x-cms-password') ?? '';
  const a = Buffer.from(required); const b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: 'Incorrect CMS password.' }, { status: 401 });
  try {
    const value = await request.json() as PortfolioContent;
    if (!value || typeof value !== 'object' || !value.profile || !Array.isArray(value.projects) || !Array.isArray(value.experience)) {
      return NextResponse.json({ error: 'Invalid portfolio content structure.' }, { status: 400 });
    }
    saveContent(value);
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: 'Unable to save the content file.' }, { status: 400 });
  }
}
