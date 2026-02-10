
"use server";

import { z } from "zod";
import { generateMockPurchaseNotification } from "@/ai/flows/generate-mock-purchase-notifications";
import { supportChat } from "@/ai/flows/support-chat-flow";
import { sendWelcomeEmail, sendWithdrawalRequestEmail } from "@/lib/email";
import type { User, Transaction } from "@/lib/types";

const withdrawalSchema = z.object({
  amount: z.coerce.number().positive(),
  asset: z.string(),
  address: z.string().min(10),
});

type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;


export async function submitWithdrawalRequest(values: WithdrawalFormValues, user: User) {
    const parsed = withdrawalSchema.safeParse(values);

    if (!parsed.success) {
      return { success: false, error: "Invalid data provided." };
    }

    try {
      const withdrawalData = parsed.data;

      // In a real app, you would use the authenticated user's ID.
      await sendWithdrawalRequestEmail({
          userId: user.id,
          userName: user.name,
          amount: withdrawalData.amount,
          asset: withdrawalData.asset.toUpperCase(),
          address: withdrawalData.address
      });
      
      return { success: true, message: "Withdrawal request submitted." };

    } catch (error: any) {
        console.error("Error submitting withdrawal request:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}


export async function getMockNotification() {
  try {
    const notification = await generateMockPurchaseNotification();
    return { success: true, notification };
  } catch (error) {
    // Silently fail if Genkit isn't running or rate-limited
    // console.error("Error generating mock notification:", error);
    return { success: false, error: "Failed to generate notification." };
  }
}

export async function triggerWelcomeEmail(data: { to: string; name: string }) {
  try {
    await sendWelcomeEmail(data);
    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false };
  }
}

export async function submitAdminAgentQuery(query: string) {
  try {
    const { adminAgent } = await import("@/ai/flows/admin-agent-flow");
    const response = await adminAgent({ query });
    return { success: true, response };
  } catch (error) {
    console.error("Error querying admin agent:", error);
    return { success: false, error: "Failed to get response from admin agent." };
  }
}

const supportChatSchema = z.object({
    message: z.string(),
});

export async function submitSupportMessage(values: z.infer<typeof supportChatSchema>) {
    const parsed = supportChatSchema.safeParse(values);
    if (!parsed.success) {
        return { success: false, error: "Invalid message" };
    }
    try {
        const response = await supportChat(parsed.data);
        return { success: true, response };
    } catch (error) {
        console.error("Error getting support response:", error);
        return { success: false, error: "Failed to get response from support bot." };
    }
}
