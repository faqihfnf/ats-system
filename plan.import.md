# Plan Implementasi Fitur Import Applicant

## 1. Tujuan

Membuat fitur import applicant melalui:

1. File Excel berisi data applicant.
2. File ZIP berisi CV dalam format PDF.
3. Source applicant diisi per baris Excel.
4. Validasi dilakukan sebelum data masuk database dan Supabase Storage.
5. Menggunakan prinsip all-or-nothing:
   - Jika seluruh data valid, import dapat dilakukan.
   - Jika ada satu saja error, seluruh import diblokir.
6. Urutan file PDF dalam ZIP tidak harus sama dengan urutan row di Excel.
7. Applicant hasil import masuk ke stage awal dan memiliki stage history.

---

## 2. Flow User

### Step 1 — Klik Import Applicant

Lokasi:

```text
/dashboard/applicant/joblist/[id]/candidates
```

Tambahkan tombol:

```text
Import Applicant
```

Disarankan menggunakan halaman khusus:

```text
/dashboard/applicant/joblist/[id]/candidates/import
```

Alasan menggunakan halaman khusus:

- Preview validasi membutuhkan ruang.
- Error dapat berjumlah banyak.
- Upload ZIP dapat berukuran besar.
- Flow memiliki beberapa tahap.
- Lebih mudah menampilkan progress import.

---

### Step 2 — Download Template

Template dibuat berdasarkan `jobId`.

Workbook terdiri dari:

```text
01_Applicants
02_Instructions
03_Educations
04_Sources
05_Reference
06_Metadata
```

Custom questions tidak dimasukkan ke template karena applicant dari portal eksternal tidak mengisinya.

---

### Step 3 — Upload Excel

File yang diterima:

```text
.xlsx
```

Excel berisi semua field applicant yang tersedia pada form web, ditambah field khusus import:

```text
source_code
external_applicant_id
cv_filename
```

---

### Step 4 — Upload ZIP CV

ZIP berisi file PDF applicant.

Urutan file dalam ZIP tidak harus sama dengan urutan row di Excel.

Pencocokan dilakukan menggunakan:

```text
Excel.cv_filename -> nama file PDF di ZIP
```

Contoh:

Excel:

```text
faqih-nur-fahmi.pdf
fajri-abdullah.pdf
nauval-wali.pdf
```

ZIP:

```text
fajri-abdullah.pdf
faqih-nur-fahmi.pdf
nauval-wali.pdf
```

Hasil tetap valid karena pencocokan tidak berdasarkan urutan.

---

### Step 5 — Validasi

Pada tahap validasi:

- Excel dibaca.
- ZIP dibaca sementara.
- Semua field diperiksa.
- Source dan education dicocokkan ke master.
- CV dicocokkan berdasarkan `cv_filename`.
- Duplicate dalam Excel diperiksa.
- Duplicate terhadap database diperiksa.
- File PDF divalidasi.
- Tidak ada file di-upload ke Supabase.
- Tidak ada applicant dibuat di database.

Sistem harus mengumpulkan semua error, bukan berhenti pada error pertama.

---

### Step 6 — Import

Tombol import hanya aktif jika:

```ts
validationStatus === "VALID"
```

Syarat:

```ts
totalRows > 0
errorCount === 0
matchedCvCount === totalRows
duplicateCount === 0
```

Saat tombol import diklik:

1. Server melakukan validasi ulang.
2. Server mengecek duplicate ulang.
3. Semua PDF di-upload ke Supabase.
4. Jika semua upload berhasil, database transaction dijalankan.
5. Semua Application dibuat.
6. Semua StageHistory dibuat.
7. ApplicantImport dibuat sebagai audit record.
8. Transaction di-commit.

Jika satu PDF gagal di-upload:

- Semua PDF yang sudah berhasil di-upload dihapus.
- Tidak ada applicant yang dibuat.

Jika database transaction gagal:

- Semua insert database di-rollback.
- Semua PDF hasil import dihapus.

---

## 3. State Validasi

State validasi hanya berada di browser/session UI dan tidak disimpan ke Supabase sebelum import final.

```ts
type ImportStatus =
  | "IDLE"
  | "FILES_SELECTED"
  | "VALIDATING"
  | "VALID"
  | "INVALID"
  | "IMPORTING"
  | "SUCCESS"
  | "FAILED";
```

State utama:

