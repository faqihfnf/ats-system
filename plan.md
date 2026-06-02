# DISC Psikotest — Implementation Plan

> Rangkuman keputusan desain dari sesi diskusi.
> Lokasi fitur: `app/(dashboard)/psikotest/`

---

## Konteks

Fitur psikotest DISC dibangun di atas ATS yang sudah berjalan. Kandidat yang lolos tahap seleksi awal bisa dikirimkan undangan tes DISC oleh HR langsung dari profil kandidat. Hasil tes tersimpan dan muncul di profil kandidat.

Stack: **Next.js 16, App Router, TypeScript, Prisma, MySQL, Tailwind CSS**

---

## Keputusan Desain

### Format Soal
- **Forced choice** — setiap kelompok berisi 4 kata sifat (D, I, S, C)
- Kandidat memilih **1 MOST** (paling menggambarkan) dan **1 LEAST** (paling tidak menggambarkan)
- Total **28 kelompok soal** dalam Bahasa Indonesia
- Tidak ada jawaban benar/salah — murni self-assessment

### Akses Kandidat
- **Link unik tanpa login** — kandidat tidak perlu daftar akun
- Token UUID v4 di-bind ke `applicant_id` + `job_id` sejak dibuat
- Format link: `yourdomain.com/disc/{token}`
- Token "milik kandidat" dijamin oleh binding di database, bukan kode tambahan

### Token Expiry — 3 Kondisi
| Kondisi | Trigger | Status Akhir |
|---|---|---|
| Cara 1 | Kandidat submit jawaban | `completed` |
| Cara 2 | 24 jam berlalu sejak token dibuat (belum dibuka) | `expired` |
| Cara 3 | 90 menit berlalu sejak token **pertama dibuka** | `expired` |

> Cara 3 menutup celah kandidat membuka soal lalu pergi cari referensi, tapi masih manusiawi untuk menyelesaikan 28 soal. Tidak ada auto-save atau resume — sekali dibuka harus diselesaikan.

---

## Alur Sistem

```
Kandidat apply loker
        ↓
Proses di stage pipeline ATS
        ↓
HR klik "Kirim DISC" di profil kandidat
        ↓
Backend: generate UUID token → simpan ke disc_invitations → kirim email
        ↓
Kandidat buka link → sistem validasi token
        ├── Tidak valid/expired → halaman error
        └── Valid → update status in_progress, set session_deadline (now + 90 menit)
                    ↓
              Kandidat kerjakan 28 soal (timer 90 menit berjalan)
                    ↓
              Kandidat submit
                    ↓
              Scoring engine hitung D-I-S-C
                    ↓
              Simpan ke disc_results, token → completed
                    ↓
              Kandidat lihat hasil singkat
              HR dapat notifikasi email + hasil muncul di dashboard
```

---

## Database Schema

### `DiscInvitation`
```prisma
model DiscInvitation {
  id               Int        @id @default(autoincrement())
  token            String     @unique @db.Char(36)   // UUID v4
  applicantId      Int
  jobId            Int
  sentBy           Int                                // user HR
  status           DiscStatus @default(pending)
  expiresAt        DateTime                           // sent + 24 jam
  openedAt         DateTime?                          // pertama dibuka
  sessionDeadline  DateTime?                          // openedAt + 90 menit
  completedAt      DateTime?
  tabSwitchCount   Int        @default(0)
  ipAddress        String?    @db.VarChar(45)
  userAgent        String?    @db.Text
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  applicant  Applicant    @relation(...)
  job        Job          @relation(...)
  answers    DiscAnswer[]
  result     DiscResult?
}

enum DiscStatus { pending in_progress completed expired }
```

### `DiscQuestion`
```prisma
model DiscQuestion {
  id       Int     @id @default(autoincrement())
  groupNo  Int                      // urutan 1–28
  wordD    String  @db.VarChar(100)
  wordI    String  @db.VarChar(100)
  wordS    String  @db.VarChar(100)
  wordC    String  @db.VarChar(100)
  isActive Boolean @default(true)
  answers  DiscAnswer[]
}
```

### `DiscAnswer`
```prisma
model DiscAnswer {
  id           Int           @id @default(autoincrement())
  invitationId Int
  questionId   Int
  answerMost   DiscDimension
  answerLeast  DiscDimension
  answeredAt   DateTime      @default(now())

  @@unique([invitationId, questionId])
}

enum DiscDimension { d i s c }
```

