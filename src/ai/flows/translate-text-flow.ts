'use server';

import { generateText } from '@/ai/genkit';

export type TranslateTextInput = { text: string; targetLanguage: string };
export type TranslateTextOutput = string;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const prompt = `Translate the following text into ${input.targetLanguage}.

Text to translate:
"${input.text}"

Return only the translated text.`;

  return await generateText(prompt);
}