```ts
const [excelFile, setExcelFile] = useState<File | null>(null);
const [zipFile, setZipFile] = useState<File | null>(null);
const [status, setStatus] = useState<ImportStatus>("IDLE");
const [validationResult, setValidationResult] =
  useState<ImportValidationResult | null>(null);
```

Jika Excel atau ZIP berubah:

```ts
function resetValidation() {
  setStatus("IDLE");
  setValidationResult(null);
}
```

Perilaku:

```ts
function handleExcelChange(file: File | null) {
  setExcelFile(file);
  resetValidation();
}

function handleZipChange(file: File | null) {
  setZipFile(file);
  resetValidation();
}
```

Dengan demikian:

1. User upload Excel A.
2. User upload ZIP A.
3. Validasi sukses.
4. User mengganti ZIP menjadi ZIP B.
5. Hasil validasi sebelumnya dibatalkan.
6. Tombol Import kembali disabled.
7. User harus melakukan validasi ulang.

---

## 4. Struktur Sheet Excel

### 4.1 Sheet `01_Applicants`

Sheet utama yang diisi recruiter.

#### Field import

```text
source_code
external_applicant_id
cv_filename
```

#### Data personal

```text
full_name
email
phone
birth_place
birth_date
religion_code
gender_code
ktp_address
domicile_address
same_as_ktp
province
city
district
subdistrict
```

#### Pendidikan

```text
education_name
institution
education_start_year
education_end_year
```

#### Pengalaman kerja

```text
last_job_title
last_company
job_start_year
job_end_year
still_working
```

#### Gaji

```text
current_salary
expected_salary
```

Custom questions tidak disertakan.

---

### 4.2 Sheet `02_Instructions`

Berisi:

- Penjelasan setiap kolom.
- Kolom wajib dan opsional.
- Format tanggal.
- Format nomor telepon.
- Format gaji.
- Arti nilai boolean `0` dan `1`.
- Aturan pencocokan CV.
- Aturan duplicate.
- Larangan mengubah nama header.
- Aturan all-or-nothing.

---

### 4.3 Sheet `03_Educations`

Diambil dari master `Education`.

```text
education_name
category
```

Contoh:

| education_name | category |
|---|---|
| SMA | SCHOOL |
| SMK | SCHOOL |
| D3 | UNIVERSITY |
| S1 | UNIVERSITY |
| S2 | UNIVERSITY |

Recruiter mengisi `education_name`, bukan database ID.

---

### 4.4 Sheet `04_Sources`

Diambil dari master source.

```text
source_code
source_name
category
```

Contoh:

| source_code | source_name | category |
|---|---|---|
| CAREER_WEB | Karir Web | CAREER_SITE |
| FACEBOOK | Facebook | SOCIAL_MEDIA |
| LINKEDIN | LinkedIn | JOB_PORTAL |
| JOBSTREET | JobStreet | JOB_PORTAL |
| GLINTS | Glints | JOB_PORTAL |
| KALIBRR | Kalibrr | JOB_PORTAL |
| OTHER_JOB_PORTAL | Job Portal Lainnya | JOB_PORTAL |
| REFERRAL | Employee Referral | REFERRAL |
| OTHER | Lainnya | OTHER |

Satu file Excel dapat berisi applicant dari berbagai source.

---

### 4.5 Sheet `05_Reference`

Berisi referensi sederhana:

#### Gender

| gender_code | gender_name |
|---|---|
| MALE | Laki-laki |
| FEMALE | Perempuan |

#### Religion

| religion_code | religion_name |
|---|---|
| ISLAM | Islam |
| KRISTEN | Kristen |
| KATOLIK | Katolik |
| HINDU | Hindu |
| BUDDHA | Buddha |
| KONGHUCU | Konghucu |

#### Boolean

| boolean_value | meaning |
|---:|---|
| 0 | No / Tidak |
| 1 | Yes / Ya |

---

### 4.6 Sheet `06_Metadata`

Berisi:

| key | value |
|---|---|
| template_version | 1.0 |
| job_id | ID job |
| generated_at | Waktu template dibuat |
| template_type | APPLICANT_IMPORT |

Sheet ini dapat disembunyikan dari recruiter.

---

## 5. Field Master dan Free Text

### Field yang menggunakan master

Field berikut harus divalidasi terhadap master:

```text
source_code
education_name
gender_code
religion_code
```

Jika tersedia, tambahkan Excel dropdown untuk field tersebut.

### Field wilayah

Field wilayah menjadi free text karena saat ini datanya berasal dari API dan belum disimpan sebagai master internal:

