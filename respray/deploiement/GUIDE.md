# Mettre Respray en ligne sur le VPS Hostinger

Compter une demi-heure, dont une dizaine de minutes où le script travaille seul.

## 1. Le système du VPS

Dans hPanel : **VPS**, ton serveur, puis **Système d'exploitation**. Il faut **Ubuntu 24.04** « simple »,
sans panneau ni application. Si c'est autre chose, réinstalle Ubuntu 24.04 (le VPS est vide, rien n'est perdu).
Note l'**adresse IP** du VPS (sur la page d'aperçu).

## 2. Le nom de domaine vers le VPS

hPanel : **Domaines**, respray.fr, **DNS / Serveurs de noms**. Dans la zone DNS :

| Type | Nom | Pointe vers |
|---|---|---|
| A | `@` | l'IP du VPS |
| A | `www` | l'IP du VPS |

Supprime les autres lignes **A**, **AAAA** et **CNAME** de `@` et `www` (celles de la page de parking de
Hostinger). Ne touche pas aux lignes **MX** ni **TXT** (les e-mails). La propagation prend de quelques minutes à
quelques heures : on peut continuer en attendant.

## 3. L'installation

hPanel : VPS, puis **Terminal du navigateur** (ou `ssh root@IP` depuis ton ordinateur). Colle :

```bash
curl -fsSL https://raw.githubusercontent.com/Youri927/test/claude/serene-pasteur-to9g3b/respray/deploiement/installer.sh -o installer.sh && bash installer.sh
```

Le script pose quatre questions :
- l'**adresse e-mail** et le **mot de passe** du compte de l'équipe (celui qui vérifie les annonces) ;
- la **clé publiable** Stripe (`pk_test_…`) et la **clé secrète** (`sk_test_…`, Stripe : Développeurs, Clés API).
  On commence en mode test ; on passera aux clés live au lancement.

Les clés se tapent dans ce terminal, nulle part ailleurs. À la fin : « Le site tourne. »

## 4. Les webhooks Stripe

Stripe, compte Respray, mode test : **Workbench**, onglet **Webhooks**, puis **Add destination**. Après
« Continue », choisir **Webhook endpoint**, puis saisir l'URL. Les comptes vendeurs sont des comptes « v2 » : leurs
événements arrivent par les destinations **Your account**.

1. **Your account**, style **Snapshot**, URL `https://respray.fr/api/stripe/webhook`, événements :
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`,
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`,
   `payout.failed`.
2. **Your account**, style **Thin**, URL `https://respray.fr/api/stripe/evenements-v2`, événements :
   `v2.core.account.updated`, `v2.core.account[requirements].updated`,
   `v2.core.account[configuration.recipient].capability_status_updated`.
3. (Par sécurité) **Connected accounts**, style **Snapshot**, URL `https://respray.fr/api/stripe/webhook`,
   événement : `payout.failed`. Un événement reçu deux fois n'est traité qu'une fois.

Chaque destination a un **secret de signature** (`whsec_…`). Sur le VPS :

```bash
nano /srv/respray/.env
```

- `STRIPE_WEBHOOK_SECRET=` : les secrets des destinations 1 et 3, séparés par une virgule, sans espace
  (`whsec_aaa,whsec_ccc`) ;
- `STRIPE_WEBHOOK_SECRET_V2=` : le secret de la destination 2.

Enregistre (Ctrl+O, Entrée, Ctrl+X), puis :

```bash
systemctl restart respray
```

## 5. Vérifier

- https://respray.fr s'ouvre, avec le cadenas.
- Connexion avec le compte de l'équipe : l'onglet **Équipe** apparaît.
- Un compte vendeur de test : **Mes versements**, puis **Configurer mes versements**, avec les données de test
  Stripe (« Use test phone number », code `000000`, naissance 01/01/1901, adresse `address_full_match`, IBAN
  `FR1420041010050500013M02606`).
