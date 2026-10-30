-- NavigAItor — pilot öncesi güvenlik ve işletim düzeltmeleri (bağımsız inceleme bulguları).
-- (Oturum iptali, öğretmeni şubeden çıkarma ve işlem kaydı türleri: 20261029000007_oturum_iptali.sql)
-- 2) PIN kilidi kademeli: 5 hatada 15 dk, sonraki her 5 hatada süre iki katı (en çok 4 saat). Öğretmen "Yeni PIN" ile açar.
-- 3) Öğretmen davet kodu tek kullanımlık; yeni kod eski kullanılmamış kodları geçersiz kılar (veli kodları için de aynı).
-- 4) Davetleri yalnızca yönetici (tümü) ve öğrencinin öğretmeni (veli kodları) görür.
-- 5) Yönetici: ikinci yönetici atama, öğretmeni şubeden çıkarma, öğrenciyi şube değiştirme, şubenin tüm PIN'lerini yenileme.
-- 6) Sınıf listesinde aynı görünen isimler ayırt edilir.

-- Şubenin tüm etkin öğrencileri için yeni PIN (kartlar kaybolduğunda). Eski PIN'ler ve oturumlar geçersiz olur.
create function public.reset_section_pins(p_section uuid) returns jsonb
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
    out_ := out_ || jsonb_build_object('id', st.id, 'first_name', st.first_name, 'last_name', st.last_name, 'student_no', st.student_no, 'pin', pin);
  end loop;
  return out_;
end
$$;

-- Öğrenciyi aynı okulda başka şubeye taşı (veli bağlantısı, PIN ve geçmiş teslimler korunur).
create function public.move_student(p_student uuid, p_section uuid) returns void
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
  sec public.sections;
begin
  select * into st from public.students where id = p_student;
  select * into sec from public.sections where id = p_section;
  if st.id is null or sec.id is null or st.school_id <> sec.school_id
     or not app.teaches(st.section_id) or not app.teaches(sec.id) then
    raise exception 'Bu taşıma için yetkiniz yok' using errcode = '42501';
  end if;
  update public.students set section_id = sec.id where id = st.id;
end
$$;

-- ---------------------------------------------------------------- 2) kademeli PIN kilidi
create or replace function public.srv_verify_student_pin(p_code text, p_student uuid, p_pin text) returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
  sec public.student_secrets;
  n int;
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
    n := sec.failed_attempts + 1;
    update public.student_secrets
      set failed_attempts = n,
          locked_until = case when n % 5 = 0
            then now() + least(interval '4 hours', interval '15 minutes' * power(2, n / 5 - 1)) else locked_until end
    where student_id = st.id;
    return jsonb_build_object('ok', false, 'reason', case when n % 5 = 0 then 'locked' else 'wrong_pin' end);
  end if;
  update public.student_secrets set failed_attempts = 0, locked_until = null where student_id = st.id;
  return jsonb_build_object('ok', true, 'student_id', st.id, 'auth_user_id', st.auth_user_id, 'school_id', st.school_id,
                            'full_name', st.first_name || ' ' || st.last_name);
end
$$;

-- ---------------------------------------------------------------- 3) tek kullanımlık davetler
create or replace function public.create_teacher_invite() returns text
language plpgsql security definer set search_path = '' as
$$
declare
  v_code text;
begin
  if not app.is_admin() then raise exception 'Yalnızca okul yöneticisi öğretmen daveti oluşturabilir' using errcode = '42501'; end if;
  update public.invites set expires_at = now()
  where school_id = app.my_school() and kind = 'teacher' and used_at is null and expires_at > now();
  loop
    v_code := app.random_code(8);
    exit when not exists (select 1 from public.invites where invites.code = v_code);
  end loop;
  insert into public.invites (code, school_id, kind, created_by, expires_at) values (v_code, app.my_school(), 'teacher', auth.uid(), now() + interval '7 days');
  return v_code;
end
$$;

create or replace function public.create_parent_invite(p_student uuid) returns text
language plpgsql security definer set search_path = '' as
$$
declare
  st public.students;
  v_code text;
begin
  select * into st from public.students where id = p_student;
  if st.id is null or not app.teaches(st.section_id) then raise exception 'Bu öğrenciye erişiminiz yok' using errcode = '42501'; end if;
  update public.invites set expires_at = now() where student_id = st.id and kind = 'parent' and used_at is null and expires_at > now();
  loop
    v_code := app.random_code(8);
    exit when not exists (select 1 from public.invites where invites.code = v_code);
  end loop;
  insert into public.invites (code, school_id, kind, student_id, created_by) values (v_code, st.school_id, 'parent', st.id, auth.uid());
  return v_code;
end
$$;

create or replace function public.srv_register_staff(p_user uuid, p_full_name text, p_school_name text, p_invite text)
returns jsonb
language plpgsql security definer set search_path = '' as
$$
declare
  inv public.invites;
  sid uuid;
  r public.user_role;
