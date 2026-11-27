import 'server-only';
/* Les envois en point relais, par Mondial Relay (web service « WSI » : recherche de points relais, création
   d'expédition avec étiquette PDF, suivi). Tant que le contrat pro n'est pas signé (pas de MR_ENSEIGNE, ou
   ENVOIS_SIMULES=1), tout est simulé : points relais de démonstration, étiquette factice, arrivée à la main.

   Respray ne touche jamais les colis : l'étiquette est prépayée sur le compte Respray, le vendeur la colle et dépose
   le colis dans n'importe quel point relais (mode de collecte « REL »), livraison au point relais choisi par
   l'acheteur (« 24R »). L'adresse personnelle de l'acheteur n'est jamais demandée : le destinataire est son nom, au
   point relais. */
import {createHash, randomInt} from 'crypto';
import type {Relais} from '@/db/schema';

export const simule = () => process.env.ENVOIS_SIMULES === '1' || !process.env.MR_ENSEIGNE || !process.env.MR_CLE_PRIVEE;

const URL_API = 'https://api.mondialrelay.com/Web_Services.asmx';
// le mode de collecte : « REL », le vendeur dépose le colis dans le point relais de son choix (offre Start) ;
// « CCC », Mondial Relay vient chercher les colis chez l'expéditeur (contrat de collecte). Réglable sans toucher au code.
const MODE_COL = () => (process.env.MR_MODE_COLLECTE === 'CCC' ? 'CCC' : 'REL');
const POIDS = () => Number(process.env.MR_POIDS_GRAMMES) || 2000; // la recherche de points relais : ceux qui acceptent nos plus gros colis ; le poids de chaque colis vient de la taille (regles.ts)

/* ——— l'appel au web service ——— */
type Champs = [string, string][];
const echapper = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function appel(methode: string, champs: Champs): Promise<string> {
  // la signature : MD5, en majuscules, de toutes les valeurs dans l'ordre, puis de la clé privée
  const securite = createHash('md5').update(champs.map(([, v]) => v).join('') + process.env.MR_CLE_PRIVEE, 'latin1').digest('hex').toUpperCase();
  const corps = champs.map(([k, v]) => `<${k}>${echapper(v)}</${k}>`).join('') + `<Security>${securite}</Security>`;
  const xml = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><${methode} xmlns="http://www.mondialrelay.fr/webservice/">${corps}</${methode}></soap:Body></soap:Envelope>`;
  const r = await fetch(URL_API, {method: 'POST', headers: {'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"http://www.mondialrelay.fr/webservice/${methode}"`}, body: xml, signal: AbortSignal.timeout(20000)});
  if (!r.ok) throw new Error(`Mondial Relay : HTTP ${r.status}`);
  return r.text();
}
const champ = (xml: string, nom: string) => (xml.match(new RegExp(`<${nom}>([^<]*)</${nom}>`)) || [])[1]?.trim() ?? '';
const blocs = (xml: string, nom: string) => xml.match(new RegExp(`<${nom}>[\\s\\S]*?</${nom}>`, 'g')) || [];
const decoder = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;|&#39;/g, '\'').replace(/&quot;/g, '"');

