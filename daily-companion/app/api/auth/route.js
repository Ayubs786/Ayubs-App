import { NextResponse } from 'next/server';
import { makeAuthCookie, isAuthenticated, AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from '@/lib/auth';

export async function POST(request) {
  const body = await request.json();
  const { password } = body;
  if (!password || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ ok: false, error: 'Wrong password' }, { status: 401 });
  }
  const cookieValue = makeAuthCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return res;
}

export async function GET() {
  return NextResponse.json({ authenticated: isAuthenticated() });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE_NAME);
  return res;
}
