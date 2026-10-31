-- Pilot readiness: atomic, service-role-only limit RPCs.
-- Do not apply to production/staging without an explicit migration run.

create or replace function public.srv_rate_limit(p_bucket text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = ''
as
$$
declare
  n int;
begin
  if p_bucket is null or length(btrim(p_bucket)) = 0 or length(p_bucket) > 512
     or p_max is null or p_max < 1
     or p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit arguments' using errcode = '22023';
  end if;

  -- Serialize all attempts for the same bucket, including the count and insert.
  pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_bucket, 0));
  delete from public.login_attempts where created_at < now() - interval '1 day';
  select count(*) into n
  from public.login_attempts
  where bucket = p_bucket
    and created_at > now() - make_interval(secs => p_window_seconds);
  if n >= p_max then return false; end if;
  insert into public.login_attempts (bucket) values (p_bucket);
  return true;
end
$$;

create or replace function public.srv_ai_reserve(
  p_teacher uuid,
  p_school uuid,
  p_daily_limit int,
  p_global_limit int,
  p_model text,
  p_request jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as
$$
declare
  teacher_used int;
  global_used int;
  reservation public.ai_generations;
begin
  if p_teacher is null or p_school is null
     or p_daily_limit is null or p_daily_limit < 1
     or p_global_limit is null or p_global_limit < 1
     or p_model is null or length(btrim(p_model)) = 0 or length(p_model) > 200
     or p_request is null then
    raise exception 'invalid AI reservation arguments' using errcode = '22023';
  end if;

  -- One global transaction lock closes the count-then-insert race for both limits.
  pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('ai_generations:rolling-24h', 0));
  select count(*) into global_used
  from public.ai_generations
  where created_at > now() - interval '1 day';
  if global_used >= p_global_limit then
    return jsonb_build_object('ok', false, 'reason', 'global', 'used', global_used, 'limit', p_global_limit);
  end if;

  select count(*) into teacher_used
  from public.ai_generations
  where teacher_id = p_teacher
    and created_at > now() - interval '1 day';
  if teacher_used >= p_daily_limit then
    return jsonb_build_object('ok', false, 'reason', 'teacher', 'used', teacher_used, 'limit', p_daily_limit);
  end if;

  insert into public.ai_generations (teacher_id, school_id, request, status, model)
  values (p_teacher, p_school, p_request, 'pending', p_model)
  returning * into reservation;
  return jsonb_build_object('ok', true, 'id', reservation.id,
                            'used', teacher_used + 1, 'limit', p_daily_limit);
end
$$;

revoke all on function public.srv_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.srv_rate_limit(text, int, int) to service_role;
revoke all on function public.srv_ai_reserve(uuid, uuid, int, int, text, jsonb) from public, anon, authenticated;
grant execute on function public.srv_ai_reserve(uuid, uuid, int, int, text, jsonb) to service_role;