### `DiscResult`
```prisma
model DiscResult {
  id           Int      @id @default(autoincrement())
  invitationId Int      @unique
  applicantId  Int
  scoreD       Int
  scoreI       Int
  scoreS       Int
  scoreC       Int
  dominantType String   @db.Char(1)   // D / I / S / C
  profileLabel String   @db.VarChar(100)
  completedAt  DateTime
}
```

---

## Scoring Engine

File: `src/lib/disc/scoring.ts`

```ts
// +1 untuk MOST, -1 untuk LEAST per dimensi
// Normalisasi agar tidak ada nilai negatif
// Return: { scoreD, scoreI, scoreS, scoreC, dominantType, profileLabel }
```

| Tipe | Label | Cocok Untuk |
|---|---|---|
| D | The Driver | Manajer, sales, team lead |
| I | The Influencer | Marketing, PR, trainer |
| S | The Supporter | Customer service, HR, admin |
| C | The Analyzer | Finance, QA, engineering |

---

## Struktur Folder

```
src/app/
├── (dashboard)/
│   └── psikotest/
│       ├── page.tsx                        // daftar hasil DISC per job (HR)
│       └── result/
│           └── [invitationId]/
│               └── page.tsx                // detail hasil kandidat (HR)
├── disc/
│   ├── [token]/
│   │   ├── page.tsx                        // Server Component: validasi token
│   │   ├── DiscTestClient.tsx              // 'use client': UI tes interaktif
│   │   └── components/
│   │       ├── TopBar.tsx                  // timer + kamera indicator
│   │       ├── QuestionCard.tsx            // forced choice per kelompok
│   │       ├── ProgressBar.tsx
│   │       ├── WarningModal.tsx            // overlay tab-switch
│   │       └── Watermark.tsx               // nama + timestamp overlay
│   └── result/
│       └── [token]/
│           └── page.tsx                    // hasil untuk kandidat (no auth)
└── api/
    └── disc/
        ├── invite/route.ts                 // POST — HR kirim undangan
        ├── session/[token]/route.ts        // GET  — validasi + ambil soal
        ├── submit/route.ts                 // POST — submit jawaban
        ├── log-tab-switch/route.ts         // POST — catat tab switch
        ├── result/[invitationId]/route.ts  // GET  — hasil (HR)
        ├── invitations/route.ts            // GET  — list per kandidat (HR)
        └── cron/
            └── disc-expire/route.ts        // GET  — expire token (cron)

src/lib/
└── disc/
    ├── scoring.ts      // scoring engine
    ├── profiles.ts     // narasi 4 tipe DISC
    └── questions.ts    // 28 soal fallback

src/
└── prisma/
    └── seed-disc.ts    // seeder 28 soal
```

---

## Anti-Kecurangan

### Fase 1 — Wajib
| Mekanisme | Cara Kerja |
|---|---|
| **Tab-switch detection** | `Page Visibility API` — saat tab hidden: log ke backend. Saat kembali: tampilkan warning overlay |
| **Warning overlay** | Muncul tiap kembali ke tab. Hitung peringatan ke-N dari 3. Pesan makin serius tapi tes tetap lanjut. |
| **Watermark dinamis** | Nama kandidat + timestamp + 6 char token. Opacity 4%, rotate -15deg, tiled. `pointer-events: none` |
| **Disable klik kanan** | `contextmenu` event `preventDefault()` |
| **Disable seleksi teks** | CSS `user-select: none` di body |
| **Timer per soal** | Catat durasi jawab (ms) per kelompok. Flag jika < 2 detik. |
| **Device fingerprint** | Simpan IP + user-agent + timezone saat token dibuka. Deteksi akses dari 2 device berbeda. |

### Fase 2 — Opsional
- **Kamera snapshot** setiap 60 detik — bukan rekaman, fungsinya **psychological deterrent**
- Jika kamera ditolak: tes tetap jalan, HR diberi tahu
- Snapshot dihapus otomatis 30 hari (compliance UU PDP 2024)
- Consent eksplisit wajib ditampilkan sebelum soal dimulai

---

## API Endpoints

