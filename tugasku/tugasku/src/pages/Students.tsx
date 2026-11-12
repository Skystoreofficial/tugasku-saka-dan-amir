import { useEffect, useState } from "react";
import { supabase, Profile } from "../lib/supabase";
export default function Students({ toast }: { toast: (m: string, ok?: boolean) => void }) {
  const [list, setList] = useState<Profile[]>([]); const [f, setF] = useState({ full_name: "", username: "", password: "" }); const [busy, setBusy] = useState(false);
  const load = () => supabase.from("profiles").select("*").eq("role", "siswa").order("full_name").then(({ data }) => setList((data ?? []) as Profile[]));
  useEffect(() => { load(); }, []);
  async function call(body: object, ok: string) {
    setBusy(true); const { data, error } = await supabase.functions.invoke("manage-student", { body });
    setBusy(false); if (error || data?.error) { toast(data?.error ?? "Gagal", false); return false; }
    toast(ok); load(); return true;
  }
  async function create(e: React.FormEvent) { e.preventDefault(); if (await call({ action: "create", ...f }, "Akun siswa dibuat")) setF({ full_name: "", username: "", password: "" }); }
  return (<div className="stack">
    <form className="card stack" onSubmit={create}><h3>Buat Akun Siswa</h3>
      <input placeholder="Nama lengkap" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} required />
      <div className="two"><input placeholder="Username" autoCapitalize="none" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} required />
        <input placeholder="Password (min. 6)" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required /></div>
      <button className="btn" disabled={busy}>Buat Akun</button></form>
    <div className="card"><h3>Daftar Siswa ({list.length})</h3>{list.map(s => (<div className="row" key={s.id}><span>{s.full_name} <span className="muted">@{s.username}</span></span>
      <span className="two"><button className="btn ghost" onClick={() => { const n = prompt("Nama baru:", s.full_name); if (n) call({ action: "update", id: s.id, full_name: n }, "Data diperbarui"); }}>Edit</button>
        <button className="btn ghost" onClick={() => { const p = prompt("Password baru (min. 6):"); if (p && p.length >= 6) call({ action: "update", id: s.id, password: p }, "Password direset"); }}>Reset PW</button></span></div>))}</div>
  </div>);
}
