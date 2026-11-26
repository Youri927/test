/* Diagnostic Mondial Relay, à lancer sur le serveur : essaie la recherche de points relais puis la création d'une
   étiquette avec plusieurs modes de collecte, et affiche le code de réponse de chacun. Avec les paramètres de TEST
   (TTMRSDBX), rien n'est expédié ni facturé. Lit MR_ENSEIGNE et MR_CLE_PRIVEE dans l'environnement.
   Lancement : voir deploiement/GUIDE.md (étape 10). */
import {createHash} from 'node:crypto';
import {readFileSync, existsSync} from 'node:fs';

// les réglages : lus directement dans /srv/respray/.env (sans passer par le shell, qui peut abîmer un caractère spécial)
const fichier = process.argv[2] || '/srv/respray/.env';
const lu = existsSync(fichier) ? Object.fromEntries(readFileSync(fichier, 'utf8').split('\n').map((l) => l.match(/^\s*([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^(["'])(.*)\1$/, '$2')])) : {};
const v = (k) => process.env[k] || lu[k];
const ENS = v('MR_ENSEIGNE'), CLE = v('MR_CLE_PRIVEE'), LOGIN = v('MR_API2_LOGIN'), MDP = v('MR_API2_MOT_DE_PASSE');
const x = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// le mot de passe n'est jamais affiché : seulement sa longueur et ce qui pourrait poser problème
if (MDP) {
  const pb = [];
  if (/[^\x20-\x7e]/.test(MDP)) pb.push('contient des caractères spéciaux non clavier (des « • » ? il a peut-être été copié masqué)');
  if (/^\s|\s$/.test(MDP)) pb.push('commence ou finit par un espace');
  console.log(`Mot de passe API 2 enregistré : ${MDP.length} caractères${pb.length ? ` ; attention : ${pb.join(', ')}` : ''}`);
}
if (!ENS || !CLE) { console.log('MR_ENSEIGNE ou MR_CLE_PRIVEE manquant.'); process.exit(1); }

async function appel(methode, champs) {
  const sec = createHash('md5').update(champs.map(([, v]) => v).join('') + CLE, 'latin1').digest('hex').toUpperCase();
  const corps = champs.map(([k, v]) => `<${k}>${v}</${k}>`).join('') + `<Security>${sec}</Security>`;
  const xml = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><${methode} xmlns="http://www.mondialrelay.fr/webservice/">${corps}</${methode}></soap:Body></soap:Envelope>`;
  const r = await fetch('https://api.mondialrelay.com/Web_Services.asmx', {method: 'POST', headers: {'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"http://www.mondialrelay.fr/webservice/${methode}"`}, body: xml});
  return r.text();
}
const champ = (x, n) => (x.match(new RegExp(`<${n}>([^<]*)</${n}>`)) || [])[1]?.trim() ?? '';

console.log(`Enseigne : ${ENS}`);
const r = await appel('WSI4_PointRelais_Recherche', [['Enseigne', ENS], ['Pays', 'FR'], ['NumPointRelais', ''], ['Ville', ''], ['CP', '75011'], ['Latitude', ''], ['Longitude', ''], ['Taille', ''], ['Poids', '1000'], ['Action', '24R'], ['DelaiEnvoi', '0'], ['RayonRecherche', '20'], ['TypeActivite', ''], ['NACE', ''], ['NombreResultats', '3']]);
const relais = champ(r, 'Num');
console.log(`Recherche de points relais : code ${champ(r, 'STAT')}${relais ? `, premier point ${relais}` : ''}`);

// (l'ancien service d'étiquettes de l'API 1 répond « compte non activé » pour les comptes récents : on ne l'essaie plus)

/* l'API 2 (Shipment), qui crée les étiquettes des comptes récents */
if (!LOGIN || !MDP) { console.log('API 2 : MR_API2_LOGIN ou MR_API2_MOT_DE_PASSE manquant.'); process.exit(0); }
const url = ENS === 'TTMRSDBX' ? 'https://connect-api-sandbox.mondialrelay.com/api/shipment' : 'https://connect-api.mondialrelay.com/api/shipment';
const adr = (p, n, rue, mob, email) => `<Address><Title/><Firstname>${p}</Firstname><Lastname>${n}</Lastname><Streetname>${rue}</Streetname><HouseNo/><CountryCode>FR</CountryCode><PostCode>75011</PostCode><City>Paris</City><AddressAdd1/><AddressAdd2/><AddressAdd3/><PhoneNo/><MobileNo>${mob}</MobileNo><Email>${email}</Email></Address>`;
for (const mode of ['REL', 'CCC']) {
  const corps = `<?xml version="1.0" encoding="utf-8"?><ShipmentCreationRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.example.org/Request"><Context><Login>${x(LOGIN)}</Login><Password>${x(MDP)}</Password><CustomerId>${x(ENS)}</CustomerId><Culture>fr-FR</Culture><VersionAPI>1.0</VersionAPI></Context><OutputOptions><OutputFormat>10x15</OutputFormat><OutputType>PdfUrl</OutputType></OutputOptions><ShipmentsList><Shipment><OrderNo>TEST1</OrderNo><CustomerNo>TEST</CustomerNo><ParcelCount>1</ParcelCount><DeliveryMode Mode="24R" Location="FR-${relais}"/><CollectionMode Mode="${mode}" Location=""/><Parcels><Parcel><Content>Parfum</Content><Weight Value="1000" Unit="gr"/></Parcel></Parcels><DeliveryInstruction/><Sender>${adr('', 'Dupont Lea', '12 rue des Lilas', '0612345678', '')}</Sender><Recipient>${adr('Marc', 'Petit', '1 rue de la Paix', '', 'test@exemple.fr')}</Recipient></Shipment></ShipmentsList></ShipmentCreationRequest>`;
  const r = await fetch(url, {method: 'POST', headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}, body: corps});
  const rep = await r.text();
  const num = (rep.match(/ShipmentNumber="([^"]+)"/) || [])[1];
  const st = [...rep.matchAll(/<Status\b[^>]*Code="([^"]*)"[^>]*Message="([^"]*)"/g)].map((m) => `${m[2]} (code ${m[1]})`).join(' ; ');
  console.log(`API 2, collecte ${mode} : ${num ? `OK, expédition ${num}, étiquette ${(rep.match(/<Output>([^<]+)<\/Output>/) || [])[1] ? 'disponible' : 'absente'}` : st || `HTTP ${r.status}`}`);
}
