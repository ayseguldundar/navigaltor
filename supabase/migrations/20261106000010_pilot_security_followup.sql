-- NavigAItor pilot follow-up: admin-only school operations and atomic rate limits.
-- Apply only to a staging/test project after review; this task does not run migrations.

create or replace function public.reset_section_pins(p_section uuid) returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  st record;
  pin text;
  out_ jsonb := '[]'::jsonb;
begin
  if not app.is_admin()
     or not exists (
       select 1 from public.sections s
       where s.id = p_section and s.school_id = app.my_school()
     ) then
    raise exception 'Yalnızca okul yöneticisi kendi okulundaki şubenin PIN’lerini yenileyebilir'
      using errcode = '42501';
  end if;

  for st in
    select * from public.students
    where section_id = p_section and active
    order by student_no nulls last, first_name
  loop
    pin := app.random_pin();
    insert into public.student_secrets (student_id, pin_hash)
    values (st.id, extensions.crypt(pin, extensions.gen_salt('bf', 8)))
    on conflict (student_id) do update
      set pin_hash = excluded.pin_hash, pin_set_at = now(), failed_attempts = 0, locked_until = null;
    if st.auth_user_id is not null then perform app.revoke_sessions(st.auth_user_id); end if;
    out_ := out_ || jsonb_build_object(
      'id', st.id, 'first_name', st.first_name, 'last_name', st.last_name,
      'student_no', st.student_no, 'pin', pin
    );
  end loop;
  return out_;
end
$$;

create or replace function public.move_student(p_student uuid, p_section uuid) returns void
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
  sec public.sections;
begin
  if not app.is_admin() then
    raise exception 'Yalnızca okul yöneticisi öğrenci taşıyabilir' using errcode = '42501';
  end if;

  select * into st from public.students where id = p_student for update;
  select * into sec from public.sections where id = p_section;
  if st.id is null or sec.id is null
     or st.school_id <> sec.school_id
     or sec.school_id <> app.my_school() then
    raise exception 'Öğrenci ve hedef şube aynı okulda olmalı' using errcode = '42501';
  end if;

  update public.students set section_id = sec.id where id = st.id;
end
$$;

-- Serialize the counter check+insert for a bucket so simultaneous calls cannot all pass.
create or replace function public.srv_rate_limit(p_bucket text, p_max int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = '' as
$$
declare
  n int;
begin
  if p_bucket is null or length(p_bucket) = 0 or length(p_bucket) > 512
     or p_max is null or p_max < 1
     or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'Invalid rate-limit parameters';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_bucket, 0));
  delete from public.login_attempts where created_at < now() - interval '1 day';
  select count(*) into n from public.login_attempts
    where bucket = p_bucket and created_at > now() - make_interval(secs => p_window_seconds);
  if n >= p_max then return false; end if;
  insert into public.login_attempts (bucket) values (p_bucket);
  return true;
end
$$;

revoke all on function public.reset_section_pins(uuid), public.move_student(uuid, uuid) from public, anon;
grant execute on function public.reset_section_pins(uuid), public.move_student(uuid, uuid) to authenticated;
revoke all on function public.srv_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.srv_rate_limit(text, int, int) to service_role;
