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

Stripe, compte Respray, mode test : **Développeurs**, puis **Webhooks**, puis **Ajouter une destination**.

1. **Événements du compte et des comptes connectés**, URL `https://respray.fr/api/stripe/webhook`, événements :
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`,
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`,
   `payout.failed`.
2. **Événements v2 (« thin »)**, URL `https://respray.fr/api/stripe/evenements-v2`, événements :
   `v2.core.account.updated`, `v2.core.account[requirements].updated`,
   `v2.core.account[configuration.recipient].capability_status_updated`.

Chaque destination a un **secret de signature** (`whsec_…`). Sur le VPS :

```bash
nano /srv/respray/.env
```

Colle le premier dans `STRIPE_WEBHOOK_SECRET=`, le second dans `STRIPE_WEBHOOK_SECRET_V2=`, enregistre
(Ctrl+O, Entrée, Ctrl+X), puis :

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
