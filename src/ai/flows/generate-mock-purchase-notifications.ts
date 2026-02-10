'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating mock purchase notifications from wealthy countries.
 *
 * The flow takes no input and returns a string containing a mock purchase notification.
 * - generateMockPurchaseNotification - A function that generates a mock purchase notification.
 * - GenerateMockPurchaseNotificationInput - The input type for the generateMockPurchaseNotification function (empty object).
 * - GenerateMockPurchaseNotificationOutput - The return type for the generateMockPurchaseNotification function (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMockPurchaseNotificationInputSchema = z.object({
  wealthyCountries: z.array(z.string()).optional().describe("List of wealthy countries to use in the notification."),
  cryptoAssets: z.array(z.string()).optional().describe("List of crypto assets to use in the notification."),
});
export type GenerateMockPurchaseNotificationInput = z.infer<typeof GenerateMockPurchaseNotificationInputSchema>;

const GenerateMockPurchaseNotificationOutputSchema = z.string();
export type GenerateMockPurchaseNotificationOutput = z.infer<typeof GenerateMockPurchaseNotificationOutputSchema>;

export async function generateMockPurchaseNotification(): Promise<GenerateMockPurchaseNotificationOutput> {
  return generateMockPurchaseNotificationFlow({});
}

const wealthyCountries = ['USA', 'Switzerland', 'UAE', 'Norway', 'Germany', 'Singapore', 'Japan', 'Australia', 'Canada', 'Qatar'];
const cryptoAssets = ['Bitcoin', 'Ethereum', 'USDT', 'XRP', 'Cardano', 'Solana', 'Dogecoin'];

const prompt = ai.definePrompt({
  name: 'generateMockPurchaseNotificationPrompt',
  input: {schema: GenerateMockPurchaseNotificationInputSchema},
  output: {schema: GenerateMockPurchaseNotificationOutputSchema},
  prompt: `Generate a realistic, mock crypto purchase notification.

Instructions:
1.  **Select a Country:** Choose one country from this list: {{{wealthyCountries}}}.
2.  **Select an Asset:** Choose one cryptocurrency from this list: {{{cryptoAssets}}}.
3.  **Generate an Amount:** Create a random, substantial-looking purchase amount suitable for the chosen asset (e.g., 0.5-2 for BTC, 10-50 for ETH, 50,000-250,000 for USDT/DOGE).
4.  **Create a Message:** Combine the information into a short notification message.

Example Format: "A new purchase of [AMOUNT] [ASSET] was just made from [COUNTRY]."

Example 1: "A new purchase of 1.25 BTC was just made from Switzerland."
Example 2: "A new purchase of 150,000 DOGE was just made from USA."
Example 3: "A new purchase of 75,000 USDT was just made from UAE."
`, 
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateMockPurchaseNotificationFlow = ai.defineFlow(
  {
    name: 'generateMockPurchaseNotificationFlow',
    inputSchema: GenerateMockPurchaseNotificationInputSchema,
    outputSchema: GenerateMockPurchaseNotificationOutputSchema,
  },
  async () => {
    const {text} = await prompt({wealthyCountries, cryptoAssets});
    return text!;
  }
);
