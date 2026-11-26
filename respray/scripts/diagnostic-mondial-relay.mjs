/* Diagnostic Mondial Relay, à lancer sur le serveur : essaie la recherche de points relais puis la création d'une
   étiquette avec plusieurs modes de collecte, et affiche le code de réponse de chacun. Avec les paramètres de TEST
   (TTMRSDBX), rien n'est expédié ni facturé. Lit MR_ENSEIGNE et MR_CLE_PRIVEE dans l'environnement.
   Lancement : voir deploiement/GUIDE.md (étape 10). */
import {createHash} from 'node:crypto';

const ENS = process.env.MR_ENSEIGNE, CLE = process.env.MR_CLE_PRIVEE;
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

const essais = [['REL', 'FR', 'AUTO'], ['REL', 'FR', relais], ['CCC', '', ''], ['DRI', '', '']];
for (const [mode, pays, rel] of essais) {
  const champs = [['Enseigne', ENS], ['ModeCol', mode], ['ModeLiv', '24R'], ['NDossier', 'TEST1'], ['NClient', 'TEST'],
    ['Expe_Langage', 'FR'], ['Expe_Ad1', 'DUPONT LEA'], ['Expe_Ad2', ''], ['Expe_Ad3', '12 RUE DES LILAS'], ['Expe_Ad4', ''], ['Expe_Ville', 'PARIS'], ['Expe_CP', '75011'], ['Expe_Pays', 'FR'], ['Expe_Tel1', '0612345678'], ['Expe_Tel2', ''], ['Expe_Mail', ''],
    ['Dest_Langage', 'FR'], ['Dest_Ad1', 'PETIT MARC'], ['Dest_Ad2', ''], ['Dest_Ad3', '1 RUE DE LA PAIX'], ['Dest_Ad4', ''], ['Dest_Ville', 'PARIS'], ['Dest_CP', '75011'], ['Dest_Pays', 'FR'], ['Dest_Tel1', ''], ['Dest_Tel2', ''], ['Dest_Mail', ''],
    ['Poids', '1000'], ['Longueur', ''], ['Taille', ''], ['NbColis', '1'], ['CRT_Valeur', '0'], ['CRT_Devise', 'EUR'], ['Exp_Valeur', ''], ['Exp_Devise', ''],
    ['COL_Rel_Pays', pays], ['COL_Rel', rel], ['LIV_Rel_Pays', 'FR'], ['LIV_Rel', relais], ['TAvisage', ''], ['TReprise', ''], ['Montage', ''], ['TRDV', ''], ['Assurance', '0'], ['Instructions', '']];
  const x = await appel('WSI2_CreationEtiquette', champs);
  console.log(`Étiquette, collecte ${mode}${rel ? ` (${rel})` : ''} : code ${champ(x, 'STAT')}${champ(x, 'ExpeditionNum') ? `, expédition ${champ(x, 'ExpeditionNum')}` : ''}`);
}
