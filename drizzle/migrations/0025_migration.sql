create or replace function public.phone_calls_default_location() returns trigger language plpgsql set search_path=public as $$
begin
  if new.location is null and new.assistant = 'bonn' then new.location := 'bonn'; end if;
  return new;
end $$;
drop trigger if exists trg_phone_calls_default_location on public.phone_calls;
create trigger trg_phone_calls_default_location before insert or update on public.phone_calls
for each row execute function public.phone_calls_default_location();
update public.phone_calls set location='bonn' where location is null and assistant='bonn';