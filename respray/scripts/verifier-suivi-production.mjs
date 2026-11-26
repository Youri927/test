/* Le suivi Mondial Relay est-il actif sur le compte de PRODUCTION ? Demande le suivi d'un numéro d'expédition
   inexistant et la recherche de points relais : ni l'un ni l'autre ne crée ni ne facture quoi que ce soit.
   Réponse attendue si le suivi est actif : « colis inexistant » (code 94) ou « numéro invalide » (code 24), et pas
   « compte non activé » (code 95). Lancement : voir deploiement/GUIDE.md (étape 10). */
import {createHash} from 'node:crypto';

const ENS = process.env.E, CLE = process.env.K;
if (!ENS || !CLE) { console.log('Code enseigne ou clé manquant.'); process.exit(1); }
async function appel(methode, champs) {
  const sec = createHash('md5').update(champs.map(([, v]) => v).join('') + CLE, 'latin1').digest('hex').toUpperCase();
  const corps = champs.map(([k, v]) => `<${k}>${v}</${k}>`).join('') + `<Security>${sec}</Security>`;
  const xml = `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><${methode} xmlns="http://www.mondialrelay.fr/webservice/">${corps}</${methode}></soap:Body></soap:Envelope>`;
  const r = await fetch('https://api.mondialrelay.com/Web_Services.asmx', {method: 'POST', headers: {'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `"http://www.mondialrelay.fr/webservice/${methode}"`}, body: xml});
  return ((await r.text()).match(/<STAT>(\d+)<\/STAT>/) || [])[1] ?? '?';
}
const r = await appel('WSI4_PointRelais_Recherche', [['Enseigne', ENS], ['Pays', 'FR'], ['NumPointRelais', ''], ['Ville', ''], ['CP', '75011'], ['Latitude', ''], ['Longitude', ''], ['Taille', ''], ['Poids', '1000'], ['Action', '24R'], ['DelaiEnvoi', '0'], ['RayonRecherche', '20'], ['TypeActivite', ''], ['NACE', ''], ['NombreResultats', '1']]);
const s = await appel('WSI2_TracingColisDetaille', [['Enseigne', ENS], ['Expedition', '12345678'], ['Langue', 'FR']]);
const sens = {'0': 'OK', '94': 'colis inexistant : le suivi est ACTIF', '24': 'numéro invalide : le suivi est ACTIF', '95': 'compte non activé : le suivi n\'est PAS actif', '97': 'clé privée incorrecte', '1': 'code enseigne incorrect'};
console.log(`Production ${ENS}`);
console.log(`Recherche de points relais : code ${r} (${sens[r] ?? 'voir la documentation'})`);
console.log(`Suivi : code ${s} (${sens[s] ?? 'voir la documentation'})`);
