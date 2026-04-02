import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

interface EditRequest {
  provider: string;
  apiKey?: string;
  model?: string;
  prompt: string;
  documentText: string;
  selectedText?: string;
  subscription?: boolean;
  customerId?: string;
}

const SYSTEM_PROMPT = `You are an expert writing assistant inside a document editor. The user will give you a writing instruction and either the full document or a selected portion of text.

Your job is to propose specific text edits. Return your response as a JSON object with this exact structure:

{
  "summary": "Brief 1-sentence description of what you changed",
  "changes": [
    {
      "label": "Short label for this change (e.g. 'Tightened intro', 'Added bullet list')",
      "before": "The exact original text being replaced (must be a substring of the input)",
      "after": "The replacement text"
    }
  ]
}

Rules:
- Each "before" value MUST be an exact substring of the provided document/selection text.
- Keep changes focused and reviewable — prefer several small changes over one giant replacement.
- If the user asks to insert new content, use an empty string "" for "before" and include the new content in "after", with the "label" describing the insertion point.
- Return ONLY the JSON object, no markdown fences, no explanation outside the JSON.`;

async function callOpenAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

async function callGoogle(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
      }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callMistral(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGroq(apiKey: string, model: string, systemPrompt: string, userPrompt: string) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

const callers: Record<string, typeof callOpenAI> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  google: callGoogle,
  mistral: callMistral,
  groq: callGroq,
};

async function resolvePlatformCredentials(customerId: string): Promise<{ provider: string; apiKey: string; model: string } | null> {
  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
    if (subs.data.length === 0) return null;
  } catch {
    return null;
  }

  const key = process.env.PLATFORM_OPENAI_KEY;
  const model = process.env.PLATFORM_OPENAI_MODEL || 'gpt-4o';
  if (!key) return null;

  return { provider: 'openai', apiKey: key, model };
}

export async function POST(request: NextRequest) {
  const body: EditRequest = await request.json();
  const { prompt, documentText, selectedText } = body;
  let { provider, apiKey, model } = body;

  if (body.subscription && body.customerId) {
    const platform = await resolvePlatformCredentials(body.customerId);
    if (!platform) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe to Pro or provide your own API key.' },
        { status: 403 },
      );
    }
    provider = platform.provider;
    apiKey = platform.apiKey;
    model = platform.model;
  }

  if (!provider || !apiKey) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 400 });
  }

  const caller = callers[provider];
  if (!caller) {
    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  }

  const userPrompt = selectedText
    ? `Document context:\n"""\n${documentText}\n"""\n\nSelected text to edit:\n"""\n${selectedText}\n"""\n\nInstruction: ${prompt}`
    : `Document:\n"""\n${documentText}\n"""\n\nInstruction: ${prompt}`;

  try {
    const raw = await caller(apiKey!, model!, SYSTEM_PROMPT, userPrompt);

    let parsed: { summary: string; changes: { label: string; before: string; after: string }[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    const changeSetId = crypto.randomUUID();
    const changeSet = {
      id: changeSetId,
      status: 'proposed',
      prompt,
      model,
      summary: parsed.summary || `AI processed: "${prompt}"`,
      items: (parsed.changes || []).map((change, idx) => ({
        id: crypto.randomUUID(),
        changeSetId,
        anchorPath: `content[${idx}]`,
        beforeFragment: change.before || '',
        afterFragment: change.after || '',
        changeType: change.before ? 'replace' : 'insert',
        status: 'pending',
        label: change.label || `Change ${idx + 1}`,
        orderIndex: idx,
      })),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(changeSet, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
