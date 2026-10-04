// Prospect Tracker : la fonction Supabase « mail-tracker » (Deno).
// Déploiement : supabase functions deploy mail-tracker --no-verify-jwt
// Secret      : supabase secrets set TRACKER_TOKEN=<le jeton saisi dans l'extension>
// Tables      : supabase/migrations/20261004120000_prospect_tracker_v3.sql

import {createClient} from 'npm:@supabase/supabase-js@2';
import {makeHandler} from './handler.ts';
import type {EmailRow, EmailStats, EventRow, Store} from './handler.ts';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: {persistSession: false, autoRefreshToken: false},
});

const must = <T>({data, error}: {data: T; error: unknown}): T => {
  if (error) throw error;
  return data;
};

const store: Store = {
  async getEmail(id) {
    return must(await db.from('pt_emails').select('*').eq('id', id).maybeSingle()) as EmailRow | null;
  },
  async createEmail(row) {
    must(await db.from('pt_emails').insert(row));
  },
  async updateEmail(id, patch) {
    must(await db.from('pt_emails').update(patch).eq('id', id));
  },
  async addEvent(ev) {
    must(await db.from('pt_events').insert(ev));
  },
  async events(id) {
    return must(await db.from('pt_events').select('email_id,type,counted,reason,url,user_agent,created_at').eq('email_id', id).order('created_at', {ascending: false}).limit(500)) as EventRow[];
  },
  async markSelf(id, since, types) {
    must(await db.from('pt_events').update({counted: false, reason: 'self'}).eq('email_id', id).eq('counted', true).gte('created_at', since).in('type', types));
  },
  async markBot(id, since) {
    must(await db.from('pt_events').update({counted: false, reason: 'bot'}).eq('email_id', id).eq('counted', true).gte('created_at', since).or('type.eq.click,reason.eq.implied'));
  },
  async listStats(limit, ids) {
    let q = db.from('pt_email_stats').select('*').not('sent_at', 'is', null).order('sent_at', {ascending: false}).limit(limit);
    if (ids) q = q.in('id', ids);
    return must(await q) as EmailStats[];
  },
  async getStats(id) {
    return must(await db.from('pt_email_stats').select('*').eq('id', id).maybeSingle()) as EmailStats | null;
  },
  async dropUnsent(olderThan) {
    must(await db.from('pt_emails').delete().is('sent_at', null).lt('created_at', olderThan));
  },
};

Deno.serve(makeHandler(store, {token: Deno.env.get('TRACKER_TOKEN') ?? ''}));
