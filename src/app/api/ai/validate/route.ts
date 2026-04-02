import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { provider, apiKey, model } = await request.json();

  if (!provider || !apiKey) {
    return NextResponse.json({ error: 'Missing provider or API key' }, { status: 400 });
  }

  try {
    switch (provider) {
      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
        return NextResponse.json({ valid: true });
      }

      case 'anthropic': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'claude-sonnet-4-20250514',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'hi' }],
          }),
        });
        if (res.status === 401) return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
        return NextResponse.json({ valid: true });
      }

      case 'google': {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        );
        if (!res.ok) return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
        return NextResponse.json({ valid: true });
      }

      case 'mistral': {
        const res = await fetch('https://api.mistral.ai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
        return NextResponse.json({ valid: true });
      }

      case 'groq': {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
        return NextResponse.json({ valid: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}
