-- UzAstro: asosiy sxema, RLS va server tomonidagi o'yin mantiqi
-- Supabase SQL Editor'da bajaring (001_schema.sql, so'ng seed.sql).

create extension if not exists pgcrypto;

-- ============================================================
-- Yordamchi: daraja formulasi (klient bilan bir xil: xp(n) = 50*n*(n-1))
-- ============================================================
create or replace function public.level_from_xp(p_xp int)
returns int language sql immutable as $$
  select greatest(1, floor((1 + sqrt(1 + greatest(p_xp,0) / 12.5)) / 2)::int);
$$;

-- ============================================================
-- Profillar
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  bio text not null default '' check (char_length(bio) <= 300),
  avatar_url text,
  avatar_emoji text not null default '🧑‍🚀',
  timezone text not null default 'Asia/Tashkent',
  xp int not null default 0,
  level int not null default 1,
  streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date,
  quests_done int not null default 0,
  hard_done int not null default 0,
  correct_answers int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_read" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Mijoz faqat xavfsiz ustunlarni o'zgartira oladi; xp/level/streak faqat serverdan.
revoke update on public.profiles from authenticated, anon;
grant update (display_name, bio, avatar_url, avatar_emoji, username, timezone)
  on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
  v_name text;
begin
  v_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', ''), '[^a-z0-9_]', '', 'gi'));
  if v_username !~ '^[a-z0-9_]{3,20}$' or exists (select 1 from public.profiles where username = v_username) then
    v_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  v_name := coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), v_username);
  insert into public.profiles (id, username, display_name) values (new.id, v_username, left(v_name, 40));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Faollik, XP tarixi, bildirishnomalar
-- ============================================================
create table public.activity_days (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);
alter table public.activity_days enable row level security;
create policy "activity_read_own" on public.activity_days for select to authenticated using (user_id = auth.uid());

create table public.xp_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now()
);
create index on public.xp_events (user_id, created_at desc);
create index on public.xp_events (created_at);
alter table public.xp_events enable row level security;
create policy "xp_read_own" on public.xp_events for select to authenticated using (user_id = auth.uid());

create table public.notifications (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,            -- new_quests | achievement | team_invite | level_up | streak | team_event
  title text not null,
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
create policy "notif_read_own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notif_update_own" on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;
create policy "notif_delete_own" on public.notifications for delete to authenticated using (user_id = auth.uid());

-- ============================================================
-- Jamoalar
-- ============================================================
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text unique not null check (char_length(name) between 3 and 30),
  description text not null default '' check (char_length(description) <= 300),
  emoji text not null default '🚀',
  color text not null default '#35C8FF',
  is_open boolean not null default true,
  leader_id uuid not null references public.profiles(id),
  xp int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;
create policy "teams_read" on public.teams for select to authenticated using (true);
create policy "teams_update_leader" on public.teams for update to authenticated
  using (leader_id = auth.uid()) with check (leader_id = auth.uid());
revoke update on public.teams from authenticated;
grant update (name, description, emoji, color, is_open) on public.teams to authenticated;

create table public.team_members (
  user_id uuid primary key references public.profiles(id) on delete cascade, -- bitta foydalanuvchi = bitta jamoa
  team_id uuid not null references public.teams(id) on delete cascade,
  role text not null default 'member' check (role in ('leader','member')),
  xp_contributed int not null default 0,
  joined_at timestamptz not null default now()
);
create index on public.team_members (team_id);
alter table public.team_members enable row level security;
create policy "members_read" on public.team_members for select to authenticated using (true);

create table public.team_messages (
  id bigserial primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index on public.team_messages (team_id, created_at desc);
alter table public.team_messages enable row level security;
create policy "tmsg_read_members" on public.team_messages for select to authenticated
  using (exists (select 1 from public.team_members m where m.team_id = team_messages.team_id and m.user_id = auth.uid()));
create policy "tmsg_insert_members" on public.team_messages for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.team_members m where m.team_id = team_messages.team_id and m.user_id = auth.uid()));

create table public.team_invites (
  id bigserial primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  invited_user uuid not null references public.profiles(id) on delete cascade,
  invited_by uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique (team_id, invited_user)
);
alter table public.team_invites enable row level security;
create policy "invites_read" on public.team_invites for select to authenticated
  using (invited_user = auth.uid() or invited_by = auth.uid());

create table public.team_events (
  id bigserial primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
create index on public.team_events (team_id, created_at desc);
alter table public.team_events enable row level security;
create policy "tevents_read" on public.team_events for select to authenticated using (true);

-- ============================================================
-- Vazifalar, viktorina, mavzular
-- ============================================================
create table public.quest_templates (
  id serial primary key,
  code text unique not null,
  title text not null,
  description text not null,
  icon text not null,
  difficulty text not null check (difficulty in ('oson','orta','qiyin')),
  xp int not null,
  topic text not null,
  question_count int not null,
  need_correct int not null
);
alter table public.quest_templates enable row level security;
create policy "qt_read" on public.quest_templates for select to authenticated using (true);

create table public.quiz_questions (
  id serial primary key,
  topic text not null,
  question text not null,
  options jsonb not null,           -- ["A","B","C","D"]
  correct int not null,             -- to'g'ri variant indeksi (mijozga HECH QACHON berilmaydi)
  explanation text not null
);
create index on public.quiz_questions (topic);
alter table public.quiz_questions enable row level security;  -- siyosat yo'q: to'g'ridan-to'g'ri o'qib bo'lmaydi

create table public.quest_completions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id int not null references public.quest_templates(id),
  quest_date date not null,
  score int not null,
  total int not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, quest_id, quest_date)
);
alter table public.quest_completions enable row level security;
create policy "qc_read_own" on public.quest_completions for select to authenticated using (user_id = auth.uid());

