-- Reprise de l'historique de la v2 (tables mail_tracker_*) dans les tables de la v3. Peut être relancé sans doublon.
-- Les doublons d'ouverture à moins d'une minute sont écartés, comme dans la v3.
begin;
insert into public.pt_emails (id, sender, recipient, subject, source, created_at, sent_at)
select id::text, 'yourih927@gmail.com',
       nullif(array_to_string(array(select trim(x) from unnest(string_to_array(recipient, ',')) x where lower(trim(x)) <> 'yourih927@gmail.com'), ', '), ''),
       subject, coalesce(source, 'v2') || ' (import)', created_at, created_at
from public.mail_tracker_emails
on conflict (id) do nothing;

insert into public.pt_events (email_id, type, counted, reason, url, user_agent, created_at)
select tracking_id::text, event_type,
       not dup,
       case when dup then 'dup' when event_type = 'click' then 'human' else 'other' end,
       url, null, created_at
from (
  select *, coalesce(created_at - lag(created_at) over (partition by tracking_id, event_type, coalesce(url, '') order by created_at)
                     < case when event_type = 'click' then interval '3 seconds' else interval '60 seconds' end, false) as dup
  from public.mail_tracker_events
) t
where not exists (select 1 from public.pt_events p where p.email_id = t.tracking_id::text and p.created_at = t.created_at and p.type = t.event_type);
commit;
