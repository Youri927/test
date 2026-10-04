// Réglages par défaut. Le jeton (TRACKER_TOKEN côté Supabase) se saisit dans les réglages de l'extension,
// ou ici avant de charger l'extension.
export const DEFAULTS = {
  apiBase: 'https://nhdetemdffwghujefffq.supabase.co/functions/v1/mail-tracker',
  apiToken: '',
};

/** les réglages de l'extension (popup) et leur valeur par défaut */
export const PREFS = {
  trackingDefault: true, // suivre les nouveaux mails
  trackLinks: true, // suivre les clics sur les liens
  flagIncoming: true, // signaler les mails reçus qui contiennent un pixel de suivi
  notifyOpen: true,
  notifyClick: true,
  notifyHot: true, // lu plusieurs fois en 24 h
  notifyRevival: true, // ré-ouvert après une semaine de silence
  remindHours: 72, // relance si pas ouvert sous… (0 = jamais)
  dailyReport: true, // récap chaque matin
};