```text
province
city
district
subdistrict
```

Validasi dasar:

- Wajib diisi.
- Tidak boleh hanya berisi spasi.
- Di-trim.
- Maksimal panjang karakter.
- Tidak perlu dicocokkan ke API wilayah.
- Tidak perlu dibuatkan sheet master wilayah.

Contoh normalisasi:

```text
"  Jawa   Barat  " -> "Jawa Barat"
" Kota Bandung "   -> "Kota Bandung"
```

---

## 6. Aturan Boolean

Boolean di Excel hanya menggunakan:

```text
0 = false / No
1 = true / Yes
```

Field:

```text
same_as_ktp
still_working
```

Nilai berikut dianggap error:

```text
YES
NO
TRUE
FALSE
Ya
Tidak
2
-1
kosong
```

Parser:

```ts
function parseBoolean01(value: unknown): boolean {
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;

  throw new Error("Nilai harus 0 atau 1");
}
```

---

## 7. Validasi Antar-Field

### `same_as_ktp`

Jika:

```text
same_as_ktp = 1
```

Maka `domicile_address` boleh kosong.

Importer mengisi:

```ts
domicileAddress = ktpAddress;
```

Jika:

```text
same_as_ktp = 0
```

Maka `domicile_address` wajib diisi.

---

### `still_working`

Jika:

```text
still_working = 1
```

Maka:

```text
job_end_year harus kosong
```

Nilai database:

```ts
jobEndYear = "present";
stillWorking = true;
```

Jika:

```text
still_working = 0
```

dan pengalaman kerja diisi, `job_end_year` harus berupa tahun valid.

---

### Pendidikan

```text
education_start_year <= education_end_year
```

Tahun tidak boleh:
- Kurang dari 1900.
- Lebih besar dari tahun berjalan.
- Berisi teks yang tidak valid.

---

### Gaji

```text
current_salary >= 0
expected_salary >= 0
```

Nilai Excel sebaiknya angka murni:

```text
8000000
```

Bukan:

```text
Rp 8.000.000
```

---

## 8. Validasi Excel dan ZIP

Aturan:

```text
1 row Excel = tepat 1 PDF
1 PDF = digunakan tepat 1 row Excel
```

Validasi:

1. Semua `cv_filename` di Excel ditemukan dalam ZIP.
2. Tidak ada dua row menggunakan CV yang sama.
3. Tidak ada PDF tambahan dalam ZIP.
4. Semua file berekstensi `.pdf`.
5. Semua file benar-benar PDF.
6. PDF tidak kosong.
7. PDF tidak corrupt.
8. Ukuran PDF tidak melebihi batas.
9. Nama file dibandingkan secara case-insensitive.
10. Urutan file di ZIP tidak diperhitungkan.

Contoh:

```text
Excel:
faqih-nur-fahmi.pdf
fajri-abdullah.pdf
nauval-wali.pdf

ZIP:
fajri-abdullah.pdf
faqih-nur-fahmi.pdf
nauval-wali.pdf
```

Hasil valid karena pencocokan berdasarkan nama file.

---

## 9. Validasi Duplicate

Duplicate dicek pada dua level:

1. Antar-row di Excel.
2. Terhadap data di database.

### 9.1 Duplicate dalam Excel

#### Email

Email dinormalisasi:

```ts
function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
```

Jika dua row memiliki email yang sama, import error.

#### Nomor telepon

Nomor telepon dinormalisasi:

```text
081234567890
+62 812 3456 7890
6281234567890
```

Menjadi:

```text
6281234567890
```

Jika dua row memiliki nomor yang sama, import error.

#### Source dan external ID

Jika external ID tersedia, kombinasi berikut harus unik:

```text
source_code + external_applicant_id
```

External ID dari source berbeda tidak langsung dianggap duplicate.

#### CV filename

`cv_filename` harus unik dalam satu Excel.

---

### 9.2 Duplicate terhadap Database

Pengecekan dibatasi pada job yang sama.

#### Email

```text
jobId + normalizedEmail
```

#### Nomor telepon

```text
jobId + normalizedPhone
```

#### External ID

Jika tersedia:

```text
jobId + sourceId + normalizedExternalApplicantId
```

Nama dan tanggal lahir tidak menjadi hard duplicate untuk menghindari false positive.

Kandidat yang sama pada job berbeda tetap diperbolehkan.

Jika satu duplicate ditemukan:

```text
Total: 10
Valid: 9
Error: 1

Import disabled
```

