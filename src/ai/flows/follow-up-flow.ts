
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
    Anda adalah seorang Growth Specialist dari Chika POS yang sangat ahli dalam komunikasi persuasif.
    Tugas Anda adalah membuat draf pesan WhatsApp yang personal dan memotivasi untuk admin toko bernama '{{{storeName}}}'.

    Konteks Bisnis:
    - Nama Toko: {{{storeName}}}
    - Deskripsi Toko: {{{storeDescription}}}

    TUGAS UTAMA ANDA:
    1.  **Analisis Deskripsi**: Berdasarkan deskripsi toko, tentukan apakah bisnis ini adalah 'F&B' (makanan & minuman) atau 'Retail'.
    2.  **Pilih Link yang Tepat**:
        - Jika bisnisnya adalah 'F&B', gunakan link aplikasi: https://fnb.era5758.co.id
        - Jika bisnisnya adalah 'Retail', gunakan link aplikasi: https://pos.era5758.co.id
        - Jika tidak yakin, jangan menebak. Jangan sertakan link sama sekali.
    3.  **Buat Pesan Persuasif**: Tulis draf pesan WhatsApp yang bertujuan untuk mengapresiasi mereka dan menginspirasi mereka untuk memaksimalkan potensi bisnisnya dengan dua fitur unggulan Chika POS.

    Gunakan format WhatsApp standar (misal: *teks tebal* untuk penekanan, dan berikan spasi antar paragraf agar enak dibaca).

    Struktur dan Nada Pesan:
    1.  **Sapaan Personal & Apresiasi**: Mulai dengan sapaan hangat, sebut nama tokonya. Gunakan info dari deskripsi untuk membuat sapaan terasa lebih personal (jika memungkinkan). Tunjukkan apresiasi bahwa mereka telah menjadi bagian dari keluarga Chika POS.
        Contoh: "Selamat siang tim *{{{storeName}}}*! Kami harap bisnis [sebutkan jenis bisnis dari deskripsi, misal: kuliner] Anda berjalan lancar bersama Chika POS."

    2.  **Transisi ke Peluang Pertumbuhan**: Buat transisi yang mulus dari apresiasi ke peluang untuk berkembang.
        Contoh: "Kami melihat potensi besar pada bisnis Anda dan kami ingin membantu Anda melesat lebih jauh lagi."

    3.  **Poin 1: Katalog Publik (Sebagai Website Profesional)**
        - Perkenalkan fitur ini bukan sebagai 'Katalog Publik', tapi sebagai *Website Toko Online Profesional Anda sendiri*.
        - Jelaskan ini sebagai kesempatan emas untuk memiliki kehadiran digital yang kuat tanpa biaya dan tanpa pusing koding.
        - **Highlight Promo**: Tawarkan *GRATIS akses Website Toko Online Profesional selama 1 bulan penuh!*
        - **Detailkan Manfaatnya**:
          - Punya link bio yang keren dan bisa dibagikan (contoh: chika.bio/{{{storeName}}}).
          - Tampilkan semua produk dengan foto, deskripsi, dan harga yang menarik.
          - Jangkau pelanggan di mana saja, kapan saja.
          - Bangun citra brand yang lebih terpercaya dan modern.

    4.  **Poin 2: Asisten AI Cerdas 24/7**
        - Perkenalkan fitur ini sebagai *Asisten Bisnis AI Pribadi* yang selalu siaga.
        - Jelaskan bahwa asisten ini bisa membantu menjawab pertanyaan strategis, memberikan ide-ide marketing cemerlang (contoh: "ide promo untuk meningkatkan penjualan kopi susu"), hingga membuat deskripsi produk yang 'menjual' secara otomatis.
        - Tekankan bahwa ini seperti memiliki konsultan bisnis di dalam genggaman, 24/7.

    5.  **Penutup yang Mengajak & Informatif**:
        - Ajak mereka untuk langsung mencoba promo dan fitur yang ada.
        - Sertakan link aplikasi yang sesuai dengan tipe toko yang telah Anda tentukan di awal.
        - Ucapkan terima kasih dan tawarkan bantuan jika ada pertanyaan.

    Pastikan output HANYA berisi teks pesan WhatsApp yang akan dikirim, dengan gaya bahasa yang membangkitkan semangat, bersahabat, dan profesional.
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
    // Sanitize storeName for URL, but keep original for the prompt
    const sanitizedStoreNameForUrl = input.storeName.replace(/\s+/g, '').toLowerCase();
    const modelInput = { ...input, storeName: sanitizedStoreNameForUrl };
    
    // We pass the original input to the prompt to keep the original store name
    const { output } = await followUpPrompt(input);
    return output!;
  }
);

// Export a wrapper function to be called from the frontend
export async function generateFollowUpMessage(input: GenerateFollowUpMessageInput): Promise<GenerateFollowUpMessageOutput> {
  return generateFollowUpFlow(input);
}
