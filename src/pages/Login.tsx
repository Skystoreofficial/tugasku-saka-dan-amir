import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
export default function Login() {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: `${u.trim().toLowerCase()}@tugasku.app`, password: p });
    if (error) setErr("Username atau password salah."); setBusy(false);
  }
  return (<div className="center"><form className="card login" onSubmit={go}>
    <h1>Tugasku</h1><p className="muted">Masuk dengan akun dari guru</p>
    <input placeholder="Username" value={u} onChange={e => setU(e.target.value)} autoCapitalize="none" required />
    <input placeholder="Password" type="password" value={p} onChange={e => setP(e.target.value)} required />
    {err && <p className="err">{err}</p>}
    <button className="btn" disabled={busy}>{busy ? "Memuat..." : "Masuk"}</button></form></div>);
}
