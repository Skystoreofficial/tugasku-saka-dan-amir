import { useCallback, useEffect, useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import { Camera, ImagePlus, Trash2, Pencil, X } from "lucide-react";
import { supabase, SUBJECTS, Profile, Task } from "../lib/supabase";
type Toast = (m: string, ok?: boolean) => void;
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
export default function Tasks({ me, toast }: { me: Profile; toast: Toast }) {
  const teacher = me.role === "guru";
  const [tasks, setTasks] = useState<Task[]>([]); const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(""); const [subj, setSubj] = useState(""); const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [editId, setEditId] = useState<string | null>(null);
  const [f, setF] = useState({ title: "", subject: SUBJECTS[0], description: "", task_date: today() });
  const [files, setFiles] = useState<File[]>([]); const [busy, setBusy] = useState<string>("");
  const previews = useMemo(() => files.map(x => URL.createObjectURL(x)), [files]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tasks").select("*, profiles(full_name,username), attachments(*)");
    if (error) { toast("Gagal memuat tugas", false); setLoading(false); return; }
    const list = (data ?? []) as Task[];
    const paths = list.flatMap(t => t.attachments.map(a => a.path));
    if (paths.length) {
      const { data: s } = await supabase.storage.from("attachments").createSignedUrls(paths, 3600);
      const m = new Map((s ?? []).map(x => [x.path, x.signedUrl]));
      list.forEach(t => t.attachments.forEach(a => (a.url = m.get(a.path) ?? undefined)));
    }
    setTasks(list); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => tasks.filter(t => (!subj || t.subject === subj) &&
    (t.title.toLowerCase().includes(q.toLowerCase()) || (teacher && (t.profiles?.full_name ?? "").toLowerCase().includes(q.toLowerCase()))))
    .sort((a, b) => (order === "desc" ? -1 : 1) * (a.task_date.localeCompare(b.task_date) || a.created_at.localeCompare(b.created_at))), [tasks, q, subj, order]);

  function pick(e: ChangeEvent<HTMLInputElement>) { setFiles(p => [...p, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }
  function reset() { setEditId(null); setFiles([]); setF({ title: "", subject: SUBJECTS[0], description: "", task_date: today() }); }

  async function save(e: FormEvent) {
    e.preventDefault(); setBusy("Menyimpan...");
    try {
      let id = editId;
      if (id) { const { error } = await supabase.from("tasks").update(f).eq("id", id); if (error) throw error; }
      else { const { data, error } = await supabase.from("tasks").insert({ ...f, owner_id: me.id }).select("id").single(); if (error) throw error; id = data.id; }
      let fail = 0;
      for (let i = 0; i < files.length; i++) {
        setBusy(`Mengunggah ${i + 1}/${files.length}...`);
        const file = files[i]; const path = `${me.id}/${id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
        const up = await supabase.storage.from("attachments").upload(path, file, { contentType: file.type });
        if (up.error) { fail++; continue; }
        const { error } = await supabase.from("attachments").insert({ task_id: id, path, name: file.name, mime: file.type });
        if (error) { fail++; await supabase.storage.from("attachments").remove([path]); }
      }
      toast(fail ? `Tersimpan, ${fail} lampiran gagal diunggah` : "Tugas berhasil disimpan", !fail); reset(); await load();
    } catch (err: any) { toast(err.message ?? "Gagal menyimpan", false); }
    setBusy("");
  }
  async function remove(t: Task) {
    if (!confirm(`Hapus tugas "${t.title}" beserta lampirannya?`)) return;
    if (t.attachments.length) await supabase.storage.from("attachments").remove(t.attachments.map(a => a.path));
    const { error } = await supabase.from("tasks").delete().eq("id", t.id);
    if (error) return toast("Gagal menghapus", false);
    toast("Tugas dihapus"); load();
  }
  function edit(t: Task) { setEditId(t.id); setF({ title: t.title, subject: t.subject, description: t.description, task_date: t.task_date }); scrollTo({ top: 0, behavior: "smooth" }); }

  return (<div className="stack">
    {!teacher && <form className="card stack" onSubmit={save}>
      <h3>{editId ? "Edit Tugas" : "Simpan Tugas"}</h3>
      <input placeholder="Judul tugas" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required />
      <div className="two"><select value={f.subject} onChange={e => setF({ ...f, subject: e.target.value })}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select>
        <input type="date" value={f.task_date} onChange={e => setF({ ...f, task_date: e.target.value })} required /></div>
      <textarea rows={3} placeholder="Deskripsi / keterangan" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      <div className="two">
        <label className="btn ghost"><ImagePlus size={16} /> Galeri (foto/video)<input hidden type="file" multiple accept="image/*,video/*" onChange={pick} /></label>
        <label className="btn ghost"><Camera size={16} /> Kamera<input hidden type="file" accept="image/*" capture="environment" onChange={pick} /></label></div>
      {files.length > 0 && <div className="thumbs">{files.map((x, i) => (<div className="thumb" key={i}>
        {x.type.startsWith("video") ? <video src={previews[i]} muted /> : <img src={previews[i]} />}
        <small>{x.name}</small><button type="button" aria-label="Hapus" onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={14} /></button></div>))}</div>}
      <div className="two"><button className="btn" disabled={!!busy}>{busy || (editId ? "Perbarui" : "Simpan Tugas")}</button>{editId && <button type="button" className="btn ghost" onClick={reset}>Batal</button>}</div>
      {editId && <small className="muted">Lampiran baru yang dipilih akan ditambahkan ke tugas ini.</small>}
    </form>}
    <div className="card two3">
      <input placeholder={teacher ? "Cari nama siswa / judul" : "Cari judul"} value={q} onChange={e => setQ(e.target.value)} />
      <select value={subj} onChange={e => setSubj(e.target.value)}><option value="">Semua mapel</option>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select>
      <select value={order} onChange={e => setOrder(e.target.value as any)}><option value="desc">Terbaru</option><option value="asc">Terlama</option></select></div>
    {loading ? <p className="muted">Memuat...</p> : shown.length === 0 ? <div className="card empty">Belum ada tugas.</div> :
      <div className="grid">{shown.map(t => (<div className="card stack" key={t.id}>
        <div className="row"><b>{t.title}</b><span className="chip">{t.subject}</span></div>
        {teacher && <small className="muted">Siswa: {t.profiles?.full_name}</small>}
        <small className="muted">Tanggal tugas: {new Date(t.task_date).toLocaleDateString("id-ID", { dateStyle: "long" })} · Disimpan: {new Date(t.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" })}</small>
        <p>{t.description}</p>
        <div className="thumbs">{t.attachments.map(a => a.mime?.startsWith("video") ? <video key={a.id} src={a.url} controls preload="metadata" /> : <a key={a.id} href={a.url} target="_blank"><img src={a.url} alt={a.name} /></a>)}</div>
        <div className="two">{!teacher && <button className="btn ghost" onClick={() => edit(t)}><Pencil size={14} /> Edit</button>}<button className="btn danger" onClick={() => remove(t)}><Trash2 size={14} /> Hapus</button></div>
      </div>))}</div>}
  </div>);
}
