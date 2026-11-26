#!/usr/bin/env bash
# Installe Respray sur un VPS Ubuntu 24.04 neuf, en une fois. À lancer en root :
#   curl -fsSL https://raw.githubusercontent.com/Youri927/test/claude/serene-pasteur-to9g3b/respray/deploiement/installer.sh -o installer.sh && bash installer.sh
# Il installe : Node.js 22, PostgreSQL, Caddy (HTTPS automatique), le site (service systemd), le pare-feu, la tâche
# des délais toutes les 15 minutes et une sauvegarde de la base chaque nuit. Il pose les questions dont il a besoin
# (adresse e-mail de l'équipe, clés Stripe) : les clés se tapent ici, dans le terminal du VPS, jamais ailleurs.
# Relancer le script ne casse rien : ce qui est déjà fait est sauté.
set -euo pipefail

DOMAINE="${DOMAINE:-respray.fr}"
DEPOT="${DEPOT:-https://github.com/Youri927/test.git}"
BRANCHE="${BRANCHE:-claude/serene-pasteur-to9g3b}"
RACINE=/srv/respray
APP="$RACINE/code/respray"
ENVF="$RACINE/.env"

etape() { printf '\n\033[1;32m▸ %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "À lancer en root."; exit 1; }
export DEBIAN_FRONTEND=noninteractive

etape "Mise à jour du système et outils de base"
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl git ufw gnupg ca-certificates debian-keyring debian-archive-keyring apt-transport-https openssl cron

etape "Mémoire d'appoint (swap de 2 Go, pour la construction du site)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

etape "Node.js 22"
if ! node -v 2>/dev/null | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs
fi

etape "PostgreSQL"
apt-get install -y -qq postgresql
systemctl enable --now postgresql

etape "Caddy (serveur web, HTTPS automatique)"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -qq && apt-get install -y -qq caddy
fi

etape "Utilisateur et dossiers"
id respray >/dev/null 2>&1 || useradd --system --create-home --home-dir "$RACINE" --shell /bin/bash respray
mkdir -p "$RACINE"/{photos,sauvegardes}
chown -R respray:respray "$RACINE"

etape "Base de données"
if [ ! -f "$ENVF" ]; then
  MDP_BASE=$(openssl rand -hex 24)
  sudo -u postgres psql -qc "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='respray') THEN CREATE ROLE respray LOGIN PASSWORD '$MDP_BASE'; ELSE ALTER ROLE respray PASSWORD '$MDP_BASE'; END IF; END \$\$;"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='respray'" | grep -q 1 || sudo -u postgres createdb -O respray respray
fi

etape "Le code du site"
if [ ! -d "$RACINE/code/.git" ]; then
  sudo -u respray git clone --depth 1 --branch "$BRANCHE" --filter=blob:none --sparse "$DEPOT" "$RACINE/code"
  sudo -u respray git -C "$RACINE/code" sparse-checkout set respray
else
  sudo -u respray git -C "$RACINE/code" pull --ff-only
fi

etape "Les réglages (.env)"
if [ ! -f "$ENVF" ]; then
  echo "Quelques questions. Les clés se trouvent dans Stripe : Développeurs, puis Clés API (et Webhooks)."
  read -rp "Adresse e-mail du compte de l'équipe : " EQ_EMAIL
  read -rsp "Mot de passe du compte de l'équipe (12 caractères au moins) : " EQ_MDP; echo
  read -rp "Clé publiable Stripe (pk_test_… pour commencer) : " PK
  read -rsp "Clé secrète Stripe (sk_test_… pour commencer, rien ne s'affiche) : " SK; echo
  cat > "$ENVF" <<EOF
DATABASE_URL=postgres://respray:${MDP_BASE}@localhost:5432/respray
SITE_URL=https://${DOMAINE}
PHOTOS_DOSSIER=${RACINE}/photos
EQUIPE_EMAIL=${EQ_EMAIL}
EQUIPE_MOT_DE_PASSE=${EQ_MDP}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${PK}
STRIPE_SECRET_KEY=${SK}
# à remplir après avoir créé les deux webhooks dans Stripe (voir le guide), puis : systemctl restart respray
STRIPE_WEBHOOK_SECRET=
STRIPE_WEBHOOK_SECRET_V2=
# 1 tant que le contrat Mondial Relay n'est pas signé
ENVOIS_SIMULES=1
TACHES_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF
  chown respray:respray "$ENVF" && chmod 600 "$ENVF"
  ln -sf "$ENVF" "$APP/.env"
fi
ln -sf "$ENVF" "$APP/.env"

etape "Installation, base de données, catalogue, construction (quelques minutes)"
sudo -u respray bash -c "cd '$APP' && npm ci --no-audit --no-fund --loglevel=error && npx drizzle-kit push --force && npm run -s db:seed && (npm run -s senteurs || true) && npx next build"

etape "Le service du site"
cat > /etc/systemd/system/respray.service <<EOF
[Unit]
Description=Respray
After=network.target postgresql.service

[Service]
User=respray
WorkingDirectory=${APP}
EnvironmentFile=${ENVF}
ExecStart=/usr/bin/npx next start -p 3000 -H 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now respray
systemctl restart respray

etape "Caddy : ${DOMAINE} et www.${DOMAINE}, en HTTPS"
cat > /etc/caddy/Caddyfile <<EOF
${DOMAINE} {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000
}
www.${DOMAINE} {
	redir https://${DOMAINE}{uri} permanent
}
EOF
systemctl reload caddy || systemctl restart caddy

etape "Pare-feu : SSH, HTTP et HTTPS seulement"
ufw allow OpenSSH >/dev/null && ufw allow 80/tcp >/dev/null && ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

etape "Tâches automatiques : délais toutes les 15 minutes, sauvegarde chaque nuit (14 jours gardés)"
cat > /etc/cron.d/respray <<EOF
*/15 * * * * respray curl -fsS -H "Authorization: Bearer \$(grep ^TACHES_SECRET= ${ENVF} | cut -d= -f2)" http://127.0.0.1:3000/api/taches >/dev/null 2>&1
30 3 * * * respray pg_dump respray | gzip > ${RACINE}/sauvegardes/respray-\$(date +\\%F).sql.gz && find ${RACINE}/sauvegardes -name '*.sql.gz' -mtime +14 -delete
EOF
chmod 644 /etc/cron.d/respray

etape "Terminé"
sleep 3
if curl -fsS -o /dev/null http://127.0.0.1:3000/robots.txt; then echo "Le site tourne."; else echo "Le site ne répond pas encore : journalctl -u respray -n 50"; fi
echo "Adresse : https://${DOMAINE} (le cadenas HTTPS apparaît dès que le nom de domaine pointe vers ce serveur)."
echo "Prochaine étape : créer les deux webhooks dans Stripe (voir le guide), puis mettre leurs secrets dans ${ENVF}."
