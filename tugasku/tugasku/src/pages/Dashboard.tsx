import { useEffect, useState } from "react";
import { supabase, Profile } from "../lib/supabase";
const wib = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...o });
export default function Dashboard({ me }: { me: Profile }) {
  const [now, setNow] = useState(new Date()); const [n, setN] = useState<number | null>(null); const [recent, setRecent] = useState<any[]>([]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    supabase.from("tasks").select("id,title,subject,created_at,profiles(full_name)", { count: "exact" }).order("created_at", { ascending: false }).limit(5)
      .then(({ data, count }) => { setN(count ?? 0); setRecent(data ?? []); });
  }, []);
  const h = +wib({ hour: "numeric", hour12: false }).format(now) % 24;
  const greet = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
  return (<div className="stack">
    <h2>{greet}, {me.full_name.split(" ")[0]}!</h2>
    <div className="grid">
      <div className="card"><span className="muted">Waktu WIB</span><p className="big">{wib({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now).replace(/\./g, ":")}</p>
        <span className="muted">{wib({ weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now)}</span></div>
      <div className="card"><span className="muted">{me.role === "guru" ? "Total tugas siswa" : "Tugas tersimpan"}</span><p className="big">{n ?? "…"}</p></div>
      <div className="card"><span className="muted">Akun</span><p><b>{me.full_name}</b></p><span className="muted">@{me.username} · {me.role === "guru" ? "Guru" : "Siswa"}</span></div>
    </div>
    <div className="card"><h3>Aktivitas terbaru</h3>
      {recent.length === 0 ? <p className="muted">Belum ada tugas.</p> : recent.map(t => (<div className="row" key={t.id}><span>{t.title} <span className="chip">{t.subject}</span>{t.profiles && <span className="muted"> · {t.profiles.full_name}</span>}</span>
        <span className="muted">{wib({ day: "numeric", month: "short" }).format(new Date(t.created_at))}</span></div>))}</div>
  </div>);
}
