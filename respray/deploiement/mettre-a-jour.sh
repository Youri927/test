#!/usr/bin/env bash
# Met le site à jour avec la dernière version du code (à lancer en root sur le VPS) :
#   bash /srv/respray/code/respray/deploiement/mettre-a-jour.sh
# Sauvegarde la base, récupère le code, met la base à niveau, reconstruit et redémarre.
set -euo pipefail
RACINE=/srv/respray
APP="$RACINE/code/respray"
echo "▸ Sauvegarde de la base"
sudo -u respray bash -c "pg_dump respray | gzip > $RACINE/sauvegardes/avant-maj-\$(date +%F-%H%M).sql.gz"
echo "▸ Nouveau code"
sudo -u respray git -C "$RACINE/code" pull --ff-only
echo "▸ Dépendances, base, construction"
sudo -u respray bash -c "cd '$APP' && npm ci --no-audit --no-fund --loglevel=error && npx drizzle-kit push --force && npx next build"
echo "▸ Redémarrage"
systemctl restart respray
sleep 3
curl -fsS -o /dev/null http://127.0.0.1:3000/robots.txt && echo "✓ Le site tourne, à jour." || echo "Le site ne répond pas : journalctl -u respray -n 50"
