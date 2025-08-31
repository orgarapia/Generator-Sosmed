// Ganti library dari OpenAI ke Google Generative AI
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Google AI dengan API key Anda
// PENTING: Key ini akan kita ambil dari Environment Variables di Vercel
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { mode, topic, tone, length, platform } = req.body;

    // Pilih model Gemini yang sesuai
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    // Struktur prompt untuk Gemini sedikit berbeda, lebih langsung
    let userPrompt = "";

    if (mode === 'image-text') {
      userPrompt = `Buatkan 3 kutipan pendek (maksimal 7 kata) untuk gambar dengan mood "${tone}" dan topik "${topic}". Kembalikan jawaban HANYA sebagai objek JSON dengan satu kunci "imageTexts" yang berisi array string. Contoh: {"imageTexts": ["kutipan 1", "kutipan 2", "kutipan 3"]}`;
    } else { // mode 'caption'
      userPrompt = `Buatkan caption media sosial untuk ${platform} dengan topik "${topic}", gaya bahasa "${tone}", dan panjang "${length}". Sertakan juga tagar yang relevan. Kembalikan jawaban HANYA sebagai objek JSON dengan dua kunci: "caption" dan "hashtags". Contoh: {"caption": "Ini adalah caption.", "hashtags": "#satu #dua #tiga"}`;
    }

    // Panggil API Gemini
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    
    // Mengambil teks JSON dari respons Gemini
    const text = response.text();
    
    // Kirim kembali hasil JSON ke front-end
    // Tidak perlu JSON.parse() lagi karena kita akan mengirim teks JSON mentah
    res.status(200).setHeader('Content-Type', 'application/json').send(text);

  } catch (error) {
    console.error("Error calling Google AI API:", error);
    res.status(500).json({ error: 'Failed to generate content from Google AI.' });
  }
}

