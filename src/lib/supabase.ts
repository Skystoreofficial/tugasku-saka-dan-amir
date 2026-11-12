import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const configOk = /^https?:\/\/[^\s]+\.[^\s]+/.test(url ?? "") && !!key && key.length > 20;
export const supabase = createClient(configOk ? url! : "https://placeholder.supabase.co", configOk ? key! : "placeholder-key-placeholder-key");
export const SUBJECTS = ["Pendidikan Agama","PPKn","Bahasa Indonesia","Matematika","IPA","IPS","Bahasa Inggris","PJOK","Informatika","Seni Budaya","Bahasa Daerah","Prakarya"];
export type Profile = { id: string; username: string; full_name: string; role: "guru" | "siswa" };
export type Att = { id: string; path: string; name: string; mime: string | null; url?: string };
export type Task = { id: string; owner_id: string; title: string; subject: string; description: string; task_date: string; created_at: string; profiles?: { full_name: string; username: string }; attachments: Att[] };
