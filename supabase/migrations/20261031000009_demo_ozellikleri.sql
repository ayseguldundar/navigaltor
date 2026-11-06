-- NavigAItor — demo özellikleri için pilot veri katmanı.
-- Mevcut hesap/atama/teslim tablolarını değiştirmez; ek özellikleri RLS + RPC ile kalıcılaştırır.

create table public.student_measurements (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  skill_code text not null check (skill_code ~ '^[A-Za-z0-9_-]{1,80}$'),
  score smallint not null check (score between 0 and 100),
  source text not null default 'teacher' check (source in ('teacher','assignment','assessment','simulation','control')),
  note text check (char_length(note) <= 2000),
  measured_at date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index student_measurements_student_idx on public.student_measurements(student_id, skill_code, measured_at desc);

create table public.student_observations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 5 and 2000),
  observed_at date not null default current_date,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index student_observations_student_idx on public.student_observations(student_id, observed_at desc);

create table public.student_goals (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  skill_code text not null check (skill_code ~ '^[A-Za-z0-9_-]{1,80}$'),
  goal text not null check (char_length(trim(goal)) between 5 and 2000),
  criterion text check (char_length(criterion) <= 1000),
  method text check (char_length(method) <= 500),
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index student_goals_student_idx on public.student_goals(student_id, status, created_at desc);

create table public.teacher_meetings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  kind text not null default 'parent' check (kind in ('parent','student')),
  meeting_date date not null,
  meeting_time time,
  subject text not null check (char_length(trim(subject)) between 2 and 500),
  status text not null default 'planned' check (status in ('planned','done','cancelled')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index teacher_meetings_school_idx on public.teacher_meetings(school_id, meeting_date, meeting_time);

create table public.teacher_messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid references public.profiles(id) on delete set null,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index teacher_messages_thread_idx on public.teacher_messages(student_id, created_at desc);

create table public.student_support_plans (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  guide text not null check (char_length(guide) <= 3000),
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 30),
  questions jsonb not null default '[]'::jsonb check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) <= 30),
  published boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id)
);

