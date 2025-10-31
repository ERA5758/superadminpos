
'use server';

/**
 * @fileoverview AI flow for generating personalized follow-up messages for store admins.
 *
 * - generateFollowUpMessage: Generates a persuasive message to encourage feature exploration.
 */

import { ai } from '@/ai/genkit';
import { GenerateFollowUpMessageInput, GenerateFollowUpMessageOutput, GenerateFollowUpMessageInputSchema, GenerateFollowUpMessageOutputSchema } from './follow-up-types';


// Define the prompt for the AI
const followUpPrompt = ai.definePrompt({
  name: 'followUpMessagePrompt',
  input: { schema: GenerateFollowUpMessageInputSchema },
  output: { schema: GenerateFollowUpMessageOutputSchema },
  prompt: `
    Anda adalah seorang Business Development Specialist yang ramah dan persuasif untuk Chika POS.
    Tugas Anda adalah membuat draf pesan WhatsApp singkat untuk admin toko bernama '{{{storeName}}}'.

    Tujuan pesan ini adalah untuk mendorong mereka menjelajahi fitur-fitur unggulan Chika POS yang mungkin belum mereka manfaatkan sepenuhnya.

    Fokuskan pesan pada dua fitur utama:
    1.  **Katalog Publik**: Jelaskan bahwa ini adalah cara mudah untuk memiliki website toko online sendiri, lengkap dengan link unik, tanpa perlu coding sama sekali. Ini adalah 'etalase digital' mereka.
    2.  **Asisten AI**: Sebutkan bahwa ada asisten AI yang siap membantu 24/7 untuk menjawab pertanyaan seputar bisnis dan memberikan ide-ide baru.

    Buat pesan dengan gaya bahasa yang santai, bersahabat, namun tetap profesional.
    Mulai pesan dengan sapaan "Halo tim {{{storeName}}}!" dan akhiri dengan ajakan untuk mencoba fitur tersebut dan ucapan terima kasih.
    Pastikan output hanya berisi teks pesan yang akan dikirim.
  `,
});

// Define the flow
const generateFollowUpFlow = ai.defineFlow(
  {
    name: 'generateFollowUpFlow',
    inputSchema: GenerateFollowUpMessageInputSchema,
    outputSchema: GenerateFollowUpMessageOutputSchema,
  },
  async (input) => {
    const { output } = await followUpPrompt(input);
    return output!;
  }
);

// Export a wrapper function to be called from the frontend
export async function generateFollowUpMessage(input: GenerateFollowUpMessageInput): Promise<GenerateFollowUpMessageOutput> {
  return generateFollowUpFlow(input);
}