- Une annonce, vérifiée par l'équipe, achetée par un autre compte avec la carte `4242 4242 4242 4242`.

## 6. Les e-mails

Le site envoie ses e-mails (bienvenue, mot de passe oublié, paiement, colis, versement, litige, envies, offres,
messages) par SMTP. Brevo (français, gratuit jusqu'à 300 e-mails par jour) convient très bien.

1. Crée un compte sur brevo.com, puis **Expéditeurs, domaines et IP dédiées**, **Domaines**, ajoute `respray.fr`.
   Brevo affiche des enregistrements DNS (code Brevo, DKIM, DMARC) : ajoute-les tels quels dans hPanel, Domaines,
   respray.fr, DNS, puis clique sur « Authentifier » chez Brevo. Sans cette étape, les e-mails finissent en
   indésirables.
2. Chez Brevo, **SMTP et API**, onglet **SMTP** : note l'identifiant de connexion et crée une **clé SMTP**.
3. Sur le VPS, colle cette commande (elle demande l'identifiant et la clé, rien ne s'affiche pour la clé) :

```bash
read -rp "Identifiant SMTP Brevo : " U; read -rsp "Clé SMTP Brevo : " P; echo; F=/srv/respray/.env; for kv in "SMTP_HOST=smtp-relay.brevo.com" "SMTP_PORT=587" "SMTP_USER=$U" "SMTP_PASS=$P" "EMAIL_EXPEDITEUR=Respray <noreply@respray.fr>" "EMAIL_REPONSE=contact@respray.fr"; do k=${kv%%=*}; if grep -q "^$k=" $F; then sed -i "s|^$k=.*|$kv|" $F; else echo "$kv" >> $F; fi; done; systemctl restart respray && echo "E-mails configurés."
```

4. Test : sur respray.fr, « Se connecter », « Mot de passe oublié ? », avec ton adresse. L'e-mail doit arriver
   en boîte de réception. En cas de souci : `sudo -u respray psql respray -c "select a, sujet, statut, erreur from emails order by id desc limit 5;"`

## 7. Le logo en photo de profil des e-mails (BIMI)

Le logo carré est déjà en ligne : https://respray.fr/bimi/respray.svg (format SVG Tiny PS exigé par la norme).
Dans hPanel, Domaines, respray.fr, DNS :

1. Ajoute un enregistrement **TXT**, nom `default._bimi`, valeur :
   `v=BIMI1; l=https://respray.fr/bimi/respray.svg;`
2. Modifie l'enregistrement **TXT `_dmarc`** créé pour Brevo : remplace `p=none` par `p=quarantine` (garde le
   reste, dont `rua=…`). Sans cette politique, aucune messagerie n'affiche le logo.

Attention : avec `p=quarantine`, tout e-mail envoyé au nom de @respray.fr par un service non authentifié finit en
indésirables. Si tu crées plus tard une boîte contact@respray.fr chez Hostinger, active aussi son DKIM dans hPanel.

Où le logo s'affiche : Yahoo Mail, AOL, Fastmail et quelques autres, sans rien payer. Gmail et Apple Mail exigent en
plus un certificat (VMC, pour une marque déposée, ou CMC), payant, de l'ordre de plusieurs centaines d'euros par an :
à envisager quand Respray sera une marque déposée.

## Ensuite

- **Mettre à jour le site** après une modification du code :

  ```bash
  bash /srv/respray/code/respray/deploiement/mettre-a-jour.sh
  ```

- **Voir ce qui se passe** : `journalctl -u respray -f` (Ctrl+C pour sortir).
- **Sauvegardes** : chaque nuit dans `/srv/respray/sauvegardes` (14 jours gardés). Les photos des vendeurs sont dans
  `/srv/respray/photos`. Les sauvegardes hebdomadaires de Hostinger couvrent tout le serveur.
- **Au lancement** : remplacer les clés test par les clés live dans `/srv/respray/.env`, recréer les deux webhooks en
  mode live, puis redémarrer le service.