create table public.teacher_content (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  skill_code text not null check (skill_code ~ '^[A-Za-z0-9_-]{1,80}$'),
  title text not null check (char_length(trim(title)) between 2 and 300),
  content_type text not null default 'instruction' check (content_type in ('instruction','question','resource','feedback')),
  body text not null check (char_length(body) <= 10000),
  version integer not null default 1 check (version > 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index teacher_content_school_skill_idx on public.teacher_content(school_id, skill_code, updated_at desc);

create table public.teacher_notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (char_length(kind) between 1 and 80),
  body text not null check (char_length(body) <= 2000),
  target text check (char_length(target) <= 300),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index teacher_notifications_recipient_idx on public.teacher_notifications(recipient_id, created_at desc);

alter table public.student_measurements enable row level security;
alter table public.student_observations enable row level security;
alter table public.student_goals enable row level security;
alter table public.teacher_meetings enable row level security;
alter table public.teacher_messages enable row level security;
alter table public.student_support_plans enable row level security;
alter table public.teacher_content enable row level security;
alter table public.teacher_notifications enable row level security;

create policy "ölçümü yetkili kullanıcılar görür" on public.student_measurements for select to authenticated
  using (app.teaches_student(student_id) or student_id = (select app.my_student_id()) or student_id in (select app.parent_student_ids()));
create policy "gözlemi yetkili kullanıcılar görür" on public.student_observations for select to authenticated
  using (app.teaches_student(student_id) or student_id in (select app.parent_student_ids()));
create policy "hedefi yetkili kullanıcılar görür" on public.student_goals for select to authenticated
  using (app.teaches_student(student_id) or student_id = (select app.my_student_id()) or student_id in (select app.parent_student_ids()));
create policy "görüşmeyi personel görür" on public.teacher_meetings for select to authenticated
  using (app.teaches_student(student_id));
create policy "mesajı taraflar görür" on public.teacher_messages for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid() or app.teaches_student(student_id));
create policy "destek planını yetkili kullanıcılar görür" on public.student_support_plans for select to authenticated
  using (app.teaches_student(student_id) or (published and student_id in (select app.parent_student_ids())));
create policy "okul içeriği personel görür" on public.teacher_content for select to authenticated
  using (school_id = (select app.my_school()) and (select app.is_staff()));
create policy "bildirimi alıcısı görür" on public.teacher_notifications for select to authenticated
  using (recipient_id = auth.uid());

create or replace function public.save_student_measurement(p_student uuid, p_skill_code text, p_score int, p_source text default 'teacher', p_note text default null, p_measured_at date default current_date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not app.teaches_student(p_student) then raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501'; end if;
  insert into public.student_measurements(school_id,student_id,skill_code,score,source,note,measured_at,created_by)
  values(app.my_school(),p_student,trim(p_skill_code),p_score,coalesce(p_source,'teacher'),left(p_note,2000),coalesce(p_measured_at,current_date),auth.uid()) returning id into v_id;
  return v_id;
end $$;

create or replace function public.save_student_observation(p_student uuid, p_body text, p_observed_at date default current_date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not app.teaches_student(p_student) then raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501'; end if;
  insert into public.student_observations(school_id,student_id,body,observed_at,created_by)
  values(app.my_school(),p_student,left(trim(p_body),2000),coalesce(p_observed_at,current_date),auth.uid()) returning id into v_id;
  return v_id;
end $$;

create or replace function public.save_student_goal(p_student uuid, p_skill_code text, p_goal text, p_criterion text default null, p_method text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not app.teaches_student(p_student) then raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501'; end if;
  insert into public.student_goals(school_id,student_id,skill_code,goal,criterion,method,created_by)
  values(app.my_school(),p_student,trim(p_skill_code),left(trim(p_goal),2000),left(p_criterion,1000),left(p_method,500),auth.uid()) returning id into v_id;
  return v_id;
end $$;

create or replace function public.save_teacher_meeting(p_student uuid, p_kind text, p_date date, p_time time, p_subject text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not app.teaches_student(p_student) then raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501'; end if;
  insert into public.teacher_meetings(school_id,student_id,kind,meeting_date,meeting_time,subject,created_by)
  values(app.my_school(),p_student,coalesce(p_kind,'parent'),p_date,p_time,left(trim(p_subject),500),auth.uid()) returning id into v_id;
  return v_id;
end $$;

create or replace function public.save_support_plan(p_student uuid, p_guide text, p_items jsonb, p_questions jsonb, p_published boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not app.teaches_student(p_student) then raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501'; end if;
  insert into public.student_support_plans(school_id,student_id,guide,items,questions,published,created_by)
  values(app.my_school(),p_student,left(p_guide,3000),coalesce(p_items,'[]'::jsonb),coalesce(p_questions,'[]'::jsonb),coalesce(p_published,false),auth.uid())
  on conflict(student_id) do update set guide=excluded.guide,items=excluded.items,questions=excluded.questions,published=excluded.published,updated_at=now()
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.save_teacher_content(p_skill_code text, p_title text, p_type text, p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not app.is_staff() then raise exception 'Bu işlem için personel olmalısınız' using errcode = '42501'; end if;
  insert into public.teacher_content(school_id,skill_code,title,content_type,body,created_by)
  values(app.my_school(),trim(p_skill_code),left(trim(p_title),300),coalesce(p_type,'instruction'),left(p_body,10000),auth.uid()) returning id into v_id;
  return v_id;
end $$;

revoke all on public.student_measurements, public.student_observations, public.student_goals, public.teacher_meetings, public.teacher_messages, public.student_support_plans, public.teacher_content, public.teacher_notifications from anon, authenticated;
revoke all on function public.save_student_measurement(uuid,text,int,text,text,date), public.save_student_observation(uuid,text,date), public.save_student_goal(uuid,text,text,text,text), public.save_teacher_meeting(uuid,text,date,time,text), public.save_support_plan(uuid,text,jsonb,jsonb,boolean), public.save_teacher_content(text,text,text,text) from public, anon;
grant select on public.student_measurements, public.student_observations, public.student_goals, public.teacher_meetings, public.teacher_messages, public.student_support_plans, public.teacher_content, public.teacher_notifications to authenticated;
grant execute on function public.save_student_measurement(uuid,text,int,text,text,date), public.save_student_observation(uuid,text,date), public.save_student_goal(uuid,text,text,text,text), public.save_teacher_meeting(uuid,text,date,time,text), public.save_support_plan(uuid,text,jsonb,jsonb,boolean), public.save_teacher_content(text,text,text,text) to authenticated, service_role;
