// What a user may see of their buddy: name, streak and last workout day. Nothing else leaves the database.
// Reads the buddy's rows with the service role, so the fields returned below are the privacy boundary.
import { createClient } from 'npm:@supabase/supabase-js@2.117.1';
import { buddyStreak, type Person } from '../_shared/buddy.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const auth = req.headers.get('Authorization') ?? '';
  const db = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: userData } = await db.auth.getUser(auth.replace('Bearer ', ''));
  const me = userData.user?.id;
  if (!me) return json({ error: 'not signed in' }, 401);

  // The caller's own date, so "today" matches their clock.
  const { today } = await req.json().catch(() => ({}));
  if (typeof today !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return json({ error: 'today required' }, 400);

  // Row level security only returns a link the caller belongs to.
  const { data: link } = await db.from('buddy_links').select('*').maybeSingle();
  if (!link) return json({ state: 'none' });
  if (!link.buddy) return json({ state: 'invited', code: link.code });

  const other = link.inviter === me ? link.buddy : link.inviter;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const person = async (id: string) => {
    const [{ data: p }, { data: logs }] = await Promise.all([
      admin.from('profiles').select('display_name, schedule').eq('user_id', id).maybeSingle(),
      admin.from('workout_logs').select('logged_on').eq('user_id', id).neq('completed', 'skip'),
    ]);
    const done = [...new Set((logs ?? []).map((l) => l.logged_on as string))].sort();
    return { name: p?.display_name as string | null, schedule: (p?.schedule ?? []) as number[], done };
  };
  const [mine, theirs] = await Promise.all([person(me), person(other)]);
  const as = (x: typeof mine): Person => ({ schedule: x.schedule, done: x.done });

  return json({
    state: 'paired',
    name: theirs.name ?? 'Your buddy',
    streak: buddyStreak(as(mine), as(theirs), link.paired_on, today),
    lastWorkoutOn: theirs.done.at(-1) ?? null,
  });
});
