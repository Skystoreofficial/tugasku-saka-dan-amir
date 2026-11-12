# Tugasku — Panduan Setup
1. **Supabase**: buat project → SQL Editor → jalankan `supabase/schema.sql` (tabel, RLS, bucket Storage `attachments`).
2. **Akun guru awal**: Authentication > Users > Add user (email `guru@tugasku.app`, password Anda, centang Auto Confirm), lalu jalankan SQL `insert into profiles ...` di bagian bawah schema.sql. Login dengan username `guru`.
3. **Edge Function**: `npm i -g supabase` → `supabase login` → `supabase link --project-ref <ref>` → `supabase functions deploy manage-student`. (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY otomatis tersedia di function; service key tidak pernah ada di frontend.)
4. **Lokal**: salin `.env.example` ke `.env`, isi URL & anon key (Project Settings > API) → `npm install` → `npm run dev`.
5. **Vercel**: push ke GitHub → Import di Vercel (Framework: Vite) → Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → Deploy. `vercel.json` menangani refresh halaman.
6. **Pakai**: Guru → menu Siswa untuk buat akun/reset password; Siswa → Tugas Saya → Simpan Tugas (galeri/kamera, multi foto & video). Kamera butuh HTTPS (Vercel sudah HTTPS).
