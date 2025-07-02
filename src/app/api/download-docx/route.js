// File: src/app/api/download-docx/route.js

import { NextResponse } from 'next/server';
import { marked } from 'marked';
import htmlToDocx from 'html-to-docx';

export async function POST(request) {
  try {
    // 1. Terima pesanan teks mentah dari halaman depan
    const { markdownContent } = await request.json();

    if (!markdownContent) {
      return NextResponse.json({ error: 'Konten tidak ditemukan' }, { status: 400 });
    }

    // 2. Ubah teks mentah (Markdown) menjadi HTML
    const htmlString = marked.parse(markdownContent);

    // 3. Buat file .docx yang valid dari HTML di server
    const fileBuffer = await htmlToDocx(htmlString, {
      orientation: 'portrait',
      margins: { top: 720, right: 720, bottom: 720, left: 720 },
    });

    // 4. Kirim kembali file yang sudah jadi sebagai respons
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="document.docx"',
      },
    });

  } catch (error) {
    console.error('Error creating DOCX file:', error);
    return NextResponse.json({ error: 'Gagal membuat file .docx di server' }, { status: 500 });
  }
}