-- NavigAItor — Faz 2: öğretmen etkinlikleri, şubeye atama, öğrenci teslimi, Navi tanışma formu.
-- Etkinlik içeriği atama anında bir kopya (jsonb) olarak saklanır: öğretmen sonradan kütüphanedeki taslağı değiştirse de
-- öğrencinin gördüğü etkinlik değişmez.

create function app.my_student_id() returns uuid
language sql stable security definer set search_path = '' as
$$ select id from public.students where auth_user_id = auth.uid() $$;
grant execute on function app.my_student_id() to authenticated, service_role;

-- ---------------------------------------------------------------- tablolar
create table public.teacher_activities (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  teacher_id uuid references public.profiles (id) on delete set null,
  source text not null default 'yz' check (source in ('yz', 'elle', 'kutuphane')),
  title text not null,
  course text not null check (course in ('MAT', 'TUR', 'FEN', 'SOS', 'ING')),
  grade smallint not null check (grade between 5 and 8),
  activity jsonb not null check (jsonb_typeof(activity) = 'object' and pg_column_size(activity) < 200000),
  created_at timestamptz not null default now()
);
create index teacher_activities_school_idx on public.teacher_activities (school_id, created_at desc);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  section_id uuid not null references public.sections (id) on delete cascade,
  teacher_id uuid references public.profiles (id) on delete set null,
  source text not null check (source in ('yz', 'elle', 'kutuphane')),
  template_id text,
  title text not null,
  course text not null check (course in ('MAT', 'TUR', 'FEN', 'SOS', 'ING')),
  grade smallint not null check (grade between 5 and 8),
  activity jsonb not null check (jsonb_typeof(activity) = 'object' and pg_column_size(activity) < 200000),
  due_date date,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index assignments_section_idx on public.assignments (section_id, created_at desc);

create table public.submissions (
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  status text not null default 'devam' check (status in ('devam', 'tamamlandi')),
  checklist jsonb not null default '[]'::jsonb check (jsonb_typeof(checklist) = 'array'),
  reflection text check (char_length(reflection) <= 2000),
  teacher_feedback text check (char_length(teacher_feedback) <= 2000),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (assignment_id, student_id)
);
create index submissions_student_idx on public.submissions (student_id);

create table public.intake_responses (
  student_id uuid primary key references public.students (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) < 20000),
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- satır düzeyi güvenlik
alter table public.teacher_activities enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.intake_responses enable row level security;

create policy "okul personeli kendi okulunun etkinliklerini görür" on public.teacher_activities for select to authenticated
  using ((select app.is_staff()) and school_id = (select app.my_school()));

create policy "şubeyi görebilenler atamaları görür" on public.assignments for select to authenticated
  using ((select app.teaches(section_id)) or section_id in (select app.linked_section_ids()));

create policy "öğretmen şubesindekini, öğrenci kendini, veli çocuğunu görür" on public.submissions for select to authenticated
  using (app.teaches_student(student_id)
         or student_id = (select app.my_student_id())
         or student_id in (select app.parent_student_ids()));

create policy "öğretmen şubesindekini, öğrenci kendini, veli çocuğunu görür" on public.intake_responses for select to authenticated
  using (app.teaches_student(student_id)
         or student_id = (select app.my_student_id())
         or student_id in (select app.parent_student_ids()));

-- ---------------------------------------------------------------- fonksiyonlar
create function app.activity_meta(p jsonb, out title text, out course text, out grade smallint)
language plpgsql immutable set search_path = '' as
$$
begin
  title := left(coalesce(nullif(trim(p ->> 'title'), ''), 'Etkinlik'), 200);
  course := p ->> 'course';
  grade := (p ->> 'grade')::smallint;
  if course is null or course not in ('MAT', 'TUR', 'FEN', 'SOS', 'ING') then raise exception 'Etkinliğin dersi tanımsız'; end if;
  if grade is null or grade not between 5 and 8 then raise exception 'Etkinliğin sınıf düzeyi tanımsız'; end if;
end
$$;

create function public.save_teacher_activity(p_activity jsonb, p_source text default 'yz') returns uuid
language plpgsql security definer set search_path = '' as
$$
declare
  m record;
  v_id uuid;
begin
  if not app.is_staff() then raise exception 'Bu işlem için öğretmen olmalısınız' using errcode = '42501'; end if;
  select * into m from app.activity_meta(p_activity);
  insert into public.teacher_activities (school_id, teacher_id, source, title, course, grade, activity)
  values (app.my_school(), auth.uid(), coalesce(p_source, 'yz'), m.title, m.course, m.grade, p_activity)
  returning id into v_id;
  return v_id;
end
$$;

create function public.delete_teacher_activity(p_id uuid) returns void
language plpgsql security definer set search_path = '' as
$$
begin
  delete from public.teacher_activities
  where id = p_id and school_id = app.my_school() and (teacher_id = auth.uid() or app.is_admin());
  if not found then raise exception 'Etkinlik bulunamadı veya silme yetkiniz yok' using errcode = '42501'; end if;
end
$$;

create function public.create_assignment(p_section uuid, p_activity jsonb, p_source text, p_template text, p_due date)
returns uuid
language plpgsql security definer set search_path = '' as
$$
declare
  m record;
  sec public.sections;
  v_id uuid;
