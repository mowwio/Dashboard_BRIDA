import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Model Priority: dicoba berurutan jika quota habis (429) ──
const MODEL_PRIORITY = [
  'gemini-2.5-flash-lite', 
  'gemini-2.0-flash-lite', 
  'gemini-2.5-flash',      
];

serve(async (req) => {

  // Preflight CORS 
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { data } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    // Ekstrak data real dari request 
    const total          = data.summary?.totalInovasi   || 0;
    const digitalCount   = data.summary?.digitalCount   || 0;
    const digitalPct     = data.summary?.digitalPercent || 0;
    const topUrusan      = data.summary?.topUrusan      || 'N/A';
    const watchlistCount = data.watchlist?.count        || 0;
    const tahun          = data.summary?.tahun          || 'Semua';

    const nonDigitalCount = data.jenisInovasi?.find((j: any) => j.jenis === 'Non Digital')?.jumlah || 0;
    const teknologiCount  = data.jenisInovasi?.find((j: any) => j.jenis === 'Teknologi')?.jumlah  || 0;

    // Hitung rata-rata & minimum skor watchlist
    const watchlistScores = (data.watchlist?.items || []).map((w: any) => w.skor || 0);
    const avgScore = watchlistScores.length > 0
      ? (watchlistScores.reduce((a: number, b: number) => a + b, 0) / watchlistScores.length).toFixed(1)
      : '0';
    const minScore = watchlistScores.length > 0 ? Math.min(...watchlistScores) : 0;

    // Format top 3 sektor untuk prompt
    const top3Urusan = (data.top5Urusan || [])
      .slice(0, 3)
      .map((u: any, i: number) => `${i+1}. ${u.nama} (total:${u.total}, penerapan:${u.breakdown?.penerapan || 0})`)
      .join(' | ');

    const topSektorPct = total > 0
      ? (((data.top5Urusan?.[0]?.total || 0) / total) * 100).toFixed(1)
      : '0';

    // Fallback: insight berbasis data real (dipakai jika AI gagal)
    const realFallback = [
      { icon: "📊", type: "info",
        text: `Dari total ${total} inovasi daerah, baru ${digitalPct}% (${digitalCount} inovasi) yang bersifat digital. Proporsi ini menunjukkan masih besarnya ruang transformasi digital yang perlu diakselerasi untuk meningkatkan efisiensi layanan publik.` },
      { icon: "🏆", type: "success",
        text: `Sektor ${topUrusan} mendominasi ${topSektorPct}% dari seluruh inovasi daerah, mencerminkan prioritas strategis yang kuat. Keberhasilan ini dapat dijadikan model replikasi bagi sektor lain yang masih tertinggal dalam pengembangan inovasi.` },
      { icon: watchlistCount > 0 ? "⚠️" : "✅",
        type: watchlistCount > 0 ? "warning" : "success",
        text: watchlistCount > 0
          ? `Terdapat ${watchlistCount} inovasi dalam watchlist dengan skor kematangan rata-rata ${avgScore} — jauh di bawah ambang batas ideal. Inovasi-inovasi ini berisiko stagnan dan perlu evaluasi mendalam serta pendampingan intensif dari BRIDA sebelum akhir kuartal ini.`
          : 'Seluruh inovasi daerah menunjukkan kinerja yang baik dengan tidak ada yang masuk watchlist. Capaian ini perlu dipertahankan melalui monitoring berkala dan dukungan pengembangan berkelanjutan.' },
      { icon: "💡", type: "info",
        text: `Kesenjangan antara ${nonDigitalCount} inovasi non-digital dan ${digitalCount} inovasi digital menunjukkan potensi besar yang belum dioptimalkan. Akselerasi digitalisasi melalui pendampingan teknis, pelatihan SDM OPD, dan alokasi anggaran transformasi digital perlu segera diprioritaskan.` },
      { icon: "🎯", type: "success",
        text: `Dengan tingkat digitalisasi saat ini di ${digitalPct}%, target realistis berikutnya adalah ${Math.min(Math.round(digitalPct) + 10, 100)}% dalam satu siklus anggaran. Pencapaian ini membutuhkan komitmen konversi minimal ${Math.round((Math.min(Math.round(digitalPct) + 10, 100) - parseFloat(digitalPct)) / 100 * total)} inovasi dari format konvensional ke platform digital.` },
    ];

    // Jika API key belum di-set, langsung return fallback 
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not set — run: npx supabase secrets set GEMINI_API_KEY=...');
      return new Response(JSON.stringify(realFallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      });
    }

    //  Prompt untuk Gemini 
    const prompt = `Berperan sebagai Senior Data Analyst BRIDA Jawa Timur yang menyajikan laporan eksekutif kepada pimpinan daerah.

Tugasmu: Buat TEPAT 5 insight strategis yang TAJAM, BERMAKNA, dan BERORIENTASI KEBIJAKAN berdasarkan data inovasi berikut.

DATA AKTUAL:
- Total inovasi: ${total} inovasi (filter tahun: ${tahun})
- Digital: ${digitalCount} (${digitalPct}%) | Non-Digital: ${nonDigitalCount} | Teknologi: ${teknologiCount}
- Sektor terbesar: ${topUrusan} = ${topSektorPct}% dari total inovasi
- Top 3 sektor: ${top3Urusan}
- Watchlist (perlu perhatian): ${watchlistCount} inovasi, skor rata-rata ${avgScore}, skor minimum ${minScore}

ATURAN PENULISAN:
- Setiap insight MINIMAL 12 kata, padat dan bermakna
- Jangan hanya menyebut angka — jelaskan MAKNA dan IMPLIKASI kebijakannya
- Gunakan bahasa formal eksekutif pemerintah Indonesia
- Soroti pola, risiko, peluang, dan rekomendasi tindakan konkret
- Hindari frasa kosong seperti "perlu ditingkatkan" tanpa konteks spesifik
- Jika ada masalah watchlist, jelaskan risiko nyata dan dampaknya
- Jika ada gap digital vs non-digital, rekomendasikan langkah spesifik dan terukur

FORMAT OUTPUT — kembalikan HANYA JSON array berikut, tanpa teks lain apapun:
[
  {
    "icon": "📊",
    "type": "info",
    "text": "insight mendalam tentang kondisi digitalisasi: angka, maknanya bagi pelayanan publik, dan urgensi percepatan transformasi digital"
  },
  {
    "icon": "🏆",
    "type": "success",
    "text": "apresiasi sektor ${topUrusan} dengan konteks: mengapa dominasinya signifikan, pola yang bisa direplikasi sektor lain, dan implikasi kebijakannya"
  },
  {
    "icon": "⚠️",
    "type": "warning",
    "text": "peringatan spesifik: ${watchlistCount} inovasi watchlist dengan skor rata-rata ${avgScore}, risiko konkret jika tidak segera ditangani, dan rekomendasi intervensi"
  },
  {
    "icon": "💡",
    "type": "info",
    "text": "analisis gap digital vs non-digital dengan rekomendasi strategis spesifik: langkah pendampingan, alokasi sumber daya, dan target konversi yang realistis"
  },
  {
    "icon": "🎯",
    "type": "success",
    "text": "roadmap peningkatan dari ${digitalPct}% ke target berikutnya dengan langkah konkret, timeline, dan indikator keberhasilan yang terukur"
  }
]`;

    // Panggil Gemini — auto-retry jika model kena 429
    let geminiResponse: Response | null = null;
    let usedModel = '';

    for (const model of MODEL_PRIORITY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      console.log(`Trying model: ${model}`);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      if (res.status === 429) {
        console.warn(`${model} quota exceeded, trying next...`);
        continue;
      }

      geminiResponse = res;
      usedModel = model;
      break;
    }

    // Semua model kena quota → return fallback
    if (!geminiResponse) {
      console.warn('All models quota exceeded');
      return new Response(JSON.stringify(realFallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      });
    }

    // Gemini error selain 429 → return fallback
    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text();
      console.error(`Gemini ${geminiResponse.status}:`, errBody.substring(0, 200));
      return new Response(JSON.stringify(realFallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      });
    }

    // Parse response Gemini
    const result  = await geminiResponse.json();
    const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`Response from ${usedModel}:`, rawText.substring(0, 150));

    // Bersihkan markdown jika ada (```json ... ```)
    let clean = rawText.trim()
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '');

    // Ambil hanya bagian JSON array
    const firstBracket = clean.indexOf('[');
    const lastBracket  = clean.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1) {
      clean = clean.substring(firstBracket, lastBracket + 1);
    }

    let insights;
    try {
      insights = JSON.parse(clean);
    } catch (e) {
      console.error('JSON parse failed, using fallback');
      return new Response(JSON.stringify(realFallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
      });
    }

    // Validasi & sanitasi hasil insight 
    if (!Array.isArray(insights)) insights = [insights];

    const valid = insights
      .filter((i: any) => i?.icon && i?.type && i?.text)
      .map((i: any) => ({
        icon: String(i.icon).substring(0, 10),
        type: ['success', 'warning', 'info'].includes(i.type) ? i.type : 'info',
        text: String(i.text).substring(0, 250).trim()
      }))
      .slice(0, 5);

    const final = valid.length > 0 ? valid : realFallback;
    console.log(`Returning ${final.length} insights (model: ${usedModel})`);

    return new Response(JSON.stringify(final), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200
    });

  } catch (error: any) {
    // Fatal error — selalu return 200 agar frontend tidak crash
    console.error('Fatal:', error.message);
    return new Response(
      JSON.stringify([{ icon: "⚠️", type: "warning", text: `Server error: ${error.message.substring(0, 50)}` }]),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
})