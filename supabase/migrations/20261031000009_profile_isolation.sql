-- Pilot readiness: teachers can read their own profile/assignments; school-wide
-- staff lists and assignment mappings are admin-only.
-- Apply only in an isolated staging project after review.

drop policy if exists "kendi profili ve okuldaki personel" on public.profiles;
create policy "kendi profili ve okul yöneticisinin personeli"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (
    (select app.is_admin())
    and school_id = (select app.my_school())
  )
);

drop policy if exists "okuldaki personel şube atamalarını görür" on public.teacher_sections;
create policy "yönetici okul atamalarını, öğretmen kendi atamasını görür"
on public.teacher_sections
for select
to authenticated
using (
  teacher_id = (select auth.uid())
  or (
    (select app.is_admin())
    and exists (
      select 1 from public.sections s
      where s.id = section_id
        and s.school_id = (select app.my_school())
    )
  )
);
