import { NextResponse } from 'next/server';
export async function POST(request) {
  const body = await request.json();
  const API_KEY = process.env.GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  const fokusPrompt = body.fokusMateri ? `Fokus Materi Tambahan: ${body.fokusMateri}` : '';
  const fullPrompt = `Anda adalah Asisten Guru Ahli Kurikulum...  Anda adalah seorang Asisten Guru Ahli Kurikulum di Indonesia yang mampu beradaptasi untuk SEMUA JENJANG PENDIDIKAN dari SD, SMP, hingga SMA/SMK.
                Anda sangat memahami karakteristik siswa dan pendekatan pedagogis yang berbeda untuk setiap jenjang.
                Tugas Anda adalah menghasilkan draf Perangkat Ajar yang lengkap, terstruktur, dan relevan sesuai permintaan spesifik dari guru.
                PENTING: Sesuaikan gaya bahasa, kedalaman materi, dan kompleksitas aktivitas dengan jenjang dan kelas yang diminta.
                Selalu hasilkan output dalam format Markdown yang jelas dan terstruktur dengan baik (gunakan heading, list, bold).

                INSTRUKSI OUTPUT:
                Harap hasilkan output dalam EMPAT BAGIAN UTAMA yang jelas. Gunakan format ini PERSIS:
                
                ## BAGIAN 1: MATERI PENGAYAAN GURU
                [Pada bagian ini, berikan penjelasan materi secara mendalam tentang topik utama yang bisa menjadi bekal pembelajaran bagi guru. Jelaskan konsep-konsep kunci, berikan konteks Konteks dan Relevansi, dan sebutkan 3-5 potensi miskonsepsi atau kesulitan yang mungkin dihadapi siswa saat mempelajari topik ini. Jika ada fokus materi tambahan dari guru, jelaskan secara lebih detail di bagian ini.]

                ## BAGIAN 2: MODUL AJAR LENGKAP
                [Pada bagian ini, buatkan Modul Ajar yang lengkap dan terstruktur sesuai standar Kurikulum Merdeka di indonesia, dari Informasi Umum (Mata Pelajaran, Kelas/Fase, Topik, Alokasi Waktu (jumlah pertemuan (1 pertemuan dikali berapa jp=total jp)), Model Pembelajaran, Penyusun (wajib kosong untuk diisi), Institusi (wajib kosong untuk diisi), Tahun Ajaran (wajib kosong untuk diisi)), kompetensi awal, Profil Lulusan [Gunakan 8 dimensi Profil Lulusan terbaru sesuai Permendikdasmen No. 10 Tahun 2025: Keimanan dan Ketakwaan terhadap Tuhan YME, Kewargaan, Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, dan Komunikasi. Sertakan deskripsi yang relevan dengan pembelajaran untuk setiap dimensi. PASTIKAN TIDAK MENGGUNAKAN ISTILAH "PROFIL PELAJAR PANCASILA" DAN JANGAN MASUKKAN FRASA "Sesuai PERMENDIKDASMEN NO. 10 TAHUN 2025" DALAM OUTPUTNYA], sarana dan prasarana, target peserta didik, model pembelajaran , Komponen Inti (Capaian Pembelajaran, Tujuan Pembelajaran, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Pembelajaran rinci per pertemuan, Asesmen, Pengayaan dan remidial, dan refleksi guru dan peserta didik)]

                ## BAGIAN 3: BANK SOAL EVALUASI
               [Pada bagian ini, buatkan bank soal evaluasi yang berfokus pada kemampuan berpikir tingkat tinggi, literasi, dan numerasi siswa. Total ada 10 soal.

                **A. Soal Berbasis Literasi (5 Soal Pilihan Ganda)**
                Sajikan sebuah stimulus singkat (seperti kutipan teks, infografis, atau studi kasus) yang relevan dengan topik. Kemudian, buat 4 soal pilihan ganda (A, B, C, D) yang menguji kemampuan siswa dalam memahami, menganalisis, dan menyimpulkan informasi dari stimulus tersebut.

                **B. Soal Berbasis Numerasi (5 Soal Pilihan Ganda)**
                Jika relevan dengan topik, sajikan data, tabel, atau grafik sederhana. Buat 3 soal pilihan ganda (A, B, C, D) yang mengharuskan siswa untuk menginterpretasikan data atau menggunakan logika kuantitatif untuk menjawab. Jika topik tidak bersifat numerik, buat soal logika atau analisis kuantitas yang bisa dihubungkan dengan topik.

                **C. Soal HOTS - Higher Order Thinking Skills (3 Soal Esai)**
                Buat 6 soal esai yang menuntut siswa untuk melakukan salah satu dari hal berikut:
              - **Menganalisis (C4):** Membandingkan dua konsep, menemukan penyebab masalah, atau menguraikan sebuah proses.
              - **Mengevaluasi (C5):** Memberikan penilaian atau argumen terhadap sebuah kasus atau pernyataan, disertai dengan alasan yang logis.
              - **Mencipta (C6):** Mengajukan sebuah solusi, merancang sebuah hipotesis, atau membuat sebuah konsep baru berdasarkan materi yang telah dipelajari.

                **D. Kunci Jawaban**
                Di bagian paling akhir, sediakan kunci jawaban yang jelas untuk seluruh soal pilihan ganda , berikan contoh/poin-poin jawaban ideal untuk soal esai dan berikan penjelasan pada setiap kunci jawabannya.]


                ## BAGIAN 4: LKPD (LEMBAR KERJA PESERTA DIDIK)
                [Pada bagian ini, Berdasarkan Modul Ajar, buatkan Lembar Kerja Peserta Didik (LKPD) yang siap cetak dan bisa langsung digunakan siswa.Wajib ada nama dan kelas yang harus di ini oleh siswa, Sertakan instruksi yang jelas, minimal 5 pertanyaan, atau aktivitas yang relevan.]
              
 PERMINTAAN GURU:
- Jenjang: ${body.jenjang?.toUpperCase()}
- Kelas: ${body.kelas}
- Mata Pelajaran: ${body.mapel}
- Topik: ${body.topik}
- Total Pertemuan: ${body.pertemuan} pertemuan
- Alokasi Waktu: ${body.jp} JP (Jam Pelajaran) per pertemuan.
${fokusPrompt}`;
  try {
    const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }) });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return NextResponse.json({ text: data.candidates[0].content.parts[0].text });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
