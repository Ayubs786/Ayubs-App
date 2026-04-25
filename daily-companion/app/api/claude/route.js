import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, maxTokens = 2000 } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    return NextResponse.json({ text });
  } catch (e) {
    console.error('Claude API error:', e);
    return NextResponse.json(
      { error: e.message || 'Claude API call failed' },
      { status: 500 }
    );
  }
}