/* les champs d'adresse de Mondial Relay : majuscules sans accents, caractères limités, longueur bornée */
const propre = (s: string, max = 32) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^0-9A-Z_\-'., /]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
// les villes : lettres, tiret, apostrophe et espace seulement ; l'e-mail : sans « + » ni caractères spéciaux, sinon rien
const ville = (s: string) => propre(s, 26).replace(/[^A-Z_\-' ]/g, ' ').replace(/\s+/g, ' ').trim();
const mail = (s: string) => (/^[\w\-.@]{3,70}$/.test(s) ? s : '');
const tel = (s: string) => {
  const t = s.replace(/[^\d+]/g, '').replace(/^\+33/, '0').replace(/^0033/, '0');
  return /^0\d{9}$/.test(t) ? t : '';
};

const STATUTS: Record<string, string> = {
  '1': 'enseigne invalide', '2': 'numéro d\'enseigne vide ou inexistant', '8': 'mot de passe ou signature invalide', '9': 'ville non reconnue',
  '10': 'type de collecte invalide', '12': 'type de livraison invalide', '20': 'poids du colis invalide', '24': 'numéro d\'expédition invalide',
  '30': 'adresse (L1) invalide', '31': 'adresse (L2) invalide', '33': 'adresse (L3) invalide', '34': 'adresse (L4) invalide', '35': 'ville invalide',
  '36': 'code postal invalide', '37': 'pays invalide', '38': 'numéro de téléphone invalide', '39': 'adresse e-mail invalide', '40': 'paramètres manquants',
  '44': 'point relais de livraison invalide', '45': 'point relais de livraison inactif', '80': 'colis enregistré', '81': 'colis en cours d\'acheminement',
  '82': 'colis livré', '83': 'anomalie', '94': 'colis inexistant', '95': 'compte enseigne non activé', '97': 'clé de sécurité invalide', '99': 'erreur du service Mondial Relay',
};
const erreur = (stat: string) => new Error(`Mondial Relay : ${STATUTS[stat] ?? 'erreur'} (code ${stat})`);

/* ——— les points relais près d'un code postal ——— */
const RUES = ['rue de la République', 'avenue Jean-Jaurès', 'rue Victor-Hugo', 'boulevard Gambetta', 'place de la Mairie', 'rue Pasteur'];
const COMMERCES = ['Tabac Presse du Centre', 'Pressing des Lilas', 'Carrefour City', 'Librairie du Marché', 'Fleuriste Les Jardins', 'Cordonnerie Express'];

export async function relaisPres(cp: string): Promise<Relais[]> {
  if (!/^\d{5}$/.test(cp)) return [];
  if (simule()) {
    const n = Number(cp);
    return [0, 1, 2].map((i) => ({id: `${cp}-${i + 1}`, nom: COMMERCES[(n + i * 7) % COMMERCES.length], adresse: `${((n >> i) % 120) + 1} ${RUES[(n + i * 3) % RUES.length]}`, cp, ville: 'Ville (simulation)'}));
  }
  const xml = await appel('WSI4_PointRelais_Recherche', [
    ['Enseigne', process.env.MR_ENSEIGNE!], ['Pays', 'FR'], ['NumPointRelais', ''], ['Ville', ''], ['CP', cp], ['Latitude', ''], ['Longitude', ''],
    ['Taille', ''], ['Poids', String(POIDS())], ['Action', '24R'], ['DelaiEnvoi', '0'], ['RayonRecherche', '20'], ['TypeActivite', ''], ['NACE', ''], ['NombreResultats', '7'],
  ]);
  const stat = champ(xml, 'STAT');
  if (stat !== '0') throw erreur(stat);
  return blocs(xml, 'PointRelais_Details').map((b) => ({
    id: champ(b, 'Num'),
    nom: decoder(champ(b, 'LgAdr1')),
    adresse: decoder([champ(b, 'LgAdr3'), champ(b, 'LgAdr4')].filter(Boolean).join(', ')),
    cp: champ(b, 'CP'),
    ville: decoder(champ(b, 'Ville')),
  })).filter((r) => r.id);
}

/* ——— l'étiquette ——— */
export type Expediteur = {nom: string; rue: string; cp: string; ville: string; tel: string};
export type Destinataire = {nom: string; email: string; relais: Relais};

export const expediteurValide = (e: Partial<Expediteur> | null | undefined): e is Expediteur =>
  Boolean(e && propre(e.nom || '').length >= 2 && propre(e.rue || '').length >= 2 && /^\d{5}$/.test(e.cp || '') && propre(e.ville || '').length >= 2 && tel(e.tel || ''));

/* simulée : un numéro factice, sans PDF */
export const etiquetteSimulee = () => `MR${randomInt(10_000_000, 99_999_999)}-SIMU`;

/* l'expédition chez Mondial Relay, par l'« API 2 » (API Shipment, XML) : c'est elle qui crée les étiquettes pour les
   comptes récents ; l'ancien web service n'y sert plus qu'à chercher les points relais et à suivre les colis.
   Identifiants : MR_API2_LOGIN et MR_API2_MOT_DE_PASSE (Connect, Paramétrage des API, bloc API 2). Le code enseigne de
   test (TTMRSDBX) passe par le bac à sable : rien n'est expédié ni facturé. */
const urlApi2 = () => (process.env.MR_ENSEIGNE === 'TTMRSDBX' ? 'https://connect-api-sandbox.mondialrelay.com/api/shipment' : 'https://connect-api.mondialrelay.com/api/shipment');
const sans = (s: string, max: number) => echapper(s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^0-9A-Za-z_\-'., /@]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max));
const adresse = (a: {prenom?: string; nom: string; rue: string; cp: string; ville: string; tel?: string; email?: string}) =>
  `<Address><Title/><Firstname>${sans(a.prenom ?? '', 30)}</Firstname><Lastname>${sans(a.nom, 30)}</Lastname><Streetname>${sans(a.rue, 40)}</Streetname><HouseNo/><CountryCode>FR</CountryCode><PostCode>${a.cp}</PostCode><City>${sans(a.ville, 30)}</City><AddressAdd1/><AddressAdd2/><AddressAdd3/><PhoneNo/><MobileNo>${tel(a.tel ?? '')}</MobileNo><Email>${mail(a.email ?? '')}</Email></Address>`;

export async function creerExpedition(commandeId: number, exp: Expediteur, dest: Destinataire, assuree: boolean, poids = POIDS()): Promise<{numero: string; pdf: string}> {
  const [prenomDest, ...nomDest] = dest.nom.split(' ');
  const corps = `<?xml version="1.0" encoding="utf-8"?>
<ShipmentCreationRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.example.org/Request">
<Context><Login>${echapper(process.env.MR_API2_LOGIN || '')}</Login><Password>${echapper(process.env.MR_API2_MOT_DE_PASSE || '')}</Password><CustomerId>${echapper(process.env.MR_ENSEIGNE!)}</CustomerId><Culture>fr-FR</Culture><VersionAPI>1.0</VersionAPI></Context>
<OutputOptions><OutputFormat>10x15</OutputFormat><OutputType>PdfUrl</OutputType></OutputOptions>
<ShipmentsList><Shipment>
<OrderNo>RESPRAY${commandeId}</OrderNo><CustomerNo>C${commandeId}</CustomerNo><ParcelCount>1</ParcelCount>
<DeliveryMode Mode="24R" Location="FR-${dest.relais.id}"/>
<CollectionMode Mode="${MODE_COL()}" Location=""/>
<Parcels><Parcel><Content>Parfum</Content><Weight Value="${poids}" Unit="gr"/></Parcel></Parcels>
<DeliveryInstruction/>
<Sender>${adresse({nom: exp.nom, rue: exp.rue, cp: exp.cp, ville: exp.ville, tel: exp.tel})}</Sender>
<Recipient>${adresse({prenom: prenomDest, nom: nomDest.join(' ') || prenomDest, rue: dest.relais.adresse, cp: dest.relais.cp, ville: dest.relais.ville, email: dest.email})}</Recipient>
</Shipment></ShipmentsList>
</ShipmentCreationRequest>`;
  void assuree; // l'assurance Mondial Relay se règle dans le contrat ; Respray rembourse lui-même l'acheteur en cas de perte
  const r = await fetch(urlApi2(), {method: 'POST', headers: {'Content-Type': 'text/xml', Accept: 'application/xml'}, body: corps, signal: AbortSignal.timeout(20000)});
  const xml = await r.text();
  const numero = (xml.match(/ShipmentNumber="([^"]+)"/) || [])[1];
  const pdf = decoder((xml.match(/<Output>([^<]+)<\/Output>/) || [])[1] ?? '');
  if (!numero || !pdf) {
    const st = [...xml.matchAll(/<Status\b[^>]*Code="([^"]*)"[^>]*Message="([^"]*)"/g)].map((m) => `${m[2]} (code ${m[1]})`).join(' ; ');
    throw new Error(`Mondial Relay : ${st || `réponse inattendue (HTTP ${r.status})`}`);
  }
  return {numero, pdf};
}

/* ——— le suivi ——— */
export type Suivi = 'attente' | 'depose' | 'arrive' | 'retire' | 'anomalie';

export async function suivre(numero: string): Promise<Suivi> {
  const xml = await appel('WSI2_TracingColisDetaille', [['Enseigne', process.env.MR_ENSEIGNE!], ['Expedition', numero], ['Langue', 'FR']]);
  const stat = champ(xml, 'STAT');
  if (stat === '80') return 'attente';
  if (stat === '82') return 'retire';
  if (stat === '83') return 'anomalie';
  if (stat !== '81') throw erreur(stat);
  // en route : arrivé au point relais si un des événements le dit
  const libelles = blocs(xml, 'Libelle').map((b) => decoder(b.replace(/<\/?Libelle>/g, '')));
  return libelles.some((l) => /disponible|mis à disposition|mise à disposition|arriv[ée]+ au point/i.test(l)) ? 'arrive' : 'depose';
}
