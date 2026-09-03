import { NextRequest, NextResponse } from 'next/server';

/**
 * 동의 기록에 남길 접속 IP를 돌려줍니다.
 * 개인정보보호법상 동의 시점의 접속 정보를 함께 보관하기 위한 용도입니다.
 * Vercel이 붙여주는 x-forwarded-for를 기준으로 하며, 프록시 환경에서는 정확하지 않을 수 있습니다.
 */
export async function GET(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
  return NextResponse.json({ ip });
}