create table public.topic_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  studied_at timestamptz not null default now(),
  primary key (user_id, topic)
);
alter table public.topic_progress enable row level security;
create policy "tp_read_own" on public.topic_progress for select to authenticated using (user_id = auth.uid());

create table public.topic_quiz_runs (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic text not null,
  run_date date not null,
  score int not null,
  primary key (user_id, topic, run_date)
);
alter table public.topic_quiz_runs enable row level security;
create policy "tqr_read_own" on public.topic_quiz_runs for select to authenticated using (user_id = auth.uid());

-- ============================================================
-- Yutuqlar
-- ============================================================
create table public.achievements (
  code text primary key,
  title text not null,
  description text not null,
  icon text not null,
  kind text not null,       -- quests | streak | correct | hard | leader | topics | level | team
  threshold int not null default 1,
  xp_reward int not null default 0,
  sort int not null default 0
);
alter table public.achievements enable row level security;
create policy "ach_read" on public.achievements for select to authenticated using (true);

create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  code text not null references public.achievements(code),
  earned_at timestamptz not null default now(),
  primary key (user_id, code)
);
alter table public.user_achievements enable row level security;
create policy "ua_read" on public.user_achievements for select to authenticated using (true);

-- ============================================================
-- Kosmik voqealar
-- ============================================================
create table public.space_events (
  id serial primary key,
  kind text not null,       -- meteor | eclipse | conjunction | mission
  title text not null,
  description text not null,
  starts_on date not null,
  note text
);
alter table public.space_events enable row level security;
create policy "se_read" on public.space_events for select to authenticated using (true);

-- ============================================================
-- AI Yordamchi
-- ============================================================
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Yangi suhbat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.ai_conversations (user_id, updated_at desc);
alter table public.ai_conversations enable row level security;
create policy "aic_own" on public.ai_conversations for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.ai_messages (
  id bigserial primary key,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
create index on public.ai_messages (conversation_id, created_at);
alter table public.ai_messages enable row level security;
create policy "aim_own" on public.ai_messages for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- Storage: avatarlar
-- ============================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- SERVER MANTIQI (SECURITY DEFINER) — barcha XP shu yerdan beriladi
-- ============================================================
create or replace function public.local_today(p_uid uuid)
returns date language sql stable security definer set search_path = public as $$
  select (now() at time zone coalesce((select timezone from public.profiles where id = p_uid), 'Asia/Tashkent'))::date;
$$;

create or replace function public.notify(p_uid uuid, p_kind text, p_title text, p_body text default '')
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, kind, title, body) values (p_uid, p_kind, p_title, p_body);
$$;

