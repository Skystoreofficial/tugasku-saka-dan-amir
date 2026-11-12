import { useEffect, useState } from "react";
import { LayoutDashboard, ClipboardList, Users, LogOut } from "lucide-react";
import { supabase, configOk, Profile } from "./lib/supabase";
import Login from "./pages/Login"; import Dashboard from "./pages/Dashboard"; import Tasks from "./pages/Tasks"; import Students from "./pages/Students";
export default function App() {
  const [me, setMe] = useState<Profile | null>(null); const [ready, setReady] = useState(false); const [tab, setTab] = useState("dash");
  const [toast, setToast] = useState<{ m: string; ok: boolean } | null>(null);
  const notify = (m: string, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3500); };
  useEffect(() => {
    const load = async (uid?: string) => {
      if (!uid) { setMe(null); setReady(true); return; }
      try { const { data } = await supabase.from("profiles").select("*").eq("id", uid).single(); setMe(data as Profile | null); } catch { setMe(null); }
      setReady(true);
    };
    if (!configOk) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id)).catch(() => setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => load(s?.user.id), 0); });
    return () => sub.subscription.unsubscribe();
  }, []);
  if (!configOk) return <div className="center"><div className="card login"><h1>Tugasku</h1><p className="err">Konfigurasi Supabase belum diisi.</p><p className="muted">Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY (file .env atau Environment Variables Vercel), lalu build/redeploy ulang.</p></div></div>;
  if (!ready) return <div className="center">Memuat...</div>;
  if (!me) return <Login />;
  const teacher = me.role === "guru";
  const nav = [["dash", "Dashboard", LayoutDashboard], ["tasks", teacher ? "Semua Tugas" : "Tugas Saya", ClipboardList], ...(teacher ? [["students", "Siswa", Users]] : [])] as [string, string, any][];
  return (<div className="shell">
    <aside><h1>Tugasku</h1>{nav.map(([k, l, I]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}><I size={18} /><span>{l}</span></button>)}
      <button onClick={() => supabase.auth.signOut()}><LogOut size={18} /><span>Keluar</span></button></aside>
    <main>{tab === "dash" && <Dashboard me={me} />}{tab === "tasks" && <Tasks me={me} toast={notify} />}{tab === "students" && teacher && <Students toast={notify} />}</main>
    {toast && <div className={"toast " + (toast.ok ? "" : "bad")}>{toast.m}</div>}
  </div>);
}
