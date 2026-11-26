import {PageLegale} from '@/components/PageLegale';

export const metadata = {title: 'Obligations fiscales et sociales', description: 'Vendre ses parfums sur Respray : quand faut-il déclarer ses ventes, et ce que Respray transmet à l\'administration fiscale.'};

/* L'information que les plateformes doivent donner à leurs vendeurs (article 242 bis du code général des impôts), et
   la déclaration annuelle des vendeurs au-delà des seuils (directive européenne DAC7). */
export default function ObligationsFiscales() {
  return (
    <PageLegale
      surtitre="Vendeurs"
      titre="Obligations fiscales et sociales"
      intro={<p>Vendre quelques parfums de votre placard n'est en général pas imposable. Voici quand ça change, et ce que Respray transmet à l'administration, comme toutes les plateformes.</p>}
      sections={[
        {id: 'occasionnel', t: 'Vendre ses propres parfums, de temps en temps', c: <p>La vente occasionnelle de biens personnels d'occasion, que vous utilisiez vous-même, n'est en principe pas soumise à l'impôt sur le revenu ni aux cotisations sociales. Il n'y a rien à déclarer dans ce cas.</p>},
        {id: 'activite', t: 'Quand cela devient une activité', c: <p>Acheter des parfums pour les revendre, ou vendre de façon régulière pour en tirer un revenu, est une activité commerciale : les revenus doivent être déclarés, et une immatriculation (par exemple en micro-entreprise) est obligatoire. Cette activité n'est pas permise sur Respray, réservé aux particuliers qui vendent leurs propres parfums. Pour savoir où vous en êtes : impots.gouv.fr et urssaf.fr.</p>},
        {id: 'declaration', t: 'Ce que Respray transmet à l\'administration', c: <>
          <p>Comme toutes les plateformes en ligne, Respray déclare chaque année à l'administration fiscale les vendeurs qui, dans l'année civile, ont réalisé <strong>au moins 30 ventes</strong> ou <strong>au moins 2 000 €</strong> de ventes. Cette déclaration contient votre identité, votre adresse, votre numéro fiscal, le nombre de ventes et leur montant, et vous en recevez une copie.</p>
          <p>Si vous approchez de ces seuils, Respray vous demandera les informations nécessaires (date de naissance, adresse, numéro fiscal). Être déclaré ne signifie pas que vous devez de l'impôt : cela dépend de la nature de vos ventes, décrite plus haut.</p>
        </>},
        {id: 'recapitulatif', t: 'Votre récapitulatif', c: <p>Sur simple demande à contact@respray.fr, Respray vous envoie le récapitulatif de vos ventes d'une année (nombre et montant), à garder pour vos démarches.</p>},
      ]}
    />
  );
}
