-- NavigAItor — Faz 1: okullar, roller, şubeler, öğrenciler, veli bağlantısı, yapay zekâ kayıtları
-- Kural: istemci tablolara yalnızca okuma (RLS ile) erişir; tüm yazma işlemleri yetki denetimli fonksiyonlardan geçer.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists app;
grant usage on schema app to authenticated, service_role;

create type public.user_role as enum ('admin', 'teacher', 'student', 'parent');

-- ---------------------------------------------------------------- tablolar
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 200),
  city text,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete cascade,
  role public.user_role not null,
  full_name text not null check (char_length(full_name) between 2 and 120),
  created_at timestamptz not null default now()
);
create index profiles_school_idx on public.profiles (school_id);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  grade smallint not null check (grade between 5 and 8),
  name text not null check (char_length(name) between 1 and 20),
  class_code text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (school_id, name)
);

create table public.teacher_sections (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  section_id uuid not null references public.sections (id) on delete cascade,
  course text not null default 'GENEL' check (course in ('GENEL', 'MAT', 'TUR', 'FEN', 'SOS', 'ING')),
  is_guidance boolean not null default false,
  primary key (teacher_id, section_id, course)
);
create index teacher_sections_section_idx on public.teacher_sections (section_id);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  section_id uuid not null references public.sections (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 60),
  last_name text not null check (char_length(last_name) between 1 and 60),
  student_no text check (char_length(student_no) <= 20),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index students_section_idx on public.students (section_id);

-- PIN özetleri ayrı tabloda: hiçbir istemci rolü okuyamaz (politika yok).
create table public.student_secrets (
  student_id uuid primary key references public.students (id) on delete cascade,
  pin_hash text not null,
  pin_set_at timestamptz not null default now(),
  failed_attempts int not null default 0,
  locked_until timestamptz
);

create table public.guardians (
  parent_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.students (id) on delete cascade,
  relation text,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  parent_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  text_version text not null,
  granted boolean not null,
  created_at timestamptz not null default now()
);

create table public.invites (
  code text primary key,
  school_id uuid not null references public.schools (id) on delete cascade,
  kind text not null check (kind in ('teacher', 'parent')),
  student_id uuid references public.students (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days',
  used_by uuid references public.profiles (id) on delete set null,
  used_at timestamptz,
  check (kind = 'teacher' or student_id is not null)
);

create table public.login_attempts (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);
create index login_attempts_bucket_idx on public.login_attempts (bucket, created_at);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools (id) on delete cascade,
  teacher_id uuid references public.profiles (id) on delete set null,
  request jsonb not null,
  response jsonb,
  status text not null default 'pending' check (status in ('pending', 'ok', 'error')),
  model text,
  input_tokens int,
  output_tokens int,
  error text,
  created_at timestamptz not null default now()
);
create index ai_generations_teacher_idx on public.ai_generations (teacher_id, created_at);

-- ---------------------------------------------------------------- yardımcılar (app şeması API'ye açık değildir)
create function app.my_role() returns public.user_role
language sql stable security definer set search_path = '' as
$$ select role from public.profiles where id = auth.uid() $$;

create function app.my_school() returns uuid
language sql stable security definer set search_path = '' as
$$ select school_id from public.profiles where id = auth.uid() $$;

create function app.is_staff() returns boolean
language sql stable security definer set search_path = '' as
$$ select coalesce((select role in ('admin', 'teacher') from public.profiles where id = auth.uid()), false) $$;

create function app.is_admin() returns boolean
language sql stable security definer set search_path = '' as
$$ select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false) $$;

-- Öğretmen bu şubeyi görebilir mi? Yönetici okulundaki tüm şubeleri görür.
create function app.teaches(p_section uuid) returns boolean
language sql stable security definer set search_path = '' as
$$
  select exists (
    select 1 from public.sections s
    join public.profiles p on p.id = auth.uid()
    where s.id = p_section and s.school_id = p.school_id
      and (p.role = 'admin'
           or (p.role = 'teacher' and exists (
                 select 1 from public.teacher_sections ts where ts.section_id = s.id and ts.teacher_id = p.id))))
$$;

create function app.random_code(n int) returns text
language plpgsql volatile set search_path = '' as
$$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  b bytea := extensions.gen_random_bytes(n);
  r text := '';
