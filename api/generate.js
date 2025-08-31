// Import library resmi dari OpenAI
// Anda perlu menginstalnya nanti jika menjalankan secara lokal dengan "npm install openai"
import OpenAI from 'openai';

// Inisialisasi OpenAI dengan API key Anda
// PENTING: Key ini akan kita simpan di Vercel, bukan di sini.
// Proses 'process.env.OPENAI_API_KEY' akan mengambilnya secara aman.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ini adalah fungsi utama back-end kita
export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Ambil semua pilihan pengguna dari permintaan yang dikirim oleh front-end
    const { mode, topic, tone, length, platform } = req.body;

    // --- Di sinilah "keajaiban" merangkai prompt terjadi ---
    let systemPrompt = "You are an expert social media content creator for an Indonesian audience. You are creative, witty, and understand cultural nuances.";
    let userPrompt = "";

    if (mode === 'image-text') {
      userPrompt = `Generate 3 short, impactful, and aesthetic quotes for an image. The mood is "${tone}". The topic is "${topic}". Each quote must be a maximum of 7 words. Return the response as a JSON array of strings.`;
    } else { // mode 'caption'
      userPrompt = `Generate a social media caption for ${platform}. 
      The topic is "${topic}". 
      The tone must be "${tone}". 
      The length must be "${length}". 
      Also, provide relevant hashtags. 
      Return the response as a single JSON object with two keys: "caption" and "hashtags". The hashtags should be a single string with each hashtag starting with #.`;
    }

    // Panggil API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gemini-2.5-flash-preview-05-20", // Model yang efisien dan cepat
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }, // Meminta hasil dalam format JSON
    });
    
    // Ambil hasil dari OpenAI dan kirim kembali ke front-end
    const result = JSON.parse(completion.choices[0].message.content);
    res.status(200).json(result);

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
}
