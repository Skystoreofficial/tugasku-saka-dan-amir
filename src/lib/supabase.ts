import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
export const SUBJECTS = ["Pendidikan Agama","PPKn","Bahasa Indonesia","Matematika","IPA","IPS","Bahasa Inggris","PJOK","Informatika","Seni Budaya","Bahasa Daerah","Prakarya"];
export type Profile = { id: string; username: string; full_name: string; role: "guru" | "siswa" };
export type Att = { id: string; path: string; name: string; mime: string | null; url?: string };
export type Task = { id: string; owner_id: string; title: string; subject: string; description: string; task_date: string; created_at: string; profiles?: { full_name: string; username: string }; attachments: Att[] };