---

## 10. Normalisasi Identifier

### Email

```ts
function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
```

### Nomor telepon

```ts
function normalizePhone(value: string) {
  let phone = value.replace(/\D/g, "");

  if (phone.startsWith("0")) {
    phone = `62${phone.slice(1)}`;
  }

  if (!phone.startsWith("62")) {
    phone = `62${phone}`;
  }

  return phone;
}
```

### External ID

```ts
function normalizeExternalId(value: string) {
  return value.trim().toUpperCase();
}
```

### CV filename

```ts
function normalizeCvFilename(value: string) {
  return value.trim().toLowerCase();
}
```

---

## 11. Database Design

### 11.1 ApplicantSource

```prisma
model ApplicantSource {
  id           String                   @id @default(cuid())
  code         String                   @unique
  name         String                   @unique
  category     ApplicantSourceCategory
  isActive     Boolean                  @default(true)
  createdAt    DateTime                 @default(now())
  updatedAt    DateTime                 @updatedAt

  applications Application[]

  @@map("applicant_sources")
}

enum ApplicantSourceCategory {
  CAREER_SITE
  JOB_PORTAL
  SOCIAL_MEDIA
  REFERRAL
  OTHER
}
```

### 11.2 Application

Tambahkan:

```prisma
model Application {
  // existing fields

  sourceId            String
  source              ApplicantSource @relation(fields: [sourceId], references: [id])
  externalApplicantId String?
  originalCvFileName  String?

  importId            String?
  import              ApplicantImport? @relation(fields: [importId], references: [id])

  @@index([sourceId])
  @@index([jobId, externalApplicantId])
}
```

`Application.id` tetap menjadi internal ID ATS.

### 11.3 ApplicantImport

Record ini hanya dibuat untuk import yang berhasil.

```prisma
model ApplicantImport {
  id              String   @id @default(cuid())
  jobId           String
  job             Job      @relation(fields: [jobId], references: [id])

  importedById    String
  importedBy      Profile  @relation(fields: [importedById], references: [id])

  excelFileName   String
  zipFileName     String
  totalApplicants Int
  createdAt       DateTime @default(now())

  applications Application[]

  @@map("applicant_imports")
}
```

Tidak ada staging row invalid yang disimpan.

---

## 12. Source dari Form Web

Applicant yang apply melalui form web otomatis mendapat source:

```text
CAREER_WEB
```

Source tidak diterima dari client.

Backend:

```ts
const careerWebSource = await prisma.applicantSource.findUnique({
  where: { code: "CAREER_WEB" },
});
```

Saat membuat application:

```ts
sourceId: careerWebSource.id
```

---

## 13. Stage dan Stage History

Applicant hasil import:

1. Masuk ke stage pertama.
2. Memiliki `currentStageId`.
3. Memiliki initial `StageHistory`.
4. Actor history adalah recruiter yang melakukan import.
5. History memiliki note import.

Contoh:

```text
Melamar -> CV Screening
Faqih (Recruiter)
Imported applicant via JobStreet
```

Data stage history dibuat dalam transaction yang sama dengan Application.

---

## 14. Server Actions/API

### Download Template

```text
GET /api/dashboard/applicant/joblist/[jobId]/import-template
```

Tugas:

- Validasi akses user.
- Mengambil source aktif.
- Mengambil education.
- Mengambil metadata job.
- Menghasilkan workbook.
- Menambahkan sheet instructions.
- Menambahkan sheet master.
- Menambahkan Excel dropdown.
- Tidak menyertakan custom questions.

---

### Validate Import

```text
POST /api/dashboard/applicant/joblist/[jobId]/import/validate
```

Input:

```text
excel: File
zip: File
```

Tugas:

- Authorization.
- Parse Excel.
- Parse ZIP.
- Validasi semua field.
- Validasi master.
- Validasi ZIP.
- Validasi duplicate dalam Excel.
- Validasi duplicate ke database.
- Tidak upload ke Supabase.
- Tidak insert database.
- Mengembalikan semua error.

Response:

```ts
type ImportValidationResult = {
  status: "VALID" | "INVALID";
  totalRows: number;
  validRows: number;
  errorCount: number;
  matchedCvCount: number;
  errors: ImportValidationError[];
};
```

---

### Import Applicant

```text
POST /api/dashboard/applicant/joblist/[jobId]/import
```

Tugas:

