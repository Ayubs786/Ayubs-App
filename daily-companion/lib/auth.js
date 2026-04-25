import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'dc_auth';
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function makeAuthCookie() {
  const secret = process.env.AUTH_SECRET || 'fallback-please-set-env';
  const issued = Date.now().toString();
  const sig = sign(issued, secret);
  return `${issued}.${sig}`;
}

export function verifyAuthCookie(value) {
  if (!value) return false;
  const secret = process.env.AUTH_SECRET || 'fallback-please-set-env';
  const [issued, sig] = value.split('.');
  if (!issued || !sig) return false;
  const expected = sign(issued, secret);
  if (sig !== expected) return false;
  const age = (Date.now() - parseInt(issued, 10)) / 1000;
  if (age > SEVEN_DAYS) return false;
  return true;
}

export function isAuthenticated() {
  const c = cookies().get(COOKIE_NAME);
  return verifyAuthCookie(c?.value);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;
export const AUTH_COOKIE_MAX_AGE = SEVEN_DAYS;
