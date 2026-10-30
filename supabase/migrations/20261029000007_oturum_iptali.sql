-- NavigAItor — oturum iptali (şifre/PIN yenilenince, öğrenci pasif yapılınca açık oturumlar kapanır),
-- öğretmeni şubeden çıkarma ve yeni yönetici işlemlerinin işlem kaydı türleri.
-- ---------------------------------------------------------------- 1) oturum iptali
create function app.revoke_sessions(p_user uuid) returns void
language sql security definer set search_path = '' as
$$ delete from auth.sessions where user_id = p_user $$;
revoke all on function app.revoke_sessions(uuid) from public, anon, authenticated;

create function public.srv_revoke_sessions(p_user uuid) returns void
language sql security definer set search_path = '' as
$$ select app.revoke_sessions(p_user) $$;
revoke all on function public.srv_revoke_sessions(uuid) from public, anon, authenticated;
grant execute on function public.srv_revoke_sessions(uuid) to service_role;

create or replace function public.reset_student_pin(p_student uuid) returns text
language plpgsql security definer set search_path = '' as
$$
declare
  new_pin text := app.random_pin();
  st public.students;
begin
  select * into st from public.students where id = p_student;
  if st.id is null or not app.teaches(st.section_id) then
    raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501';
  end if;
  insert into public.student_secrets (student_id, pin_hash) values (p_student, extensions.crypt(new_pin, extensions.gen_salt('bf', 8)))
  on conflict (student_id) do update set pin_hash = excluded.pin_hash, pin_set_at = now(), failed_attempts = 0, locked_until = null;
  if st.auth_user_id is not null then perform app.revoke_sessions(st.auth_user_id); end if;
  return new_pin;
end
$$;

create or replace function public.update_student(p_student uuid, p_first_name text, p_last_name text, p_student_no text, p_active boolean)
returns void
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
begin
  select * into st from public.students where id = p_student;
  if st.id is null or not app.teaches(st.section_id) then
    raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501';
  end if;
  if coalesce(trim(p_first_name), '') = '' or coalesce(trim(p_last_name), '') = '' then raise exception 'Ad ve soyad gerekli'; end if;
  update public.students set first_name = trim(p_first_name), last_name = trim(p_last_name),
    student_no = nullif(trim(p_student_no), ''), active = p_active
  where id = p_student;
  if not p_active and st.auth_user_id is not null then perform app.revoke_sessions(st.auth_user_id); end if;
end
$$;

create or replace function public.reset_section_pins(p_section uuid) returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  st record;
  pin text;
  out_ jsonb := '[]'::jsonb;
begin
  if not app.teaches(p_section) then raise exception 'Bu şubeye erişiminiz yok' using errcode = '42501'; end if;
  for st in select * from public.students where section_id = p_section and active order by student_no nulls last, first_name loop
    pin := app.random_pin();
    insert into public.student_secrets (student_id, pin_hash) values (st.id, extensions.crypt(pin, extensions.gen_salt('bf', 8)))
    on conflict (student_id) do update set pin_hash = excluded.pin_hash, pin_set_at = now(), failed_attempts = 0, locked_until = null;
    if st.auth_user_id is not null then perform app.revoke_sessions(st.auth_user_id); end if;
    out_ := out_ || jsonb_build_object('id', st.id, 'first_name', st.first_name, 'last_name', st.last_name, 'student_no', st.student_no, 'pin', pin);
  end loop;
  return out_;
end
$$;

create function public.remove_teacher_from_section(p_teacher uuid, p_section uuid) returns void
language plpgsql security definer set search_path = '' as
$$
begin
  if not app.is_admin() or not exists (select 1 from public.sections where id = p_section and school_id = app.my_school()) then
    raise exception 'Yalnızca okul yöneticisi' using errcode = '42501';
  end if;
  delete from public.teacher_sections where teacher_id = p_teacher and section_id = p_section;
end
$$;

revoke all on function public.remove_teacher_from_section(uuid, uuid) from public, anon;
grant execute on function public.remove_teacher_from_section(uuid, uuid) to authenticated;

alter table public.admin_log drop constraint admin_log_action_check;
alter table public.admin_log add constraint admin_log_action_check
  check (action in ('ogrenci_sil', 'sifre_sifirla', 'ogretmen_cikar', 'veli_kendini_sil'));