1. Validasi authorization.
2. Validasi ulang Excel dan ZIP.
3. Cek duplicate ulang.
4. Generate `importId`.
5. Upload semua PDF ke Supabase.
6. Jika satu upload gagal, cleanup seluruh PDF.
7. Database transaction:
   - Buat ApplicantImport.
   - Buat Application.
   - Buat StageHistory.
8. Commit transaction.
9. Jika transaction gagal, cleanup seluruh PDF.

---

## 15. Storage CV

Path:

```text
cvs/imports/{importId}/{applicationId}.pdf
```

Nama storage dibuat oleh sistem, bukan menggunakan nama file asli sebagai path final.

`originalCvFileName` menyimpan nama file asli jika diperlukan untuk audit.

Alur cleanup:

```ts
const uploadedPaths: string[] = [];
```

Jika proses gagal:

```ts
await supabase.storage
  .from("cv-uploads")
  .remove(uploadedPaths);
```

---

## 16. Struktur Folder Implementasi

```text
src/app/dashboard/(platform)/applicant/joblist/[id]/candidates/import/
├── page.tsx
├── _actions/
│   └── action.import-applicant.ts
├── _components/
│   ├── comp.import-applicant-form.tsx
│   ├── comp.import-file-upload.tsx
│   ├── comp.import-validation-summary.tsx
│   └── comp.import-validation-table.tsx
└── _lib/
    ├── excel-template.ts
    ├── excel-parser.ts
    ├── zip-parser.ts
    ├── import-validator.ts
    ├── import-normalizers.ts
    └── import-types.ts
```

Tombol di halaman candidates:

```text
Import Applicant
```

---

## 17. Testing

### Validasi File

- Excel valid.
- Excel kosong.
- Sheet Applicants tidak tersedia.
- Header tidak lengkap.
- Header duplicate.
- ZIP kosong.
- ZIP tidak berisi PDF.
- PDF corrupt.
- PDF terlalu besar.
- PDF tambahan di ZIP.
- CV tidak ditemukan.
- Urutan ZIP berbeda dari Excel.

### Validasi Field

- Email invalid.
- Phone invalid.
- Source invalid.
- Education invalid.
- Gender invalid.
- Religion invalid.
- Boolean bukan `0` atau `1`.
- Tanggal invalid.
- Tahun tidak valid.
- Gaji invalid.
- Wilayah kosong.
- `same_as_ktp` tidak konsisten.
- `still_working` tidak konsisten.

### Duplicate

- Email duplicate dalam Excel.
- Phone duplicate dalam Excel.
- External ID duplicate dalam Excel.
- CV filename duplicate.
- Email sudah ada di database.
- Phone sudah ada di database.
- External ID sudah ada di database.
- Candidate sama pada job berbeda.
- External ID sama tetapi source berbeda.

### Transaction dan Cleanup

- Upload PDF gagal di tengah.
- Database transaction gagal.
- Cleanup file berhasil.
- User menekan tombol import dua kali.
- Dua recruiter melakukan import bersamaan.
- User tidak memiliki akses ke job.
- Job tidak ditemukan.
- Job berbeda dengan metadata template.

---

## 18. Acceptance Criteria

Fitur dianggap selesai apabila:

- Recruiter dapat membuka halaman import dari candidates.
- Recruiter dapat download template khusus job.
- Source tersedia per baris Excel.
- Satu Excel dapat berisi berbagai source.
- Wilayah menggunakan free text.
- Custom questions tidak diperlukan.
- Boolean hanya menerima `0` dan `1`.
- ZIP tidak perlu mengikuti urutan Excel.
- CV dicocokkan berdasarkan `cv_filename`.
- Semua error ditampilkan sekaligus.
- Satu error membuat tombol import disabled.
- Validasi tidak menyimpan file ke Supabase.
- Validasi tidak membuat Application.
- Duplicate dicek dalam Excel dan database.
- Email, phone, dan external ID digunakan sebagai duplicate identifier.
- Kandidat pada job berbeda tidak dianggap duplicate.
- Server melakukan validasi ulang saat import.
- Semua CV berhasil di-upload sebelum database transaction.
- Kegagalan satu CV menghapus CV yang sudah ter-upload.
- Database membuat semua applicant atau tidak membuat satu pun.
- Applicant dari web otomatis mendapat source `CAREER_WEB`.
- Applicant import masuk stage pertama.
- StageHistory mencatat recruiter sebagai actor.
- `externalApplicantId` tersimpan jika tersedia.
- ApplicantImport hanya disimpan untuk import yang berhasil.