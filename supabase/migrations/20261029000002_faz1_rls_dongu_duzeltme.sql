-- RLS döngüsünü kır: çapraz tablo kontrolleri security definer yardımcılarla yapılır.
create function app.parent_student_ids() returns setof uuid
language sql stable security definer set search_path = '' as
$$ select student_id from public.guardians where parent_id = auth.uid() $$;

create function app.teaches_student(p_student uuid) returns boolean
language sql stable security definer set search_path = '' as
$$ select coalesce((select app.teaches(section_id) from public.students where id = p_student), false) $$;

create function app.linked_section_ids() returns setof uuid
language sql stable security definer set search_path = '' as
$$
  select section_id from public.students where auth_user_id = auth.uid()
  union
  select st.section_id from public.students st join public.guardians g on g.student_id = st.id where g.parent_id = auth.uid()
$$;

grant execute on function app.parent_student_ids(), app.teaches_student(uuid), app.linked_section_ids() to authenticated, service_role;

drop policy "şubeyi görebilenler" on public.sections;
create policy "şubeyi görebilenler" on public.sections for select to authenticated
  using ((select app.teaches(id)) or id in (select app.linked_section_ids()));

drop policy "öğretmen şubesindeki, öğrenci kendini, veli çocuğunu görür" on public.students;
create policy "öğretmen şubesindeki, öğrenci kendini, veli çocuğunu görür" on public.students for select to authenticated
  using ((select app.teaches(section_id))
         or auth_user_id = (select auth.uid())
         or id in (select app.parent_student_ids()));

drop policy "veli kendi bağlantısını, öğretmen şubesininkileri görür" on public.guardians;
create policy "veli kendi bağlantısını, öğretmen şubesininkileri görür" on public.guardians for select to authenticated
  using (parent_id = (select auth.uid()) or app.teaches_student(student_id));

drop policy "veli kendi onayını, öğretmen şubesininkileri görür" on public.consents;
create policy "veli kendi onayını, öğretmen şubesininkileri görür" on public.consents for select to authenticated
  using (parent_id = (select auth.uid()) or app.teaches_student(student_id));