create or replace function public.award_xp(p_uid uuid, p_amount int, p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_old_level int;
  v_new_xp int;
  v_new_level int;
  v_team uuid;
  v_team_xp int;
begin
  if p_amount <= 0 then return; end if;
  select level into v_old_level from public.profiles where id = p_uid for update;
  update public.profiles set xp = xp + p_amount where id = p_uid returning xp into v_new_xp;
  v_new_level := public.level_from_xp(v_new_xp);
  if v_new_level > v_old_level then
    update public.profiles set level = v_new_level where id = p_uid;
    perform public.notify(p_uid, 'level_up', 'Yangi daraja!', v_new_level || '-darajaga ko''tarildingiz');
  end if;
  insert into public.xp_events (user_id, amount, reason) values (p_uid, p_amount, p_reason);

  update public.team_members set xp_contributed = xp_contributed + p_amount
    where user_id = p_uid returning team_id into v_team;
  if v_team is not null then
    update public.teams set xp = xp + p_amount where id = v_team returning xp into v_team_xp;
  end if;
end $$;

create or replace function public.check_achievements(p_uid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  a record;
  p public.profiles;
  v_val int;
begin
  select * into p from public.profiles where id = p_uid;
  for a in select * from public.achievements
           where code not in (select code from public.user_achievements where user_id = p_uid) loop
    v_val := case a.kind
      when 'quests'  then p.quests_done
      when 'streak'  then p.longest_streak
      when 'correct' then p.correct_answers
      when 'hard'    then p.hard_done
      when 'level'   then p.level
      when 'topics'  then (select count(*) from public.topic_progress where user_id = p_uid)
      when 'leader'  then (select count(*) from public.teams where leader_id = p_uid)
      when 'team'    then (select count(*) from public.team_members where user_id = p_uid)
      else 0 end;
    if v_val >= a.threshold then
      insert into public.user_achievements (user_id, code) values (p_uid, a.code) on conflict do nothing;
      perform public.notify(p_uid, 'achievement', 'Yangi yutuq: ' || a.title, a.description);
      if a.xp_reward > 0 then perform public.award_xp(p_uid, a.xp_reward, 'achievement:' || a.code); end if;
      select * into p from public.profiles where id = p_uid;
    end if;
  end loop;
end $$;

-- Kunlik seriyani yangilash (foydalanuvchining mahalliy sanasi bo'yicha)
create or replace function public.touch_streak(p_uid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_today date := public.local_today(p_uid);
  v_last date;
  v_streak int;
  v_bonus int;
begin
  select last_active_date, streak into v_last, v_streak from public.profiles where id = p_uid for update;
  if v_last = v_today then return; end if;
  if v_last = v_today - 1 then v_streak := v_streak + 1; else v_streak := 1; end if;
  update public.profiles
    set streak = v_streak, longest_streak = greatest(longest_streak, v_streak), last_active_date = v_today
    where id = p_uid;
  insert into public.activity_days (user_id, day) values (p_uid, v_today) on conflict do nothing;

  v_bonus := case v_streak when 3 then 20 when 7 then 50 when 14 then 100
                           when 30 then 250 when 50 then 400 when 100 then 1000 else 0 end;
  if v_bonus > 0 then
    perform public.notify(p_uid, 'streak', v_streak || ' kunlik seriya!', 'Mukofot: +' || v_bonus || ' XP');
    perform public.award_xp(p_uid, v_bonus, 'streak:' || v_streak);
  end if;
end $$;

-- Bugungi vazifalar (Toshkent sanasi bo'yicha: 2 oson, 2 o'rtacha, 1 qiyin)
create or replace function public.my_daily_quests()
returns table (
  id int, code text, title text, description text, icon text, difficulty text, xp int,
  topic text, question_count int, need_correct int, done boolean, score int, total int
) language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Tashkent')::date;
begin
  if v_uid is null then raise exception 'Kirish talab qilinadi'; end if;
  if not exists (select 1 from public.notifications
                 where user_id = v_uid and kind = 'new_quests'
                   and (created_at at time zone 'Asia/Tashkent')::date = v_today) then
    perform public.notify(v_uid, 'new_quests', 'Yangi kunlik vazifalar', 'Bugungi vazifalar tayyor. Bajarishni boshlang!');
  end if;
  return query
  with picked as (
    (select t.* from public.quest_templates t where t.difficulty = 'oson'
       order by md5(t.code || (now() at time zone 'Asia/Tashkent')::date::text) limit 2)
    union all
    (select t.* from public.quest_templates t where t.difficulty = 'orta'
       order by md5(t.code || (now() at time zone 'Asia/Tashkent')::date::text) limit 2)
    union all
    (select t.* from public.quest_templates t where t.difficulty = 'qiyin'
       order by md5(t.code || (now() at time zone 'Asia/Tashkent')::date::text) limit 1)
  )
  select p.id, p.code, p.title, p.description, p.icon, p.difficulty, p.xp, p.topic, p.question_count, p.need_correct,
         (c.user_id is not null), c.score, c.total
  from picked p
  left join public.quest_completions c
    on c.quest_id = p.id and c.user_id = v_uid and c.quest_date = (now() at time zone 'Asia/Tashkent')::date;
end $$;

-- Viktorina savollari (to'g'ri javobsiz)
create or replace function public.get_quiz(p_topic text, p_count int)
returns table (id int, question text, options jsonb)
language sql security definer set search_path = public as $$
  select q.id, q.question, q.options from public.quiz_questions q
  where q.topic = p_topic order by random() limit greatest(1, least(p_count, 10));
$$;

-- Vazifa viktorinasini topshirish: ball serverda hisoblanadi
create or replace function public.submit_quest_quiz(p_quest int, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  t public.quest_templates;
  v_today date;
  v_total int := 0;
  v_score int := 0;
  v_review jsonb := '[]'::jsonb;
  r record;
  v_passed boolean;
  v_in_today boolean;
begin
  if v_uid is null then raise exception 'Kirish talab qilinadi'; end if;
  select * into t from public.quest_templates where id = p_quest;
  if not found then raise exception 'Vazifa topilmadi'; end if;
  v_today := (now() at time zone 'Asia/Tashkent')::date;

  -- vazifa bugungi to'plamda bormi?
  select exists (select 1 from public.my_daily_quests() d where d.id = p_quest) into v_in_today;
  if not v_in_today then raise exception 'Bu vazifa bugun mavjud emas'; end if;
  if exists (select 1 from public.quest_completions where user_id = v_uid and quest_id = p_quest and quest_date = v_today) then
    raise exception 'Vazifa allaqachon bajarilgan';
  end if;

  for r in
    select q.id, q.question, q.options, q.correct, q.explanation, (x.a->>'choice')::int as choice
    from (select distinct on ((a->>'id')::int) a from jsonb_array_elements(p_answers) a
          order by (a->>'id')::int) x
    join public.quiz_questions q on q.id = (x.a->>'id')::int and q.topic = t.topic
    limit t.question_count
  loop
    v_total := v_total + 1;
    if r.choice = r.correct then v_score := v_score + 1; end if;
    v_review := v_review || jsonb_build_object('id', r.id, 'correct', r.correct, 'ok', r.choice = r.correct, 'explanation', r.explanation);
  end loop;

  if v_total < t.question_count then raise exception 'Barcha savollarga javob bering'; end if;
  v_passed := v_score >= t.need_correct;

  if v_passed then
    insert into public.quest_completions (user_id, quest_id, quest_date, score, total) values (v_uid, p_quest, v_today, v_score, v_total);
    update public.profiles set quests_done = quests_done + 1,
      hard_done = hard_done + case when t.difficulty = 'qiyin' then 1 else 0 end,
      correct_answers = correct_answers + v_score where id = v_uid;
    perform public.award_xp(v_uid, t.xp, 'quest:' || t.code);
    perform public.touch_streak(v_uid);
    perform public.check_achievements(v_uid);
  end if;
  return jsonb_build_object('score', v_score, 'total', v_total, 'passed', v_passed,
                            'xp', case when v_passed then t.xp else 0 end, 'review', v_review);
end $$;

-- Mavzu bo'yicha mashq testi: kuniga bir marta mukofot beriladi
create or replace function public.submit_topic_quiz(p_topic text, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Tashkent')::date;
  v_total int := 0; v_score int := 0; v_xp int := 0;
  v_review jsonb := '[]'::jsonb;
  r record;
  v_first boolean;
begin
  if v_uid is null then raise exception 'Kirish talab qilinadi'; end if;
  for r in
    select q.id, q.correct, q.explanation, (x.a->>'choice')::int as choice
    from (select distinct on ((a->>'id')::int) a from jsonb_array_elements(p_answers) a
          order by (a->>'id')::int) x
    join public.quiz_questions q on q.id = (x.a->>'id')::int and q.topic = p_topic
    limit 10
  loop
    v_total := v_total + 1;
    if r.choice = r.correct then v_score := v_score + 1; end if;
    v_review := v_review || jsonb_build_object('id', r.id, 'correct', r.correct, 'ok', r.choice = r.correct, 'explanation', r.explanation);
  end loop;
  if v_total = 0 then raise exception 'Javoblar topilmadi'; end if;

  insert into public.topic_quiz_runs (user_id, topic, run_date, score) values (v_uid, p_topic, v_today, v_score)
    on conflict do nothing;
  v_first := found;
  if v_first then
    v_xp := v_score * 5;
    update public.profiles set correct_answers = correct_answers + v_score where id = v_uid;
    if v_xp > 0 then perform public.award_xp(v_uid, v_xp, 'topic_quiz:' || p_topic); end if;
    perform public.touch_streak(v_uid);
    perform public.check_achievements(v_uid);
  end if;
  return jsonb_build_object('score', v_score, 'total', v_total, 'xp', v_xp, 'rewarded', v_first, 'review', v_review);
end $$;

-- Mavzuni o'rganish: birinchi marta +15 XP
create or replace function public.study_topic(p_topic text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_new boolean;
begin
  if v_uid is null then raise exception 'Kirish talab qilinadi'; end if;
  insert into public.topic_progress (user_id, topic) values (v_uid, p_topic) on conflict do nothing;
  v_new := found;
  if v_new then
    perform public.award_xp(v_uid, 15, 'study:' || p_topic);
    perform public.touch_streak(v_uid);
    perform public.check_achievements(v_uid);
  end if;
  return jsonb_build_object('xp', case when v_new then 15 else 0 end);
end $$;

-- ----- Jamoa funksiyalari -----
create or replace function public.create_team(p_name text, p_description text, p_emoji text, p_color text, p_open boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'Kirish talab qilinadi'; end if;
  if exists (select 1 from public.team_members where user_id = v_uid) then raise exception 'Siz allaqachon jamoadasiz'; end if;
  insert into public.teams (name, description, emoji, color, is_open, leader_id)
    values (trim(p_name), coalesce(p_description,''), coalesce(p_emoji,'🚀'), coalesce(p_color,'#35C8FF'), coalesce(p_open,true), v_uid)
    returning id into v_id;
  insert into public.team_members (user_id, team_id, role) values (v_uid, v_id, 'leader');
  insert into public.team_events (team_id, text) values (v_id, 'Jamoa tashkil etildi');
  perform public.check_achievements(v_uid);
  return v_id;
end $$;

create or replace function public.join_team(p_team uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); t public.teams; v_cnt int; v_name text;
begin
  if v_uid is null then raise exception 'Kirish talab qilinadi'; end if;
  select * into t from public.teams where id = p_team;
  if not found then raise exception 'Jamoa topilmadi'; end if;
  if not t.is_open then raise exception 'Bu jamoa faqat taklif orqali qo''shiladi'; end if;
  if exists (select 1 from public.team_members where user_id = v_uid) then raise exception 'Siz allaqachon jamoadasiz'; end if;
  select count(*) into v_cnt from public.team_members where team_id = p_team;
  if v_cnt >= 20 then raise exception 'Jamoa to''lgan (maksimum 20)'; end if;
  insert into public.team_members (user_id, team_id) values (v_uid, p_team);
  select display_name into v_name from public.profiles where id = v_uid;
  insert into public.team_events (team_id, text) values (p_team, v_name || ' jamoaga qo''shildi');
  perform public.notify(t.leader_id, 'team_event', 'Yangi a''zo', v_name || ' "' || t.name || '" jamoasiga qo''shildi');
  perform public.check_achievements(v_uid);
end $$;

create or replace function public.leave_team()
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); m public.team_members; v_next uuid; v_name text;
begin
  select * into m from public.team_members where user_id = v_uid;
  if not found then return; end if;
  select display_name into v_name from public.profiles where id = v_uid;
  delete from public.team_members where user_id = v_uid;
  select user_id into v_next from public.team_members where team_id = m.team_id order by joined_at limit 1;
  if v_next is null then
    delete from public.teams where id = m.team_id;
  else
    if m.role = 'leader' then
      update public.team_members set role = 'leader' where user_id = v_next;
      update public.teams set leader_id = v_next where id = m.team_id;
    end if;
    insert into public.team_events (team_id, text) values (m.team_id, v_name || ' jamoadan chiqdi');
  end if;
end $$;

create or replace function public.invite_to_team(p_username text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); m public.team_members; v_target uuid; t public.teams; v_name text;
begin
  select * into m from public.team_members where user_id = v_uid;
  if not found then raise exception 'Avval jamoaga qo''shiling'; end if;
  select id into v_target from public.profiles where username = lower(trim(p_username));
  if v_target is null then raise exception 'Foydalanuvchi topilmadi'; end if;
  if exists (select 1 from public.team_members where user_id = v_target) then raise exception 'Foydalanuvchi allaqachon jamoada'; end if;
  insert into public.team_invites (team_id, invited_user, invited_by) values (m.team_id, v_target, v_uid)
    on conflict (team_id, invited_user) do update set status = 'pending', invited_by = v_uid, created_at = now();
  select * into t from public.teams where id = m.team_id;
  select display_name into v_name from public.profiles where id = v_uid;
  perform public.notify(v_target, 'team_invite', 'Jamoaga taklif', v_name || ' sizni "' || t.name || '" jamoasiga taklif qildi');
end $$;

create or replace function public.respond_invite(p_invite bigint, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); i public.team_invites;
begin
  select * into i from public.team_invites where id = p_invite and invited_user = v_uid and status = 'pending';
  if not found then raise exception 'Taklif topilmadi'; end if;
  if p_accept then
    if exists (select 1 from public.team_members where user_id = v_uid) then raise exception 'Siz allaqachon jamoadasiz'; end if;
    insert into public.team_members (user_id, team_id) values (v_uid, i.team_id);
    update public.team_invites set status = 'accepted' where id = p_invite;
    insert into public.team_events (team_id, text)
      values (i.team_id, (select display_name from public.profiles where id = v_uid) || ' taklifni qabul qildi');
    perform public.check_achievements(v_uid);
  else
    update public.team_invites set status = 'declined' where id = p_invite;
  end if;
end $$;

-- Jamoaning haftalik maqsadlari (a'zolar XP si bo'yicha, Toshkent haftasi)
create or replace function public.team_goals(p_team uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_week_start timestamptz := date_trunc('week', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent';
  v_xp int; v_active int;
begin
  select coalesce(sum(e.amount),0) into v_xp from public.xp_events e
    join public.team_members m on m.user_id = e.user_id and m.team_id = p_team
    where e.created_at >= v_week_start;
  select count(distinct e.user_id) into v_active from public.xp_events e
    join public.team_members m on m.user_id = e.user_id and m.team_id = p_team
    where e.created_at >= v_week_start;
  return jsonb_build_array(
    jsonb_build_object('title','Haftalik 300 XP','current',v_xp,'target',300),
    jsonb_build_object('title','Haftalik 1000 XP','current',v_xp,'target',1000),
    jsonb_build_object('title','3 faol a''zo','current',v_active,'target',3)
  );
end $$;

-- ----- Reyting va statistika -----
create or replace function public.leaderboard(p_period text, p_limit int default 50)
returns table (rank bigint, id uuid, username text, display_name text, avatar_emoji text, avatar_url text,
               level int, xp bigint, quests_done int)
language plpgsql stable security definer set search_path = public as $$
declare v_from timestamptz;
begin
  if p_period = 'weekly' then v_from := date_trunc('week', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent';
  elsif p_period = 'monthly' then v_from := date_trunc('month', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent';
  else v_from := null; end if;
  return query
  select row_number() over (order by s.pxp desc, p.created_at), p.id, p.username, p.display_name, p.avatar_emoji,
         p.avatar_url, p.level, s.pxp::bigint, p.quests_done
  from public.profiles p
  cross join lateral (
    select case when v_from is null then p.xp::bigint
                else coalesce((select sum(e.amount) from public.xp_events e where e.user_id = p.id and e.created_at >= v_from),0) end as pxp
  ) s
  where v_from is null or s.pxp > 0
  order by s.pxp desc, p.created_at
  limit greatest(1, least(p_limit, 100));
end $$;

create or replace function public.team_leaderboard(p_limit int default 50)
returns table (rank bigint, id uuid, name text, emoji text, color text, xp int, level int, members bigint)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by t.xp desc, t.created_at), t.id, t.name, t.emoji, t.color, t.xp,
         public.level_from_xp(t.xp / 3), (select count(*) from public.team_members m where m.team_id = t.id)
  from public.teams t order by t.xp desc, t.created_at limit greatest(1, least(p_limit, 100));
$$;

create or replace function public.public_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'quests', (select count(*) from public.quest_completions),
    'teams', (select count(*) from public.teams));
$$;

-- Ruxsatlar: ichki funksiyalar mijozdan yopiq, ommaviy RPC'lar ochiq
revoke all on function public.award_xp(uuid,int,text), public.check_achievements(uuid),
  public.touch_streak(uuid), public.notify(uuid,text,text,text), public.local_today(uuid) from public, anon, authenticated;
revoke all on function public.my_daily_quests(), public.get_quiz(text,int), public.submit_quest_quiz(int,jsonb),
  public.submit_topic_quiz(text,jsonb), public.study_topic(text), public.create_team(text,text,text,text,boolean),
  public.join_team(uuid), public.leave_team(), public.invite_to_team(text), public.respond_invite(bigint,boolean),
  public.team_goals(uuid), public.leaderboard(text,int), public.team_leaderboard(int) from public, anon;
grant execute on function public.my_daily_quests(), public.get_quiz(text,int), public.submit_quest_quiz(int,jsonb),
  public.submit_topic_quiz(text,jsonb), public.study_topic(text), public.create_team(text,text,text,text,boolean),
  public.join_team(uuid), public.leave_team(), public.invite_to_team(text), public.respond_invite(bigint,boolean),
  public.team_goals(uuid), public.leaderboard(text,int), public.team_leaderboard(int) to authenticated;
grant execute on function public.public_stats() to anon, authenticated;
grant execute on function public.level_from_xp(int) to anon, authenticated;

-- Realtime: jamoa chati
alter publication supabase_realtime add table public.team_messages;


-- ==================== SEED DATA ====================

-- UzAstro: boshlang'ich ma'lumotlar. 001_schema.sql dan KEYIN bajaring.

insert into public.quest_templates (code,title,description,icon,difficulty,xp,topic,question_count,need_correct) values
('planets_easy','Sayyoralar sinovi','Sayyoralar haqida 3 ta savolga javob bering (kamida 2 tasi to''g''ri).','🪐','oson',20,'sayyoralar',3,2),
('solar_easy','Quyosh tizimi sinovi','Quyosh tizimi bo''yicha 3 ta savol. Kamida 2 tasi to''g''ri bo''lsin.','☀️','oson',20,'quyosh-tizimi',3,2),
('moon_easy','Oy sirlari','Oy haqida 3 ta savolga javob bering.','🌙','oson',20,'oy',3,2),
('stars_mid','Yulduzlar viktorinasi','Yulduzlar haqida 4 ta savol, kamida 3 tasi to''g''ri.','⭐','orta',40,'yulduzlar',4,3),
('galaxy_mid','Galaktikani o''rgan','Galaktikalar mavzusida 4 savol, kamida 3 tasi to''g''ri.','🌌','orta',40,'galaktikalar',4,3),
('mission_mid','Kosmik missiyalar','Kosmik missiyalar bo''yicha 4 savol, kamida 3 tasi to''g''ri.','🚀','orta',40,'missiyalar',4,3),
('secrets_mid','Koinot sirlari','Koinot sirlari bo''yicha 4 savol, kamida 3 tasi to''g''ri.','🔭','orta',40,'koinot-sirlari',4,3),
('bh_hard','Qora tuynuklar: mukammal natija','Qora tuynuklar haqida 4 savol — hammasiga to''g''ri javob bering.','🕳️','qiyin',80,'qora-tuynuklar',4,4),
('secrets_hard','Koinot sirlari: mukammal natija','4 ta savolning hammasiga to''g''ri javob bering.','🧠','qiyin',80,'koinot-sirlari',4,4),
('planets_hard','Sayyoralar ustasi','Sayyoralar bo''yicha 4 savolning hammasiga to''g''ri javob bering.','🪐','qiyin',80,'sayyoralar',4,4)
on conflict (code) do nothing;

insert into public.quiz_questions (topic,question,options,correct,explanation) values
('quyosh-tizimi','Quyosh tizimida nechta sayyora bor?','["7", "8", "9", "10"]'::jsonb,1,'Quyosh tizimida 8 ta sayyora bor: Merkuriy, Venera, Yer, Mars, Yupiter, Saturn, Uran va Neptun. Pluton 2006-yilda mitti sayyora deb tasniflangan.'),
('quyosh-tizimi','Quyoshdan Yergacha o''rtacha masofa taxminan qancha?','["15 million km", "150 million km", "1,5 milliard km", "15 milliard km"]'::jsonb,1,'O''rtacha masofa taxminan 150 million km — bu 1 astronomik birlik (AB).'),
('quyosh-tizimi','Quyosh tizimi umumiy massasining taxminan qancha qismi Quyoshga tegishli?','["50%", "75%", "90%", "99,8%"]'::jsonb,3,'Quyosh tizimi massasining taxminan 99,86% qismi Quyoshga to''g''ri keladi.'),
('quyosh-tizimi','Asteroidlar asosiy kamari qaysi sayyoralar orasida joylashgan?','["Yer va Mars", "Mars va Yupiter", "Yupiter va Saturn", "Uran va Neptun"]'::jsonb,1,'Asosiy asteroidlar kamari Mars va Yupiter orbitalari orasida joylashgan.'),
('sayyoralar','Quyosh tizimidagi eng katta sayyora qaysi?','["Saturn", "Neptun", "Yupiter", "Uran"]'::jsonb,2,'Yupiter eng katta sayyora: uning diametri Yernikidan taxminan 11 baravar katta.'),
('sayyoralar','Qaysi sayyora yuzasi eng issiq?','["Merkuriy", "Venera", "Mars", "Yupiter"]'::jsonb,1,'Venerada zich karbonat angidrid atmosferasi kuchli issiqxona effekti hosil qiladi; yuza harorati taxminan 465 °C.'),
('sayyoralar','Qaysi sayyora «Qizil sayyora» deb ataladi?','["Mars", "Venera", "Merkuriy", "Uran"]'::jsonb,0,'Mars yuzasidagi temir oksidi (zang) unga qizg''ish tus beradi.'),
('sayyoralar','Saturn halqalari asosan nimadan iborat?','["Gaz", "Suyuq metan", "Muz va tosh bo''laklari", "Qattiq metall"]'::jsonb,2,'Halqalar asosan suv muzi zarralaridan va oz miqdordagi tosh bo''laklaridan iborat.'),
('yulduzlar','Quyosh qaysi turdagi yulduz?','["Qizil gigant", "Oq mitti", "Sariq mitti", "Neytron yulduz"]'::jsonb,2,'Quyosh G2V spektral sinfiga mansub — odatda «sariq mitti» deb ataladi.'),
('yulduzlar','Yulduzlar yorug''lik va issiqlik energiyasini qanday olishadi?','["Kimyoviy yonish", "Yadro sintezi", "Radioaktiv yemirilish", "Gravitatsion sirpanish"]'::jsonb,1,'Yulduzlar yadrosida vodorod geliyga aylanadi (termoyadro sintezi) va energiya ajraladi.'),
('yulduzlar','Quyoshdan keyin Yerga eng yaqin yulduz qaysi?','["Sirius", "Proksima Sentavra", "Vega", "Betelgeyze"]'::jsonb,1,'Proksima Sentavra bizdan taxminan 4,24 yorug''lik yili uzoqlikda joylashgan.'),
('yulduzlar','Yulduzning rangi asosan nimaga bog''liq?','["Masofasiga", "Sirt haroratiga", "Aylanish tezligiga", "Faqat o''lchamiga"]'::jsonb,1,'Sirt harorati yuqori bo''lsa yulduz ko''kimtir-oq, past bo''lsa qizg''ish ko''rinadi.'),
('galaktikalar','Quyosh tizimi qaysi galaktikada joylashgan?','["Andromeda", "Somon yo''li", "Uchburchak", "Katta Magellan buluti"]'::jsonb,1,'Biz Somon yo''li galaktikasidamiz.'),
('galaktikalar','Somon yo''li qaysi turdagi galaktika?','["Elliptik", "Noto''g''ri shaklli", "To''siqli spiral", "Halqasimon"]'::jsonb,2,'Somon yo''li to''siqli spiral galaktika hisoblanadi.'),
('galaktikalar','Somon yo''liga eng yaqin yirik spiral galaktika qaysi?','["Andromeda (M31)", "Girdob (M51)", "Sombrero (M104)", "Pinwheel (M101)"]'::jsonb,0,'Andromeda galaktikasi bizdan taxminan 2,5 million yorug''lik yili uzoqlikda.'),
('galaktikalar','Ko''pchilik yirik galaktikalar markazida nima bo''ladi?','["Katta yulduz", "O''ta massiv qora tuynuk", "Bo''sh joy", "Neytron yulduzlar klasteri"]'::jsonb,1,'Ko''pchilik yirik galaktikalar markazida o''ta massiv qora tuynuk borligi kuzatilgan.'),
('qora-tuynuklar','Voqealar ufqi nima?','["Qora tuynuk yuzasidagi tog''", "Undan yorug''lik ham qochib chiqa olmaydigan chegara", "Qora tuynuk atrofidagi halqa", "Yulduzning tashqi qatlami"]'::jsonb,1,'Voqealar ufqi — bu chegara, undan o''tgan narsa (yorug''lik ham) tashqariga chiqa olmaydi.'),
('qora-tuynuklar','Event Horizon Telescope 2019-yilda qaysi galaktika markazidagi qora tuynuk tasvirini e''lon qildi?','["Somon yo''li", "Andromeda", "M87", "Uchburchak"]'::jsonb,2,'2019-yilda M87 galaktikasi markazidagi qora tuynukning birinchi tasviri e''lon qilindi.'),
('qora-tuynuklar','Somon yo''li markazidagi o''ta massiv qora tuynuk nomi nima?','["Cygnus X-1", "Sagittarius A*", "Proksima A", "Orion B"]'::jsonb,1,'Sagittarius A* massasi Quyosh massasidan taxminan 4 million marta katta.'),
('qora-tuynuklar','Yulduz-massali qora tuynuklar qanday hosil bo''lishi mumkin?','["Sayyoralar to''qnashuvidan", "Juda massiv yulduz o''z tortishish kuchi ostida qulashidan", "Kometalar yig''ilishidan", "Oy yemirilishidan"]'::jsonb,1,'Juda massiv yulduz yadrosi yonib bo''lgach qulab, qora tuynukka aylanishi mumkin.'),
('oy','Oy Yerdan o''rtacha qancha masofada?','["38 440 km", "384 400 km", "3 844 000 km", "150 000 000 km"]'::jsonb,1,'Oygacha o''rtacha masofa taxminan 384 400 km.'),
('oy','Inson Oyga birinchi marta qaysi yilda qadam qo''ygan?','["1957", "1961", "1969", "1975"]'::jsonb,2,'Apollo 11 missiyasi doirasida 1969-yil 20-iyulda Nil Armstrong Oyga qadam qo''ydi.'),
('oy','Nima uchun Oyning doim bir tomoni Yerga qaragan?','["Oy aylanmaydi", "Oyning o''z o''qi atrofida aylanish davri Yer atrofidagi aylanish davriga teng (sinxron aylanish)", "Yer Oyni ushlab turadi", "Magnit maydon tufayli"]'::jsonb,1,'Oyning o''z o''qi atrofida aylanish davri Yer atrofidagi aylanish davriga teng — bu sinxron aylanish.'),
('oy','Oy fazalari nima sababdan o''zgaradi?','["Yerning soyasi tufayli", "Oyning yorug''lik chiqarishi o''zgarishi tufayli", "Quyosh yoritgan qismini Yerdan turlicha ko''rishimiz tufayli", "Bulutlar tufayli"]'::jsonb,2,'Oy o''zi yorug''lik chiqarmaydi; faza Quyosh yoritgan qismini biz turli burchakdan ko''rishimizga bog''liq.'),
('koinot-sirlari','Katta portlashdan beri taxminan qancha vaqt o''tgan?','["13,8 million yil", "138 million yil", "13,8 milliard yil", "138 milliard yil"]'::jsonb,2,'Koinot yoshi taxminan 13,8 milliard yil deb baholanadi.'),
('koinot-sirlari','Koinot energiya tarkibining eng katta qismi nimadan iborat?','["Oddiy materiya", "Qorong''u materiya", "Qorong''u energiya", "Nurlanish"]'::jsonb,2,'Zamonaviy modelga ko''ra qorong''u energiya taxminan 68%, qorong''u materiya ~27%, oddiy materiya ~5%.'),
('koinot-sirlari','Vakuumda yorug''lik tezligi taxminan qancha?','["300 km/s", "30 000 km/s", "300 000 km/s", "3 000 000 km/s"]'::jsonb,2,'Yorug''lik tezligi taxminan 300 000 km/s.'),
('koinot-sirlari','Kosmik mikroto''lqinli fon nurlanishi nima?','["Yulduzlar nuri yig''indisi", "Katta portlashdan qolgan eng qadimgi nur", "Qora tuynuklar nurlanishi", "Quyosh shamoli"]'::jsonb,1,'Bu koinot shaffof bo''lgan davrdan qolgan eng qadimgi nurlanish (relikt nurlanish).'),
('missiyalar','Birinchi sun''iy yo''ldosh qaysi?','["Explorer-1", "Sputnik-1", "Vostok-1", "Hubble"]'::jsonb,1,'Sputnik-1 1957-yil 4-oktabrda uchirilgan.'),
('missiyalar','Yer orbitasiga chiqqan birinchi inson kim?','["Nil Armstrong", "Yuriy Gagarin", "Alan Shepard", "Valentina Tereshkova"]'::jsonb,1,'Yuriy Gagarin 1961-yil 12-aprelda «Vostok-1» kemasida kosmosga uchdi.'),
('missiyalar','Hubble kosmik teleskopi qaysi yilda orbitaga chiqarilgan?','["1975", "1990", "2001", "2021"]'::jsonb,1,'Hubble 1990-yilda uchirilgan.'),
('missiyalar','James Webb teleskopi asosan qaysi diapazonda kuzatadi?','["Rentgen", "Ultrabinafsha", "Infraqizil", "Radio"]'::jsonb,2,'James Webb teleskopi asosan infraqizil nurlarda ishlaydi.');

insert into public.achievements (code,title,description,icon,kind,threshold,xp_reward,sort) values
('birinchi_qadam','Birinchi qadam','Birinchi kunlik vazifani bajaring.','👣','quests',1,10,1),
('vazifa_10','Faol o''quvchi','10 ta kunlik vazifani bajaring.','📘','quests',10,50,2),
('kosmos_tadqiqotchisi','Kosmos tadqiqotchisi','Kashfiyotlar bo''limidagi barcha 8 ta mavzuni o''rganing.','🛰️','topics',8,100,3),
('seriya_3','3 kunlik faollik','3 kun ketma-ket faol bo''ling.','🔥','streak',3,0,4),
('seriya_7','7 kunlik faollik','7 kun ketma-ket faol bo''ling.','🔥','streak',7,0,5),
('seriya_14','14 kunlik faollik','14 kun ketma-ket faol bo''ling.','🔥','streak',14,0,6),
('seriya_30','30 kunlik faollik','30 kun ketma-ket faol bo''ling.','🌋','streak',30,0,7),
('seriya_50','50 kunlik faollik','50 kun ketma-ket faol bo''ling.','☄️','streak',50,0,8),
('seriya_100','100 kunlik faollik','100 kun ketma-ket faol bo''ling.','👑','streak',100,0,9),
('bilimdon','Bilimdon','100 ta to''g''ri javob bering.','🎓','correct',100,150,10),
('jamoa_azosi','Jamoadosh','Biror jamoaga qo''shiling.','🤝','team',1,20,11),
('jamoa_sardori','Jamoa sardori','O''z jamoangizni yarating va boshqaring.','🧭','leader',1,50,12),
('galaktika_ustasi','Galaktika ustasi','10 ta qiyin vazifani bajaring.','🌠','hard',10,200,13),
('daraja_5','Kashshof','5-darajaga yeting.','🛸','level',5,0,14),
('daraja_10','Kosmonavt','10-darajaga yeting.','🧑‍🚀','level',10,0,15)
on conflict (code) do nothing;

insert into public.space_events (kind,title,description,starts_on,note) values
('meteor','Leonidlar meteor oqimi','Leonidlar oqimi odatda noyabr o''rtalarida faollik cho''qqisiga chiqadi. Yorug'' Oy bo''lmagan, qorong''i osmonda kuzatish yaxshi.','2026-11-17'::date,'Cho''qqi sanasi taxminiy; aniq vaqtni astronomik kalendardan tekshiring.'),
('meteor','Geminidlar meteor oqimi','Yilning eng boy meteor oqimlaridan biri; odatda dekabr o''rtalarida cho''qqiga chiqadi.','2026-12-13'::date,'Cho''qqi sanasi taxminiy; aniq vaqtni astronomik kalendardan tekshiring.'),
('meteor','Kvadrantidlar meteor oqimi','Yangi yilning birinchi yirik meteor oqimi; cho''qqisi juda qisqa muddatli.','2027-01-03'::date,'Cho''qqi sanasi taxminiy; aniq vaqtni astronomik kalendardan tekshiring.'),
('eclipse','To''liq Quyosh tutilishi (2027)','2027-yil 2-avgustda Shimoliy Afrika va Yaqin Sharq hududlarida to''liq Quyosh tutilishi kutilmoqda.','2027-08-02'::date,'Ko''rinish zonasi O''zbekistondan tashqarida bo''lishi mumkin; mintaqangiz uchun tekshiring.');

