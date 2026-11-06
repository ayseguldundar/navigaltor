-- NavigAItor — AI kotası: öğretmen ve sistem limitini atomik ayır.
-- Bu migration staging'de doğrulanmadan production'a uygulanmamalıdır.
create or replace function public.srv_reserve_ai_generation(
  p_school uuid,
  p_teacher uuid,
  p_daily_limit int,
  p_global_limit int,
  p_request jsonb,
  p_model text
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  teacher_used int;
  global_used int;
  row_id uuid;
begin
  if p_daily_limit < 1 or p_global_limit < 1 then
    raise exception 'Geçersiz AI kota ayarı';
  end if;

  -- Rezervasyon, sağlayıcı çağrısından önce tek transaction içinde yapılır.
  -- Böylece eşzamanlı istekler aynı boş kota aralığını iki kez kullanamaz.
  perform pg_advisory_xact_lock(731928451);
  select count(*) into teacher_used
    from public.ai_generations
    where teacher_id = p_teacher and created_at > now() - interval '1 day';
  select count(*) into global_used
    from public.ai_generations
    where created_at > now() - interval '1 day';

  if teacher_used >= p_daily_limit then
    return jsonb_build_object('ok', false, 'reason', 'teacher', 'used', teacher_used, 'limit', p_daily_limit);
  end if;
  if global_used >= p_global_limit then
    return jsonb_build_object('ok', false, 'reason', 'global', 'used', global_used, 'limit', p_global_limit);
  end if;

  insert into public.ai_generations (school_id, teacher_id, request, model, status)
  values (p_school, p_teacher, p_request, p_model, 'pending')
  returning id into row_id;

  return jsonb_build_object('ok', true, 'id', row_id, 'used', teacher_used + 1, 'limit', p_daily_limit);
end
$$;
revoke all on function public.srv_reserve_ai_generation(uuid, uuid, int, int, jsonb, text) from public, anon, authenticated;
grant execute on function public.srv_reserve_ai_generation(uuid, uuid, int, int, jsonb, text) to service_role;
