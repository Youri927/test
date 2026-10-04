-- Prospect Tracker v3 : les mails suivis et leurs signaux.
-- À exécuter une fois dans Supabase (SQL Editor → New query → coller → Run), ou : supabase db push

create table if not exists public.pt_emails (
  id          text primary key,
  sender      text,                    -- le compte Gmail qui a envoyé (pour reconnaître ses propres vues)
  recipient   text,
  subject     text,
  source      text,
  created_at  timestamptz not null default now(),
  sent_at     timestamptz,             -- null tant que le mail n'est pas parti (brouillon)
  self_until  timestamptz              -- l'expéditeur regarde son propre mail jusqu'à cette heure
);

create table if not exists public.pt_events (
  id          bigint generated always as identity primary key,
  email_id    text not null,           -- pas de clé étrangère : les signaux d'anciens mails sont gardés aussi
  type        text not null check (type in ('open', 'click')),
  counted     boolean not null,
  -- comptés : gmail, apple, outlook, yahoo, other (ouvertures), implied (ouverture déduite d'un clic), human (clic)
  -- ignorés : self (l'expéditeur lui-même), dup (doublon), bot (antivirus, aperçu de lien)
  reason      text not null,
  url         text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists pt_events_email_time on public.pt_events (email_id, created_at desc);
create index if not exists pt_emails_sent on public.pt_emails (sent_at desc);

-- Les compteurs, calculés à partir des signaux comptés
create or replace view public.pt_email_stats as
select
  e.*,
  count(v.id) filter (where v.counted and v.type = 'open')  as open_count,
  count(v.id) filter (where v.counted and v.type = 'click') as click_count,
  min(v.created_at) filter (where v.counted and v.type = 'open')  as first_open_at,
  max(v.created_at) filter (where v.counted and v.type = 'open')  as last_open_at,
  max(v.created_at) filter (where v.counted and v.type = 'click') as last_click_at
from public.pt_emails e
left join public.pt_events v on v.email_id = e.id
group by e.id;

-- Seule la fonction (clé service) lit et écrit : aucune lecture publique
alter table public.pt_emails enable row level security;
alter table public.pt_events enable row level security;
revoke all on public.pt_emails, public.pt_events, public.pt_email_stats from anon, authenticated;

-- (Facultatif) Reprendre l'historique de l'ancienne version.
-- Les noms ci-dessous sont des suppositions : adaptez-les à vos anciennes tables avant de décommenter.
-- insert into public.pt_emails (id, recipient, subject, source, created_at, sent_at)
--   select id::text, recipient, subject, source, created_at, created_at from public.emails
--   on conflict (id) do nothing;
-- insert into public.pt_events (email_id, type, counted, reason, url, created_at)
--   select email_id::text, event_type, true, case when event_type = 'click' then 'human' else 'other' end, url, created_at
--   from public.email_events;
