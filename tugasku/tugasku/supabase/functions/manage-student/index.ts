import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = Deno.env.get("SUPABASE_URL")!;
  const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
  const { data: { user } } = await caller.auth.getUser();
  if (!user) return json({ error: "Tidak terautentikasi" }, 401);
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "guru") return json({ error: "Hanya guru" }, 403);
  const b = await req.json();
  if (b.action === "create") {
    const username = String(b.username).trim().toLowerCase();
    if (!/^[a-z0-9._]{3,30}$/.test(username) || String(b.password).length < 6) return json({ error: "Username 3-30 karakter (huruf/angka/._), password min. 6" }, 400);
    const { data, error } = await admin.auth.admin.createUser({ email: `${username}@tugasku.app`, password: b.password, email_confirm: true });
    if (error) return json({ error: error.message }, 400);
    const { error: e2 } = await admin.from("profiles").insert({ id: data.user.id, username, full_name: b.full_name, role: "siswa" });
    if (e2) { await admin.auth.admin.deleteUser(data.user.id); return json({ error: e2.message }, 400); }
    return json({ ok: true });
  }
  if (b.action === "update") {
    if (b.password) { const { error } = await admin.auth.admin.updateUserById(b.id, { password: b.password }); if (error) return json({ error: error.message }, 400); }
    if (b.full_name) await admin.from("profiles").update({ full_name: b.full_name }).eq("id", b.id).eq("role", "siswa");
    return json({ ok: true });
  }
  return json({ error: "Aksi tidak dikenal" }, 400);
});
