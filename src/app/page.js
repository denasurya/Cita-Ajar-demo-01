"use client";

import { useState } from 'react';
import { marked } from 'marked';
// TIDAK ADA impor library download di sini untuk menjaga stabilitas

export default function HomePage() {
  const [form, setForm] = useState({ jenjang: '', kelas: '', mapel: '', topik: '', fokusMateri: '', pertemuan: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('materi');

  const handleInputChange = (e) => setForm(prev => ({ ...prev, [e.target.id]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.topik) return alert('Topik Utama wajib diisi.');
    setIsLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengambil data dari server.');
      const parts = data.text.split(/##\s*BAGIAN\s*\d+.*?\n/);
      setResult({ materi: parts[1] || "Konten materi tidak ditemukan.", modul: parts[2] || "Konten modul tidak ditemukan.", soal: parts[3] || "Konten soal tidak ditemukan.", LKPD: parts[4] || "Konten LKPD tidak ditemukan." });
      setActiveTab('materi');
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  // --- FUNGSI DOWNLOAD FINAL YANG DIJAMIN STABIL ---
  const downloadAsDocx = async (section) => {
    if (!result || !result[section]) {
      alert("Tidak ada konten untuk diunduh.");
      return;
    }
    try {
      // 1. Kirim teks mentah ke "dapur" di backend
      const response = await fetch('/api/download-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownContent: result[section] }),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat file di server.');
      }

      // 2. Ambil file yang sudah jadi sebagai 'blob' (objek file mentah)
      const blob = await response.blob();
      
      // 3. Gunakan fungsi bawaan browser untuk membuat link download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${section} - Cipta Ajar.docx`);
      
      // 4. Pemicu download tanpa library tambahan
      document.body.appendChild(link);
      link.click();
      
      // 5. Bersihkan link setelah selesai
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Kesalahan saat mengunduh file .docx:", error);
      alert("Gagal mengunduh file Word.");
    }
  };

  return (
    <div className="container">
      <div className="form-section">
        <h1 className="main-title">Cipta Ajar</h1>
        <h2 className="subtitle">Apa yang ingin Anda buat hari ini?</h2>
        <div className="form-grid">
          <div><label htmlFor="jenjang">Jenjang Pendidikan</label><input id="jenjang" placeholder="Contoh: SD,SMP,SMA/SMK" value={form.jenjang} onChange={handleInputChange} /></div>
          <div><label htmlFor="kelas">Kelas</label><input id="kelas" placeholder="Contoh: 4,7,12" value={form.kelas} onChange={handleInputChange} /></div>
        </div>
        <div className="input-group"><label htmlFor="mapel">Mata Pelajaran</label><input id="mapel" placeholder="Contoh: IPAS,MATEMATIKA" value={form.mapel} onChange={handleInputChange} /></div>
        <div className="input-group"><label htmlFor="topik">Topik Utama</label><input id="topik" placeholder="Contoh: ALJABAR" value={form.topik} onChange={handleInputChange} /></div>
        <div className="input-group"><label htmlFor="fokusMateri">Fokus Materi (Opsional)</label><input id="fokusMateri" placeholder="Contoh: Fokus Pengenalan Aljabar" value={form.fokusMateri} onChange={handleInputChange} /></div>
        <div className="input-group"><label htmlFor="pertemuan">Banyak Pertemuan</label><input type="number" id="pertemuan" placeholder="isi dengan angka" value={form.pertemuan} onChange={handleInputChange} /></div>
        <button id="generateBtn" onClick={handleGenerate} disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate →'}</button>
      </div>
      <div id="output-area">
        {isLoading && <div className="output-placeholder"><p>sedang merancang, mohon tunggu...</p></div>}
        {error && <div className="output-placeholder" style={{ color: 'red' }}><p>Terjadi Kesalahan: {error}</p></div>}
        {result && (
          <div>
            <div className="tabs">
              <button className={`tab-button ${activeTab === 'materi' && 'active'}`} onClick={() => setActiveTab('materi')}>Materi</button>
              <button className={`tab-button ${activeTab === 'modul' && 'active'}`} onClick={() => setActiveTab('modul')}>Modul Ajar</button>
              <button className={`tab-button ${activeTab === 'soal' && 'active'}`} onClick={() => setActiveTab('soal')}>Bank Soal</button>
              <button className={`tab-button ${activeTab === 'LKPD' && 'active'}`} onClick={() => setActiveTab('LKPD')}>LKPD</button>
            </div>
            <div className="tab-content">
              {Object.keys(result).map(key => (
                <div key={key} className={`tab-pane ${activeTab === key && 'active'}`}>
                  <div className="output-content-text" dangerouslySetInnerHTML={{ __html: marked.parse(result[key]) }} />
                  <div className="output-actions">
                    <button onClick={() => downloadAsDocx(key)}>Download .docx</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && !result && !error && <div className="output-placeholder"><p>Hasil generasi akan muncul di sini.</p></div>}
      </div>
    </div>
  );
}
