'use server';

import { generateText } from '@/ai/genkit';

export type GenerateMockPurchaseNotificationInput = Record<string, never>;
export type GenerateMockPurchaseNotificationOutput = string;

const wealthyCountries = ['USA', 'Switzerland', 'UAE', 'Norway', 'Germany', 'Singapore', 'Japan', 'Australia', 'Canada', 'Qatar'];
const cryptoAssets = ['Bitcoin', 'Ethereum', 'USDT', 'XRP', 'Cardano', 'Solana', 'Dogecoin'];

export async function generateMockPurchaseNotification(): Promise<GenerateMockPurchaseNotificationOutput> {
  const prompt = `Generate a realistic, mock crypto purchase notification.

Instructions:
1.  **Select a Country:** Choose one country from this list: ${wealthyCountries.join(', ')}.
2.  **Select an Asset:** Choose one cryptocurrency from this list: ${cryptoAssets.join(', ')}.
3.  **Generate an Amount:** Create a random, substantial-looking purchase amount suitable for the chosen asset (e.g., 0.5-2 for BTC, 10-50 for ETH, 50,000-250,000 for USDT/DOGE).
4.  **Create a Message:** Combine the information into a short notification message.

Example Format: "A new purchase of [AMOUNT] [ASSET] was just made from [COUNTRY]."

Example 1: "A new purchase of 1.25 BTC was just made from Switzerland."
Example 2: "A new purchase of 150,000 DOGE was just made from USA."
Example 3: "A new purchase of 75,000 USDT was just made from UAE."

Return ONLY the notification message, nothing else.`;

  try {
    return await generateText(prompt);
  } catch {
    // Fallback to a static notification if AI fails
    const country = wealthyCountries[Math.floor(Math.random() * wealthyCountries.length)];
    const asset = cryptoAssets[Math.floor(Math.random() * cryptoAssets.length)];
    const amount = (Math.random() * 100 + 1).toFixed(2);
    return `A new purchase of ${amount} ${asset} was just made from ${country}.`;
  }
}
