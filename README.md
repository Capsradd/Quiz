# Quiz Belajar

Quiz Belajar adalah aplikasi front-end sederhana berbasis HTML, CSS, dan JavaScript untuk belajar dengan dua mode:

- Mode Quiz pilihan ganda dengan skor dan feedback langsung.
- Mode Flashcard untuk belajar dengan kartu balik.

## Fitur

- Mode Quiz dan Flashcard dari halaman awal.
- Input data lewat paste JSON atau upload file `.json`.
- Contoh JSON siap salin dari tombol `Copy Contoh`.
- Tombol `Copy Contoh with Prompt` untuk membantu membuat prompt AI.
- Navigasi soal, progress bar, hint, dan hasil akhir.
- Share link halaman lewat Web Share API atau copy URL.

## Cara Pakai

1. Buka file `index.html` di browser.
2. Pilih mode `Quiz` atau `Flashcard`.
3. Paste JSON ke area input atau upload file `.json`.
4. Klik `Load` untuk mulai.

## Format JSON

### Quiz

```json
{
  "title": "Kuis SQL JOINs",
  "mode": "quiz",
  "questions": [
    {
      "question": "Apa fungsi utama dari JOIN dalam SQL?",
      "options": [
        {
          "text": "Menggabungkan data dari dua atau lebih tabel",
          "isCorrect": true,
          "explanation": "JOIN digunakan untuk menggabungkan kolom dari dua atau lebih tabel."
        },
        {
          "text": "Menghapus data dari tabel",
          "isCorrect": false,
          "explanation": "Penghapusan data dilakukan dengan DELETE."
        }
      ],
      "hint": "JOIN menggabungkan data."
    }
  ]
}
```

Ketentuan quiz:

- `title` wajib ada dan harus string.
- `questions` harus berupa array minimal 1 item.
- Setiap soal minimal punya 2 opsi.
- Setiap opsi harus punya `text` dan `isCorrect` bertipe boolean.
- Minimal ada 1 opsi dengan `isCorrect: true`.

### Flashcard

```json
{
  "title": "Flashcard SQL JOINs",
  "cards": [
    {
      "question": "Apa fungsi JOIN dalam SQL?",
      "answer": "Menggabungkan data dari dua atau lebih tabel",
      "explanation": "JOIN menggabungkan kolom berdasarkan hubungan logis."
    }
  ]
}
```

Ketentuan flashcard:

- `title` wajib ada dan harus string.
- `cards` harus berupa array minimal 1 item.
- Setiap kartu wajib punya `question` dan `answer`.
- `explanation` opsional.

## Struktur File

- `index.html` - tampilan utama aplikasi.
- `script.js` - logika quiz, flashcard, validasi JSON, dan navigasi.
- `style.css` - styling tampilan.

## Catatan

- Aplikasi ini tidak memakai backend.
- Data soal sepenuhnya berasal dari JSON yang dimasukkan user.
- Untuk hasil terbaik, gunakan browser modern yang mendukung Clipboard API dan Web Share API.