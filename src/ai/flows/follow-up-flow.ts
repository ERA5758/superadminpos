
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
    Anda adalah seorang Business Development Specialist yang ramah dan sangat persuasif untuk Chika POS.
    Tugas Anda adalah membuat draf pesan WhatsApp untuk admin toko bernama '{{{storeName}}}'.

    Tujuan pesan ini adalah untuk mendorong mereka menjelajahi fitur-fitur unggulan Chika POS yang mungkin belum mereka manfaatkan sepenuhnya.

    Gunakan format WhatsApp (misal: *teks tebal* untuk penekanan) dan berikan spasi antar paragraf agar mudah dibaca.

    Struktur pesan:
    1.  Sapaan ramah: "Halo tim *{{{storeName}}}*!"
    2.  Paragraf pengantar singkat yang menarik.
    3.  Poin pertama tentang *Katalog Publik* dengan penawaran spesial. Jelaskan dengan sangat menarik bahwa ini adalah kesempatan emas untuk punya website toko online sendiri.
        - Sebutkan ada *promo spesial: GRATIS akses Katalog Publik selama 1 bulan penuh!*
        - Jelaskan ini sebagai 'etalase digital profesional' mereka, yang bisa diakses lewat link unik (contoh: chika.bio/namatoko).
        - Detailkan manfaatnya: upload produk dengan foto dan deskripsi menarik, jangkau pelanggan online lebih luas, dan terlihat lebih kredibel tanpa perlu pusing coding sama sekali.
    4.  Poin kedua tentang *Asisten AI*. Sebutkan bahwa ada asisten AI personal yang siap membantu 24/7 untuk menjawab pertanyaan seputar bisnis, memberikan ide-ide marketing, atau bahkan membuat deskripsi produk yang menjual.
    5.  Paragraf penutup dengan ajakan kuat untuk mencoba promo dan fitur yang ada, serta ucapan terima kasih.

    Buat pesan dengan gaya bahasa yang santai, bersahabat, penuh semangat, namun tetap profesional.
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
