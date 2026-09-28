// Permanently deletes the caller's account. Profile, plans and logs go with it (on delete cascade).
import { createClient } from 'npm:@supabase/supabase-js@2.117.1';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  // Identity comes from the verified token, never from the request body.
  const { data } = await admin.auth.getUser(token);
  if (!data.user) return json({ error: 'not signed in' }, 401);
  const { error } = await admin.auth.admin.deleteUser(data.user.id);
  if (error) return json({ error: error.message }, 500);
  return json({ deleted: true });
});