begin
  for i in 0..n - 1 loop
    r := r || substr(alphabet, (get_byte(b, i) % length(alphabet)) + 1, 1);
  end loop;
  return r;
end
$$;

create function app.random_pin() returns text
language sql volatile set search_path = '' as
$$
  with b as (select extensions.gen_random_bytes(2) as v)
  select lpad(((get_byte(v, 0) * 256 + get_byte(v, 1)) % 10000)::text, 4, '0') from b
$$;

grant execute on all functions in schema app to authenticated, service_role;

-- ---------------------------------------------------------------- satır düzeyi güvenlik
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.teacher_sections enable row level security;
alter table public.students enable row level security;
alter table public.student_secrets enable row level security;
alter table public.guardians enable row level security;
alter table public.consents enable row level security;
alter table public.invites enable row level security;
alter table public.login_attempts enable row level security;
alter table public.ai_generations enable row level security;

create policy "okul üyeleri kendi okulunu görür" on public.schools for select to authenticated
  using (id = (select app.my_school()));

create policy "kendi profili ve okuldaki personel" on public.profiles for select to authenticated
  using (id = (select auth.uid())
         or ((select app.is_staff()) and school_id = (select app.my_school())));

create policy "şubeyi görebilenler" on public.sections for select to authenticated
  using ((select app.teaches(id))
         or id in (select section_id from public.students where auth_user_id = (select auth.uid()))
         or id in (select st.section_id from public.students st
                   join public.guardians g on g.student_id = st.id where g.parent_id = (select auth.uid())));

create policy "okuldaki personel şube atamalarını görür" on public.teacher_sections for select to authenticated
  using ((select app.is_staff()) and exists (
    select 1 from public.sections s where s.id = section_id and s.school_id = (select app.my_school())));

create policy "öğretmen şubesindeki, öğrenci kendini, veli çocuğunu görür" on public.students for select to authenticated
  using ((select app.teaches(section_id))
         or auth_user_id = (select auth.uid())
         or id in (select student_id from public.guardians where parent_id = (select auth.uid())));

create policy "veli kendi bağlantısını, öğretmen şubesininkileri görür" on public.guardians for select to authenticated
  using (parent_id = (select auth.uid())
         or exists (select 1 from public.students st where st.id = student_id and (select app.teaches(st.section_id))));

create policy "veli kendi onayını, öğretmen şubesininkileri görür" on public.consents for select to authenticated
  using (parent_id = (select auth.uid())
         or exists (select 1 from public.students st where st.id = student_id and (select app.teaches(st.section_id))));

create policy "personel okulun davetlerini görür" on public.invites for select to authenticated
  using ((select app.is_staff()) and school_id = (select app.my_school()));

create policy "öğretmen kendi üretimlerini, yönetici okulunkileri görür" on public.ai_generations for select to authenticated
  using (teacher_id = (select auth.uid())
         or ((select app.is_admin()) and school_id = (select app.my_school())));

-- student_secrets ve login_attempts: bilerek politika yok (yalnızca sunucu tarafı erişir).

-- ---------------------------------------------------------------- personelin çağırdığı fonksiyonlar
create function public.my_context() returns jsonb
language plpgsql stable security definer set search_path = '' as
$$
declare
  p public.profiles;
begin
  select * into p from public.profiles where id = auth.uid();
  if p.id is null then return null; end if;
  return jsonb_build_object(
    'profile', to_jsonb(p),
    'school', (select to_jsonb(s) from public.schools s where s.id = p.school_id),
    'sections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', s.id, 'grade', s.grade, 'name', s.name, 'class_code', s.class_code,
        'courses', (select coalesce(jsonb_agg(jsonb_build_object('course', ts.course, 'is_guidance', ts.is_guidance)), '[]')
                    from public.teacher_sections ts where ts.section_id = s.id and ts.teacher_id = p.id),
        'student_count', (select count(*) from public.students st where st.section_id = s.id and st.active))
        order by s.grade, s.name)
      from public.sections s
      where p.role in ('admin', 'teacher') and (select app.teaches(s.id))), '[]'::jsonb));
end
$$;

create function public.create_section(p_grade int, p_name text, p_course text default 'GENEL', p_guidance boolean default false)
returns public.sections
language plpgsql security definer set search_path = '' as
$$
declare
  s public.sections;
  code text;
