import { useState, type FormEvent } from "react";
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

// Contoh tugas untuk panel kiri (hanya hiasan, bukan data asli).
const SAMPLE = [
  { subject: "Matematika", title: "Latihan soal bab 4", done: true },
  { subject: "IPA", title: "Laporan percobaan", done: true },
  { subject: "Bahasa Indonesia", title: "Ringkasan teks berita", done: false },
  { subject: "IPS", title: "Peta konsep", done: false },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username.trim().toLowerCase()}@tugasku.app`,
        password,
      });
      if (error) {
        setErr(
          /invalid login/i.test(error.message)
            ? "Username atau password salah. Periksa lagi, lalu coba masuk kembali."
            : "Belum bisa masuk. Periksa koneksi internet, lalu coba lagi."
        );
      }
    } catch {
      setErr("Belum bisa masuk. Periksa koneksi internet, lalu coba lagi.");
    }
    setBusy(false);
  }

  return (
    <div className="lg-page">
      <div className="lg-brand" aria-hidden="true">
        <span className="lg-logo">Tugasku</span>
        <div className="lg-paper">
          <p className="lg-paper-title">Tugas minggu ini</p>
          <ul>
            {SAMPLE.map((t) => (
              <li key={t.title} className={t.done ? "done" : ""}>
                <span className="lg-tick">{t.done && <Check size={12} strokeWidth={3} />}</span>
                <span className="lg-task">
                  <b>{t.title}</b>
                  <small>{t.subject}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="lg-tag">Semua tugas kelas, rapi dalam satu tempat.</p>
      </div>

      <div className="lg-panel">
        <form className="lg-form" onSubmit={submit}>
          <span className="lg-logo lg-logo-mobile">Tugasku</span>
          <div className="lg-head">
            <h1>Masuk</h1>
            <p className="muted">Gunakan username dan password dari guru.</p>
          </div>

          <div className="lg-field">
            <label htmlFor="lg-user">Username</label>
            <input
              id="lg-user"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={!!err}
              aria-describedby={err ? "lg-err" : undefined}
              required
            />
          </div>

          <div className="lg-field">
            <label htmlFor="lg-pass">Password</label>
            <div className="lg-pass">
              <input
                id="lg-pass"
                name="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-invalid={!!err}
                aria-describedby={err ? "lg-err" : undefined}
                required
              />
              <button
                type="button"
                className="lg-eye"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                aria-pressed={show}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {err && (
            <p id="lg-err" className="lg-err" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{err}</span>
            </p>
          )}

          <button className="btn lg-submit" disabled={busy}>
            {busy ? (
              <>
                <Loader2 size={18} className="lg-spin" aria-hidden="true" />
                Memeriksa...
              </>
            ) : (
              "Masuk"
            )}
          </button>

          <p className="lg-help muted">
            Lupa password atau belum punya akun? Minta guru membuatkan atau mengatur ulang lewat menu Siswa.
          </p>
        </form>
      </div>
    </div>
  );
}