| Method | Route | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/disc/invite` | HR session | Kirim undangan, generate token |
| GET | `/api/disc/session/[token]` | Token only | Validasi token, return soal |
| POST | `/api/disc/submit` | Token only | Submit jawaban, scoring, simpan hasil |
| POST | `/api/disc/log-tab-switch` | Token only | Increment tab_switch_count |
| GET | `/api/disc/result/[invitationId]` | HR session | Ambil hasil kandidat |
| GET | `/api/disc/invitations` | HR session | List undangan per kandidat |
| GET | `/api/cron/disc-expire` | CRON_SECRET | Expire token kadaluarsa (tiap 15 menit) |

---

## UI — Halaman Tes Kandidat (`/disc/[token]`)

- **Top bar**: judul | dot kamera merah berkedip | countdown timer MM:SS (merah jika < 10 menit)
- **Progress bar**: kelompok saat ini / 28
- **Soal**: 4 tombol kata sifat, urutan diacak tiap render
- **Interaksi**: klik 1 → MOST (hijau) | klik lain → LEAST (merah) | tidak bisa sama
- **Navigasi**: Sebelumnya / Selanjutnya (disabled jika belum pilih keduanya) / Submit di soal ke-28
- **Auto-submit** saat timer habis
- **Halaman hasil kandidat**: tipe dominan + deskripsi singkat. Skor numerik **tidak ditampilkan**.

## UI — Dashboard HR (`/psikotest`)

- Tombol **"Kirim DISC"** di profil kandidat (hanya muncul jika belum ada undangan aktif)
- Tab **Psikotest** di profil kandidat: riwayat undangan + status badge
- Status badge: `Belum Dibuka` (abu) | `Sedang Dikerjakan` (kuning) | `Selesai` (hijau) | `Expired` (merah)
- Halaman hasil HR: grafik bar D-I-S-C (Recharts) + tipe dominan + narasi + metadata + flag tab-switch
- Flag merah jika `tabSwitchCount >= 3`

---

## Implementation Phases

### Fase 1 — Backend & Database (Minggu 1–2)
- [ ] Tambah 4 model Prisma + enum ke `schema.prisma`
- [ ] `prisma migrate dev`
- [ ] Seeder 28 soal (`prisma/seed-disc.ts`)
- [ ] Scoring engine (`src/lib/disc/scoring.ts`)
- [ ] Data profil 4 tipe (`src/lib/disc/profiles.ts`)
- [ ] API route handlers (invite, session, submit, log-tab-switch, result, invitations)
- [ ] Cron route untuk expire token

### Fase 2 — Halaman Tes Kandidat (Minggu 2–3)
- [ ] `app/disc/[token]/page.tsx` — Server Component validasi token
- [ ] `DiscTestClient.tsx` — state management soal + jawaban
- [ ] `useTimer.ts` — countdown dari `sessionDeadline`
- [ ] `useTabDetection.ts` — Page Visibility API + log + warning
- [ ] `QuestionCard.tsx` — forced choice UI, Fisher-Yates shuffle
- [ ] `Watermark.tsx` — tiled overlay nama + timestamp
- [ ] `WarningModal.tsx` — overlay peringatan tab switch
- [ ] Anti-cheat: disable klik kanan, disable seleksi teks
- [ ] `app/disc/result/[token]/page.tsx` — halaman hasil kandidat

### Fase 3 — Dashboard HR (Minggu 3–4)
- [ ] `SendDiscButton.tsx` — tombol kirim + konfirmasi dialog
- [ ] `DiscTab.tsx` — tab psikotest di profil kandidat
- [ ] `DiscStatusBadge.tsx`
- [ ] `app/(dashboard)/psikotest/result/[invitationId]/page.tsx`
- [ ] `DiscBarChart.tsx` — Recharts horizontal bar
- [ ] `CheatingFlags.tsx` — flag tab-switch
- [ ] `app/(dashboard)/psikotest/page.tsx` — daftar hasil per job
- [ ] Notifikasi email ke HR setelah kandidat selesai

### Fase 4 — Polish (Minggu 4–5)
- [ ] Export PDF laporan (`@react-pdf/renderer`)
- [ ] Template email HTML untuk undangan kandidat
- [ ] Vercel Cron / external cron untuk `disc-expire`

### Fase 5 — Opsional
- [ ] Kamera snapshot (psychological deterrent)
- [ ] Consent management + log
- [ ] Auto-delete foto 30 hari (UU PDP)