begin
  if not app.is_staff() then raise exception 'Bu işlem için öğretmen veya yönetici olmalısınız' using errcode = '42501'; end if;
  loop
    code := app.random_code(6);
    exit when not exists (select 1 from public.sections where class_code = code);
  end loop;
  insert into public.sections (school_id, grade, name, class_code, created_by)
  values (app.my_school(), p_grade, upper(trim(p_name)), code, auth.uid())
  returning * into s;
  insert into public.teacher_sections (teacher_id, section_id, course, is_guidance)
  values (auth.uid(), s.id, coalesce(p_course, 'GENEL'), coalesce(p_guidance, false));
  return s;
end
$$;

create function public.add_teacher_to_section(p_teacher uuid, p_section uuid, p_course text default 'GENEL', p_guidance boolean default false)
returns void
language plpgsql security definer set search_path = '' as
$$
begin
  if not app.is_admin() then raise exception 'Yalnızca okul yöneticisi öğretmen atayabilir' using errcode = '42501'; end if;
  if not exists (select 1 from public.profiles where id = p_teacher and school_id = app.my_school() and role in ('admin', 'teacher'))
     or not exists (select 1 from public.sections where id = p_section and school_id = app.my_school()) then
    raise exception 'Öğretmen veya şube bu okula ait değil' using errcode = '42501';
  end if;
  insert into public.teacher_sections (teacher_id, section_id, course, is_guidance)
  values (p_teacher, p_section, coalesce(p_course, 'GENEL'), coalesce(p_guidance, false))
  on conflict (teacher_id, section_id, course) do update set is_guidance = excluded.is_guidance;
end
$$;

-- Öğrenci listesi içe aktarma. PIN'ler yalnızca bu yanıtta düz metin olarak döner (kart basımı için).
create function public.import_students(p_section uuid, p_rows jsonb)
returns table (id uuid, first_name text, last_name text, student_no text, pin text)
language plpgsql security definer set search_path = '' as
$$
declare
  r jsonb;
  sec public.sections;
  new_id uuid;
  new_pin text;
begin
  if not app.teaches(p_section) then raise exception 'Bu şubeye erişiminiz yok' using errcode = '42501'; end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then raise exception 'Öğrenci listesi boş'; end if;
  if jsonb_array_length(p_rows) > 60 then raise exception 'Bir seferde en fazla 60 öğrenci eklenebilir'; end if;
  select * into sec from public.sections where sections.id = p_section;
  for r in select * from jsonb_array_elements(p_rows) loop
    if coalesce(trim(r ->> 'first_name'), '') = '' or coalesce(trim(r ->> 'last_name'), '') = '' then
      raise exception 'Her satırda ad ve soyad olmalı';
    end if;
    insert into public.students (school_id, section_id, first_name, last_name, student_no)
    values (sec.school_id, p_section, trim(r ->> 'first_name'), trim(r ->> 'last_name'), nullif(trim(r ->> 'student_no'), ''))
    returning students.id into new_id;
    new_pin := app.random_pin();
    insert into public.student_secrets (student_id, pin_hash) values (new_id, extensions.crypt(new_pin, extensions.gen_salt('bf', 8)));
    id := new_id; first_name := trim(r ->> 'first_name'); last_name := trim(r ->> 'last_name');
    student_no := nullif(trim(r ->> 'student_no'), ''); pin := new_pin;
    return next;
  end loop;
end
$$;

create function public.reset_student_pin(p_student uuid) returns text
language plpgsql security definer set search_path = '' as
$$
declare
  new_pin text := app.random_pin();
begin
  if not exists (select 1 from public.students st where st.id = p_student and app.teaches(st.section_id)) then
    raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501';
  end if;
  insert into public.student_secrets (student_id, pin_hash) values (p_student, extensions.crypt(new_pin, extensions.gen_salt('bf', 8)))
  on conflict (student_id) do update set pin_hash = excluded.pin_hash, pin_set_at = now(), failed_attempts = 0, locked_until = null;
  return new_pin;
end
$$;

create function public.update_student(p_student uuid, p_first_name text, p_last_name text, p_student_no text, p_active boolean)
returns void
language plpgsql security definer set search_path = '' as
$$
begin
  if not exists (select 1 from public.students st where st.id = p_student and app.teaches(st.section_id)) then
    raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501';
  end if;
  update public.students set first_name = trim(p_first_name), last_name = trim(p_last_name),
    student_no = nullif(trim(p_student_no), ''), active = p_active
  where id = p_student;
