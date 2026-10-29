-- NavigAItor — pilot işletimi: KVKK kapsamında öğrenci verisinin silinmesi ve yöneticinin şifre sıfırlaması.
-- Silme işleminin kendisi yetki denetiminden sonra 'veri-sil' sunucu fonksiyonunda yapılır.
-- İşlem kaydı kişisel veri tutmaz (yalnızca kim, ne zaman, hangi tür işlem).

create table public.admin_log (
  id bigint generated always as identity primary key,
  school_id uuid references public.schools (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null check (action in ('ogrenci_sil', 'sifre_sifirla')),
  created_at timestamptz not null default now()
);
alter table public.admin_log enable row level security;
create policy "yönetici kendi okulunun kayıtlarını görür" on public.admin_log for select to authenticated
  using ((select app.is_admin()) and school_id = (select app.my_school()));
revoke insert, update, delete, truncate on public.admin_log from anon, authenticated;
revoke all on public.admin_log from anon;

-- Silme ön kontrolü: işlemi yapan aynı okulun yöneticisi mi? Silinecek hesaplar hangileri?
create function public.srv_student_deletion_plan(p_actor uuid, p_student uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as
$$
declare
  st public.students;
begin
  select * into st from public.students where id = p_student;
  if st.id is null then return jsonb_build_object('ok', false, 'reason', 'Öğrenci bulunamadı'); end if;
  if not exists (select 1 from public.profiles where id = p_actor and role = 'admin' and school_id = st.school_id) then
    return jsonb_build_object('ok', false, 'reason', 'Bu işlemi yalnızca okul yöneticisi yapabilir');
  end if;
  return jsonb_build_object('ok', true, 'school_id', st.school_id, 'student_auth', st.auth_user_id,
    -- yalnızca bu öğrenciye bağlı olan veli hesapları da silinir (başka çocuğu olan velinin hesabı kalır)
    'parent_auth', coalesce((select jsonb_agg(g.parent_id) from public.guardians g
      where g.student_id = st.id and not exists (select 1 from public.guardians g2 where g2.parent_id = g.parent_id and g2.student_id <> st.id)), '[]'::jsonb));
end
$$;


create function public.srv_can_reset_password(p_actor uuid, p_target uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as
$$
declare
  a public.profiles;
  t public.profiles;
begin
  select * into a from public.profiles where id = p_actor;
  select * into t from public.profiles where id = p_target;
  if a.id is null or a.role <> 'admin' then return jsonb_build_object('ok', false, 'reason', 'Bu işlemi yalnızca okul yöneticisi yapabilir'); end if;
  if t.id is null or t.school_id <> a.school_id then return jsonb_build_object('ok', false, 'reason', 'Kişi bu okulda bulunamadı'); end if;
  if t.role not in ('teacher', 'parent') then return jsonb_build_object('ok', false, 'reason', 'Öğrenci şifreleri “Yeni PIN” ile yenilenir'); end if;
  return jsonb_build_object('ok', true, 'school_id', a.school_id);
end
$$;

create function public.srv_log_password_reset(p_actor uuid, p_school uuid) returns void
language sql security definer set search_path = '' as
$$ insert into public.admin_log (school_id, actor_id, action) values (p_school, p_actor, 'sifre_sifirla') $$;

revoke all on function public.srv_student_deletion_plan(uuid, uuid),
  public.srv_can_reset_password(uuid, uuid), public.srv_log_password_reset(uuid, uuid) from public, anon, authenticated;
grant execute on function public.srv_student_deletion_plan(uuid, uuid),
  public.srv_can_reset_password(uuid, uuid), public.srv_log_password_reset(uuid, uuid) to service_role;