begin
  if p_invite is not null and trim(p_invite) <> '' then
    select * into inv from public.invites
    where code = upper(trim(p_invite)) and kind = 'teacher' and used_at is null and expires_at > now()
    for update;
    if inv.code is null then raise exception 'Davet kodu geçersiz, kullanılmış veya süresi dolmuş'; end if;
    sid := inv.school_id; r := 'teacher';
    update public.invites set used_by = null, used_at = now() where code = inv.code;
  else
    if coalesce(trim(p_school_name), '') = '' then raise exception 'Okul adı gerekli'; end if;
    insert into public.schools (name) values (trim(p_school_name)) returning id into sid;
    r := 'admin';
  end if;
  insert into public.profiles (id, school_id, role, full_name) values (p_user, sid, r, trim(p_full_name));
  if inv.code is not null then update public.invites set used_by = p_user where code = inv.code; end if;
  return jsonb_build_object('school_id', sid, 'role', r);
end
$$;

-- ---------------------------------------------------------------- 4) davet görünürlüğü
alter policy "personel okulun davetlerini görür" on public.invites
  using (((select app.is_admin()) and school_id = (select app.my_school()))
         or (kind = 'parent' and exists (select 1 from public.students st where st.id = student_id and (select app.teaches(st.section_id)))));

-- ---------------------------------------------------------------- 5) okul ekibi yönetimi
create function public.set_staff_role(p_user uuid, p_role text) returns void
language plpgsql security definer set search_path = '' as
$$
declare
  t public.profiles;
begin
  if not app.is_admin() then raise exception 'Yalnızca okul yöneticisi' using errcode = '42501'; end if;
  if p_role not in ('admin', 'teacher') then raise exception 'Geçersiz rol'; end if;
  select * into t from public.profiles where id = p_user;
  if t.id is null or t.school_id <> app.my_school() or t.role not in ('admin', 'teacher') then
    raise exception 'Kişi bu okulun öğretmenleri arasında yok' using errcode = '42501';
  end if;
  if p_role = 'teacher' and t.role = 'admin'
     and (select count(*) from public.profiles where school_id = t.school_id and role = 'admin') <= 1 then
    raise exception 'Okulda en az bir yönetici kalmalı';
  end if;
  update public.profiles set role = p_role::public.user_role where id = p_user;
end
$$;

-- Öğretmeni okuldan çıkarma ön kontrolü ('veri-sil' fonksiyonu hesabı siler; şubeler ve etkinlikler okulda kalır).
create function public.srv_can_remove_staff(p_actor uuid, p_target uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as
$$
declare
  a public.profiles;
  t public.profiles;
begin
  select * into a from public.profiles where id = p_actor;
  select * into t from public.profiles where id = p_target;
  if a.id is null or a.role <> 'admin' then return jsonb_build_object('ok', false, 'reason', 'Bu işlemi yalnızca okul yöneticisi yapabilir'); end if;
  if t.id is null or t.school_id <> a.school_id or t.role not in ('teacher', 'admin') then return jsonb_build_object('ok', false, 'reason', 'Kişi bu okulda bulunamadı'); end if;
  if t.id = a.id then return jsonb_build_object('ok', false, 'reason', 'Kendinizi okuldan çıkaramazsınız'); end if;
  return jsonb_build_object('ok', true, 'school_id', a.school_id);
end
$$;

-- Velinin kendi hesabını ve onayını silmesi için ön bilgi (çocuğun okul kaydı okulda kalır).
create function public.srv_parent_self(p_actor uuid) returns jsonb
language sql stable security definer set search_path = '' as
$$ select case when p.role = 'parent' then jsonb_build_object('ok', true, 'school_id', p.school_id)
              else jsonb_build_object('ok', false, 'reason', 'Yalnızca veli hesapları için') end
   from public.profiles p where p.id = p_actor $$;

revoke all on function public.reset_section_pins(uuid), public.move_student(uuid, uuid), public.set_staff_role(uuid, text) from public, anon;
grant execute on function public.reset_section_pins(uuid), public.move_student(uuid, uuid), public.set_staff_role(uuid, text) to authenticated;
revoke all on function public.srv_can_remove_staff(uuid, uuid), public.srv_parent_self(uuid) from public, anon, authenticated;
grant execute on function public.srv_can_remove_staff(uuid, uuid), public.srv_parent_self(uuid) to service_role;

-- ---------------------------------------------------------------- 6) ayırt edilebilir sınıf listesi
create or replace function public.srv_class_roster(p_code text) returns jsonb
language sql stable security definer set search_path = '' as
$$
  with s as (
    select s.id, s.grade, s.name, sc.name as school from public.sections s join public.schools sc on sc.id = s.school_id
    where s.class_code = upper(trim(p_code))
  ), st as (
    select st.id, st.first_name, st.last_name, st.student_no,
      count(*) over (partition by lower(st.first_name), lower(left(st.last_name, 1))) as d1,
      count(*) over (partition by lower(st.first_name), lower(left(st.last_name, 3))) as d3
    from public.students st join s on s.id = st.section_id where st.active
  )
  select jsonb_build_object(
    'section', jsonb_build_object('grade', s.grade, 'name', s.name, 'school', s.school),
    'students', coalesce((select jsonb_agg(jsonb_build_object('id', st.id, 'label',
        st.first_name || ' ' || left(st.last_name, case when st.d1 > 1 then 3 else 1 end) || '.'
        || case when st.d3 > 1 and st.student_no is not null then ' (No ' || st.student_no || ')' else '' end)
      order by st.first_name, st.last_name) from st), '[]'::jsonb))
  from s
$$;