end
$$;

create function public.create_parent_invite(p_student uuid) returns text
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
  v_code text;
begin
  select * into st from public.students where id = p_student;
  if st.id is null or not app.teaches(st.section_id) then raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501'; end if;
  loop
    v_code := app.random_code(8);
    exit when not exists (select 1 from public.invites where invites.code = v_code);
  end loop;
  insert into public.invites (code, school_id, kind, student_id, created_by) values (v_code, st.school_id, 'parent', st.id, auth.uid());
  return v_code;
end
$$;

create function public.create_teacher_invite() returns text
language plpgsql security definer set search_path = '' as
$$
declare
  v_code text;
begin
  if not app.is_admin() then raise exception 'Yalnızca okul yöneticisi öğretmen daveti oluşturabilir' using errcode = '42501'; end if;
  loop
    v_code := app.random_code(8);
    exit when not exists (select 1 from public.invites where invites.code = v_code);
  end loop;
  insert into public.invites (code, school_id, kind, created_by) values (v_code, app.my_school(), 'teacher', auth.uid());
  return v_code;
end
$$;

-- ---------------------------------------------------------------- yalnızca sunucu (Edge Function) tarafından çağrılanlar
create function public.srv_register_staff(p_user uuid, p_full_name text, p_school_name text, p_invite text)
returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  inv public.invites;
  sid uuid;
  r public.user_role;
begin
  if p_invite is not null and trim(p_invite) <> '' then
    select * into inv from public.invites where code = upper(trim(p_invite)) and kind = 'teacher' and expires_at > now();
    if inv.code is null then raise exception 'Davet kodu geçersiz veya süresi dolmuş'; end if;
    sid := inv.school_id; r := 'teacher';
  else
    if coalesce(trim(p_school_name), '') = '' then raise exception 'Okul adı gerekli'; end if;
    insert into public.schools (name) values (trim(p_school_name)) returning id into sid;
    r := 'admin';
  end if;
  insert into public.profiles (id, school_id, role, full_name) values (p_user, sid, r, trim(p_full_name));
  return jsonb_build_object('school_id', sid, 'role', r);
end
$$;

create function public.srv_register_parent(p_user uuid, p_full_name text, p_invite text, p_consent_version text, p_relation text)
returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  inv public.invites;
begin
  select * into inv from public.invites
  where code = upper(trim(p_invite)) and kind = 'parent' and used_at is null and expires_at > now()
  for update;
  if inv.code is null then raise exception 'Davet kodu geçersiz, kullanılmış veya süresi dolmuş'; end if;
  insert into public.profiles (id, school_id, role, full_name) values (p_user, inv.school_id, 'parent', trim(p_full_name));
  insert into public.guardians (parent_id, student_id, relation) values (p_user, inv.student_id, nullif(trim(p_relation), ''));
  insert into public.consents (student_id, parent_id, kind, text_version, granted)
  values (inv.student_id, p_user, 'kvkk_acik_riza', p_consent_version, true);
  update public.invites set used_by = p_user, used_at = now() where code = inv.code;
  return jsonb_build_object('student_id', inv.student_id, 'school_id', inv.school_id);
end
$$;

-- Velinin ikinci çocuğunu eklemesi (zaten veli hesabı var)
create function public.srv_link_parent(p_user uuid, p_invite text, p_consent_version text, p_relation text)
returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  inv public.invites;
begin
  select * into inv from public.invites
  where code = upper(trim(p_invite)) and kind = 'parent' and used_at is null and expires_at > now()
  for update;
  if inv.code is null then raise exception 'Davet kodu geçersiz, kullanılmış veya süresi dolmuş'; end if;
  if not exists (select 1 from public.profiles where id = p_user and role = 'parent' and school_id = inv.school_id) then
    raise exception 'Bu davet kodu hesabınızla eşleşmiyor';
  end if;
  insert into public.guardians (parent_id, student_id, relation) values (p_user, inv.student_id, nullif(trim(p_relation), ''))
  on conflict do nothing;
  insert into public.consents (student_id, parent_id, kind, text_version, granted)
  values (inv.student_id, p_user, 'kvkk_acik_riza', p_consent_version, true);
  update public.invites set used_by = p_user, used_at = now() where code = inv.code;
  return jsonb_build_object('student_id', inv.student_id);