begin
  if not app.teaches(p_section) then raise exception 'Bu şubeye atama yetkiniz yok' using errcode = '42501'; end if;
  select * into sec from public.sections where id = p_section;
  select * into m from app.activity_meta(p_activity);
  if p_due is not null and p_due < current_date then raise exception 'Teslim tarihi geçmiş bir gün olamaz'; end if;
  insert into public.assignments (school_id, section_id, teacher_id, source, template_id, title, course, grade, activity, due_date)
  values (sec.school_id, p_section, auth.uid(), p_source, p_template, m.title, m.course, m.grade, p_activity, p_due)
  returning id into v_id;
  return v_id;
end
$$;

create function public.archive_assignment(p_id uuid, p_archived boolean default true) returns void
language plpgsql security definer set search_path = '' as
$$
begin
  update public.assignments set archived = p_archived where id = p_id and app.teaches(section_id);
  if not found then raise exception 'Atama bulunamadı veya yetkiniz yok' using errcode = '42501'; end if;
end
$$;

create function public.set_teacher_feedback(p_assignment uuid, p_student uuid, p_text text) returns void
language plpgsql security definer set search_path = '' as
$$
begin
  if not exists (select 1 from public.assignments a join public.students st on st.section_id = a.section_id
                 where a.id = p_assignment and st.id = p_student and app.teaches(a.section_id)) then
    raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501';
  end if;
  insert into public.submissions (assignment_id, student_id, status, teacher_feedback)
  values (p_assignment, p_student, 'devam', left(p_text, 2000))
  on conflict (assignment_id, student_id) do update set teacher_feedback = left(p_text, 2000), updated_at = now();
end
$$;

-- Öğrenci ilerlemesini kaydeder. Tamamlananı yeniden "devam"a çekebilir (öğrenci düzeltme yapabilsin).
create function public.save_submission(p_assignment uuid, p_checklist jsonb, p_status text, p_reflection text)
returns public.submissions
language plpgsql security definer set search_path = '' as
$$
declare
  sid uuid := app.my_student_id();
  r public.submissions;
begin
  if sid is null then raise exception 'Bu işlem yalnızca öğrenciler içindir' using errcode = '42501'; end if;
  if not exists (select 1 from public.assignments a join public.students st on st.section_id = a.section_id
                 where a.id = p_assignment and st.id = sid and not a.archived) then
    raise exception 'Bu etkinlik sana atanmamış' using errcode = '42501';
  end if;
  if p_status not in ('devam', 'tamamlandi') then raise exception 'Geçersiz durum'; end if;
  if jsonb_typeof(coalesce(p_checklist, '[]'::jsonb)) <> 'array' or jsonb_array_length(coalesce(p_checklist, '[]'::jsonb)) > 30 then
    raise exception 'Geçersiz kontrol listesi';
  end if;
  insert into public.submissions as s (assignment_id, student_id, status, checklist, reflection, completed_at)
  values (p_assignment, sid, p_status, coalesce(p_checklist, '[]'::jsonb), left(p_reflection, 2000),
          case when p_status = 'tamamlandi' then now() end)
  on conflict (assignment_id, student_id) do update set
    status = excluded.status, checklist = excluded.checklist, reflection = excluded.reflection, updated_at = now(),
    completed_at = case when excluded.status = 'tamamlandi' then coalesce(s.completed_at, now()) else null end
  returning * into r;
  return r;
end
$$;

create function public.save_intake(p_answers jsonb, p_completed boolean) returns void
language plpgsql security definer set search_path = '' as
$$
declare
  sid uuid := app.my_student_id();
begin
  if sid is null then raise exception 'Bu işlem yalnızca öğrenciler içindir' using errcode = '42501'; end if;
  if jsonb_typeof(p_answers) <> 'object' then raise exception 'Geçersiz cevaplar'; end if;
  insert into public.intake_responses as ir (student_id, answers, completed) values (sid, p_answers, coalesce(p_completed, false))
  on conflict (student_id) do update set answers = excluded.answers,
    completed = ir.completed or excluded.completed, updated_at = now();
end
$$;

revoke all on function public.save_teacher_activity(jsonb, text), public.delete_teacher_activity(uuid),
  public.create_assignment(uuid, jsonb, text, text, date), public.archive_assignment(uuid, boolean),
  public.set_teacher_feedback(uuid, uuid, text), public.save_submission(uuid, jsonb, text, text),
  public.save_intake(jsonb, boolean) from public, anon;
grant execute on function public.save_teacher_activity(jsonb, text), public.delete_teacher_activity(uuid),
  public.create_assignment(uuid, jsonb, text, text, date), public.archive_assignment(uuid, boolean),
  public.set_teacher_feedback(uuid, uuid, text), public.save_submission(uuid, jsonb, text, text),
  public.save_intake(jsonb, boolean) to authenticated, service_role;
grant execute on function app.activity_meta(jsonb) to authenticated, service_role;

revoke insert, update, delete, truncate on public.teacher_activities, public.assignments, public.submissions,
  public.intake_responses from anon, authenticated;
revoke all on public.teacher_activities, public.assignments, public.submissions, public.intake_responses from anon;
