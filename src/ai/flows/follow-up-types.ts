
import { z } from 'genkit';

/**
 * @fileoverview Types and schemas for the AI follow-up message flow.
 */

export const GenerateFollowUpMessageInputSchema = z.object({
  storeName: z.string().describe('The name of the store to generate the message for.'),
});
export type GenerateFollowUpMessageInput = z.infer<typeof GenerateFollowUpMessageInputSchema>;

export const GenerateFollowUpMessageOutputSchema = z.object({
  message: z.string().describe('The generated WhatsApp message content.'),
});
export type GenerateFollowUpMessageOutput = z.infer<typeof GenerateFollowUpMessageOutputSchema>;