end
$$;

-- Hız sınırı: aynı kovaya (ör. IP) pencere içinde en fazla p_max deneme.
create function public.srv_rate_limit(p_bucket text, p_max int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = '' as
$$
declare
  n int;
begin
  delete from public.login_attempts where created_at < now() - interval '1 day';
  select count(*) into n from public.login_attempts
  where bucket = p_bucket and created_at > now() - make_interval(secs => p_window_seconds);
  if n >= p_max then return false; end if;
  insert into public.login_attempts (bucket) values (p_bucket);
  return true;
end
$$;

create function public.srv_class_roster(p_code text) returns jsonb
language sql stable security definer set search_path = '' as
$$
  select jsonb_build_object(
    'section', jsonb_build_object('grade', s.grade, 'name', s.name, 'school', sc.name),
    'students', coalesce((
      select jsonb_agg(jsonb_build_object('id', st.id, 'label', st.first_name || ' ' || left(st.last_name, 1) || '.')
                       order by st.first_name, st.last_name)
      from public.students st where st.section_id = s.id and st.active), '[]'::jsonb))
  from public.sections s join public.schools sc on sc.id = s.school_id
  where s.class_code = upper(trim(p_code))
$$;

-- PIN doğrulama: 5 hatalı denemede 15 dakika kilit.
create function public.srv_verify_student_pin(p_code text, p_student uuid, p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
  sec public.student_secrets;
begin
  select st2.* into st from public.students st2
  join public.sections s on s.id = st2.section_id
  where st2.id = p_student and s.class_code = upper(trim(p_code)) and st2.active;
  if st.id is null then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  select * into sec from public.student_secrets where student_id = st.id for update;
  if sec.student_id is null then return jsonb_build_object('ok', false, 'reason', 'no_pin'); end if;
  if sec.locked_until is not null and sec.locked_until > now() then
    return jsonb_build_object('ok', false, 'reason', 'locked', 'until', sec.locked_until);
  end if;
  if sec.pin_hash <> extensions.crypt(coalesce(p_pin, ''), sec.pin_hash) then
    update public.student_secrets
      set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
          locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
    where student_id = st.id;
    return jsonb_build_object('ok', false, 'reason', 'wrong_pin');
  end if;
  update public.student_secrets set failed_attempts = 0, locked_until = null where student_id = st.id;
  return jsonb_build_object('ok', true, 'student_id', st.id, 'auth_user_id', st.auth_user_id, 'school_id', st.school_id,
                            'full_name', st.first_name || ' ' || st.last_name);
end
$$;

create function public.srv_link_student_auth(p_student uuid, p_auth_user uuid) returns void
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
begin
  select * into st from public.students where id = p_student;
  update public.students set auth_user_id = p_auth_user where id = p_student;
  insert into public.profiles (id, school_id, role, full_name)
  values (p_auth_user, st.school_id, 'student', st.first_name || ' ' || st.last_name)
  on conflict (id) do update set full_name = excluded.full_name;
end
$$;

create function public.srv_ai_quota(p_teacher uuid, p_daily_limit int) returns jsonb
language sql stable security definer set search_path = '' as
$$
  select jsonb_build_object(
    'used', count(*),
    'limit', p_daily_limit,
    'ok', count(*) < p_daily_limit)
  from public.ai_generations
  where teacher_id = p_teacher and created_at > now() - interval '1 day'
$$;

-- ---------------------------------------------------------------- yetkiler
revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.my_context(), public.create_section(int, text, text, boolean),
  public.add_teacher_to_section(uuid, uuid, text, boolean), public.import_students(uuid, jsonb),
  public.reset_student_pin(uuid), public.update_student(uuid, text, text, text, boolean),
  public.create_parent_invite(uuid), public.create_teacher_invite()
  to authenticated;
grant execute on all functions in schema public to service_role;

-- İstemci rolleri tablolara doğrudan yazamaz; yalnızca RLS süzgeçli okuma.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
revoke all on public.student_secrets, public.login_attempts from anon, authenticated;
revoke all on all tables in schema public from anon;
