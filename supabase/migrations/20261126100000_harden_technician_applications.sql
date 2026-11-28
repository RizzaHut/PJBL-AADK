alter table public.pengajuan_teknisi
  drop constraint if exists pengajuan_teknisi_jenis_bukti_check;

alter table public.pengajuan_teknisi
  add constraint pengajuan_teknisi_jenis_bukti_check
  check (jenis_bukti in ('foto', 'video', 'tautan'));

drop policy if exists "pengajuan_teknisi_insert_own" on public.pengajuan_teknisi;
drop policy if exists "pengajuan_teknisi_update_moderator" on public.pengajuan_teknisi;
revoke insert, update, delete on table public.pengajuan_teknisi
  from authenticated, anon, public;

create or replace function public.ajukan_teknisi(
  p_url_bukti text,
  p_jenis_bukti text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if public.peran_pengguna_ini() is distinct from 'anggota' then
    raise exception 'Hanya anggota yang bisa mengajukan' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(79131, hashtext(auth.uid()::text));

  if p_url_bukti is null or char_length(p_url_bukti) > 2048 then
    raise exception 'URL bukti tidak valid' using errcode = '22023';
  end if;

  if p_jenis_bukti = 'tautan' then
    if p_url_bukti !~* '^https://[^/@[:space:]]+([/?#][^[:space:]]*)?$' then
      raise exception 'Tautan bukti harus menggunakan HTTPS' using errcode = '22023';
    end if;
  elsif p_jenis_bukti in ('foto', 'video') then
    if p_url_bukti not like auth.uid()::text || '/%' then
      raise exception 'Path bukti harus berada di folder milikmu' using errcode = '22023';
    end if;
  else
    raise exception 'Jenis bukti tidak valid' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.pengajuan_teknisi
    where pengguna_id = auth.uid() and status = 'pending'
  ) then
    raise exception 'Masih ada pengajuan yang menunggu' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.pengajuan_teknisi
    where pengguna_id = auth.uid()
      and status = 'rejected'
      and cooldown_sampai > now()
  ) then
    raise exception 'Masa tunggu pengajuan belum selesai' using errcode = 'P0001';
  end if;

  insert into public.pengajuan_teknisi (pengguna_id, url_bukti, jenis_bukti)
  values (auth.uid(), p_url_bukti, p_jenis_bukti)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.ajukan_teknisi(text, text) from public, anon;
grant execute on function public.ajukan_teknisi(text, text) to authenticated;
