// Lightweight Google Generative AI helper (replaces genkit)
const GOOGLE_AI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || '';
const DEFAULT_MODEL = 'gemini-2.0-flash';

export async function generateText(prompt: string, model: string = DEFAULT_MODEL): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_AI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error('Google AI API error:', res.status, errorBody);
    throw new Error(`Google AI API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text generated from Google AI API');
  }

  return text.trim();
}
