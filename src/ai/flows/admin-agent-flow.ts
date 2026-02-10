'use server';

import { generateText } from '@/ai/genkit';

export type AdminAgentInput = { query: string };
export type AdminAgentOutput = string;

export async function adminAgent(input: AdminAgentInput): Promise<AdminAgentOutput> {
  const prompt = `You are a helpful AI assistant for the administrators of the "ElonTradeX" platform.

Your role is to provide clear and concise answers about the functionalities of the admin panel based *only* on the information provided below. Do not invent features.

***

## ElonTradeX Admin Panel Information

**Core Purpose:**
The admin panel is the central hub for managing the ElonTradeX platform, its users, and its core settings.

**Key Features:**

*   **Dashboard:**
    *   Provides a high-level overview of key metrics.
    *   Displays: Total Users, Signups in the last 24 hours, Pending Withdrawals, and Total Transactions.

*   **User Management:**
    *   View a list of all registered users.
    *   Search for users by name or email.
    *   Edit individual user details, including:
        *   **Balance:** Modify the user's account balance (in USD).
        *   **Wallet Address:** Update the user's primary wallet address. This will also update their deposit QR code.
        *   **Transactions:** Manually add or remove transaction records (Deposit, Withdrawal, Bonus) for a user.

*   **Withdrawal Requests:**
    *   Review all pending withdrawal requests from users.
    *   Each request shows the user ID, asset, amount, and destination address.
    *   Admins can **Approve** or **Decline** each request. The status is updated accordingly.

*   **Broadcast Messages:**
    *   Send site-wide announcements or messages to all registered users simultaneously.

*   **Site Settings:**
    *   Manage global settings for the platform.
    *   The primary function is to update the **Main Wallet Deposit Address (BTC)**. This is the address shown to all users for making deposits.

***

Admin's Question: ${input.query}
`;

  try {
    return await generateText(prompt);
  } catch {
    return "Sorry, I am unable to answer that at the moment. Please refer to the documentation or contact support.";
  }
}
