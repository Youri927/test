import {demo} from '@/lib/demo';
import Link from 'next/link';
import {PHOTOS, ENVOI, ENVOI_GRAND, ASSURANCE, SEUIL_ASSURANCE, eur2} from '@/lib/regles';
import {PhotoDemo, Ico} from '@/components/Visuels';
import {Parcours, Verification, Simulateur} from '@/components/Fonctionnement';

export const metadata = {
  title: 'Comment ça marche',
  description: 'Vendre et acheter du parfum de seconde main sur Respray : 6 photos, une vérification par l\'équipe, un paiement bloqué et 7 jours pour vérifier. Le vendeur ne paie rien.',
};

const POURQUOI: Record<string, string> = {
  face: 'Forme du flacon, du bouchon et de l\'étiquette',
  dessous: 'Le code lot existe et suit le format de la marque',
  niveau: 'Le niveau annoncé est le bon',
  dessus: 'Le spray et le sertissage d\'origine',
  tige: 'La tige n\'a pas été forcée ni recollée',
  preuve: 'Le vendeur a le flacon entre les mains',
  boite: 'Le même code lot que sur le flacon',
  ticket: 'La provenance',
};
const st = (o: Record<string, string | number>) => o as React.CSSProperties;

const FAQ: [string, string][] = [
  ['Un parfum entamé, c\'est hygiénique ?', 'Oui. Le parfum ne touche jamais la peau dans le flacon : il sort par un vaporisateur serti, qu\'on ne peut pas ouvrir sans le casser.'],
  ['Un parfum ancien est-il encore bon ?', 'Un parfum ne se périme pas, il évolue : les notes de tête s\'estompent les premières. Bien rangé, à l\'abri de la lumière et de la chaleur, il se garde des années. Le vendeur dit comment il l\'a rangé, et le code lot donne souvent l\'année de fabrication.'],
  ['Et si quelqu\'un a dilué son parfum ?', 'Un flacon serti ne s\'ouvre pas sans laisser de traces : c\'est pour ça qu\'on demande la bague et la tige en photo. À la réception, vous avez 7 jours pour comparer la couleur, l\'odeur et la tenue. Un parfum dilué, c\'est remboursé en entier, et le vendeur exclu.'],
  ['Mon flacon n\'est pas transparent : comment montrer le niveau ?', 'Dans une pièce peu éclairée, collez la lampe allumée d\'un téléphone contre le dos du flacon. La lumière traverse le verre et la limite du parfum se voit nettement. Prenez la photo de face, à hauteur du niveau.'],
  ['Pourquoi enlever le bouton spray pour la photo ?', 'Pour voir la tige. Un flacon qui a été ouvert pour être rempli avec autre chose laisse souvent des traces : tige tordue, colle, bague abîmée.'],
  ['Ma maison n\'est pas dans la liste, je fais comment ?', 'Choisissez « Ma maison n\'est pas dans la liste » et écrivez son nom. On vérifie l\'orthographe et on l\'ajoute à la liste : les vendeurs suivants pourront la choisir.'],
  ['Combien de temps prend la vérification ?', 'En général quelques heures. Si une photo manque ou ne se lit pas, on vous dit laquelle refaire. Nos chiffres sont publics, page « Nos chiffres de vérification ».'],
  ['Et si le colis se perd ?', `Il est suivi : s'il n'arrive pas, vous êtes remboursé en entier. Pour un parfum de ${eur2(SEUIL_ASSURANCE)} ou plus, l'envoi assuré (${eur2(ASSURANCE)}) couvre en plus sa vraie valeur.`],
  ['Le vendeur ne dépose pas le colis ?', 'Il a 5 jours. Passé ce délai, la vente est annulée et vous êtes remboursé automatiquement, sans rien faire.'],
  ['Les coffrets et les échantillons ?', 'Un coffret est accepté s\'il est neuf, scellé et sous blister. Un échantillon acheté aussi, avec son volume exact. Un échantillon offert ou marqué « Ne peut être vendu » ne l\'est pas.'],
  ['Je peux négocier le prix ?', 'Oui : « Faire une offre » sur l\'annonce, à partir de 60 % du prix. Le vendeur a 48 heures pour accepter, refuser ou vous faire une contre-offre.'],
  ['Quand le vendeur est-il payé ?', 'Une fois la vente confirmée (par l\'acheteur, ou automatiquement 7 jours après la livraison), elle est versée le lundi suivant, avec ses autres ventes de la semaine, en un seul virement. L\'argent arrive sur son compte bancaire sous quelques jours.'],
];

/* « Comment ça marche », reprise du prototype et alignée sur ce que fait le site : le parcours animé, les 6 photos, la
   vérification en 3D, les 7 jours, le remboursement, les frais, ce qui est interdit, les questions. */
export default function CommentCaMarche() {
  return (
    <div className="fonctionnement">
      <section className="fn-hero env">
        <p className="surtitre">Comment ça marche</p>
        <h1>Entre particuliers, avec quelqu&apos;un qui vérifie.</h1>
        <p className="chapo">Respray met en relation ceux qui vendent et ceux qui achètent. On vérifie chaque annonce avant de la publier, et on garde l&apos;argent de l&apos;acheteur jusqu&apos;à ce qu&apos;il ait vérifié le parfum.</p>
      </section>
      <section className="env" id="histoire"><Parcours /></section>

      <section className="fn-section env" id="photos-obligatoires">
        <div className="fn-tete" data-revele><p className="surtitre">Les photos</p><h2 className="grand-titre">6 photos obligatoires, toujours les mêmes.</h2><p className="chapo">Elles nous permettent de vérifier le parfum sans l&apos;avoir entre les mains. La boîte et le ticket s&apos;ajoutent si vous les avez.</p></div>
        <div className="fn-photos">
          {PHOTOS.map((x, i) => (
            <figure key={x.k} className={`fn-photo ${x.obl ? '' : 'facultative'}`} data-revele style={st({'--i': i})}>
              <PhotoDemo vue={x.k} />
              <figcaption><strong>{x.t}</strong><span>{POURQUOI[x.k]}</span>{x.obl ? null : <em>Facultative</em>}</figcaption>
            </figure>
          ))}
        </div>
        <div data-revele>
          <aside className="astuce">
            <img className="astuce-img" src={demo('contrejour.webp')} alt="Un flacon noir opaque, la lampe d'un téléphone collée derrière : le parfum fait une zone sombre et la limite du niveau se voit." width={600} height={750} loading="lazy" />
            <div><p className="surtitre">Flacon opaque ?</p><p className="astuce-titre">Le niveau se voit à contre-jour.</p><p>Dans une pièce peu éclairée, allumez la lampe d&apos;un téléphone et collez-la contre le dos du flacon. La lumière traverse le verre : le parfum fait une zone plus sombre, et la limite se voit nettement. Prenez la photo de face, à hauteur du niveau.</p></div>
          </aside>
        </div>
        <p className="aide">Les photos de cette page sont des exemples, rendus en 3D.</p>
      </section>

      <Verification />

      <section className="fn-section env">
        <div className="fn-tete" data-revele><p className="surtitre">Après l&apos;achat</p><h2 className="grand-titre">Une semaine entière pour vérifier.</h2></div>
        <div className="sept" data-revele data-anime>
          <div className="sept-piste"><span className="sept-rempli" />{Array.from({length: 8}, (_, i) => <span key={i} className="sept-jour" style={st({'--i': i})}><b />J{i}</span>)}</div>
          <div className="sept-cartes">
            <article><h3><Ico n="check" />Vous confirmez</h3><p>Le vendeur est payé tout de suite.</p></article>
            <article><h3><Ico n="cadenas" />Vous ne faites rien</h3><p>Au bout de 7 jours, la vente est conclue et le vendeur est payé.</p></article>
            <article><h3><Ico n="retour" />Vous signalez un problème</h3><p>L&apos;argent reste bloqué le temps qu&apos;on regarde.</p></article>
          </div>
        </div>
      </section>

      <section className="fn-section env">
        <div className="fn-tete" data-revele><p className="surtitre">Si ce n&apos;est pas conforme</p><h2 className="grand-titre">Remboursé en entier, livraison comprise.</h2><p className="chapo">Contrefaçon, niveau plus bas qu&apos;annoncé, flacon abîmé, mauvais parfum.</p></div>
        <ol className="flux" data-revele>
          <li style={st({'--i': 0})}><span><Ico n="photo" /></span><strong>Vous signalez</strong><p>Depuis votre commande, dans les 7 jours. L&apos;équipe compare avec les photos vérifiées.</p></li>
          <li style={st({'--i': 1})}><span><Ico n="boite" /></span><strong>Vous renvoyez, si on vous le demande</strong><p>Avec l&apos;étiquette retour fournie.</p></li>
          <li style={st({'--i': 2})}><span><Ico n="euro" /></span><strong>Vous êtes remboursé</strong><p>Prix, protection et livraison. Une contrefaçon, c&apos;est le vendeur exclu.</p></li>
        </ol>
        <p className="aide fn-note">Un parfum conforme qui ne vous plaît pas n&apos;est pas remboursé : vous pouvez le remettre en vente sur Respray.</p>
      </section>

      <section className="fn-section env fn-frais">
        <div data-revele><p className="surtitre">Les frais</p><h2 className="grand-titre">Le vendeur ne paie rien.</h2><p className="chapo">La protection payée par l&apos;acheteur finance ce qui rend la vente sûre : la vérification de chaque annonce par une personne, le paiement bloqué, le service client et les remboursements.</p>
          <table className="frais"><tbody>
            <tr><th scope="row">Vendre</th><td>Gratuit, sans commission</td></tr>
            <tr><th scope="row">Protection acheteur</th><td>8 % du prix + 1,50 €</td></tr>
            <tr><th scope="row">Envoi suivi en point relais</th><td>{eur2(ENVOI)}<small> · {eur2(ENVOI_GRAND)} au-delà de 125 ml ou pour un coffret</small></td></tr>
            <tr><th scope="row">Remise en main propre</th><td>Gratuite</td></tr>
            <tr><th scope="row">Envoi assuré à la valeur réelle</th><td>{eur2(ASSURANCE)}, en option à partir de {eur2(SEUIL_ASSURANCE)}</td></tr>
            <tr><th scope="row">Mettre une annonce en avant</th><td>1,99 € (3 jours) ou 4,99 € (7 jours), si le vendeur le veut</td></tr>
          </tbody></table></div>
        <Simulateur />
      </section>

      <section className="fn-section env">
        <div className="fn-tete" data-revele><p className="surtitre">Interdit sur Respray</p><h2 className="grand-titre">Ce qu&apos;on refuse, toujours.</h2></div>
        <ul className="interdits" data-revele>{['Les contrefaçons et les « dupes »', 'Les testeurs', 'Les échantillons offerts', 'Les parfums transvasés, dilués, et les décants', 'Les flacons dont le spray a été ouvert ou recollé'].map((t, i) => <li key={t} style={st({'--i': i})}><Ico n="croix" />{t}</li>)}</ul>
        <p className="aide"><Link className="lien-souligne" href="/regles">Toutes les règles des annonces</Link></p>
      </section>

      <section className="fn-section env faq">
        <div className="fn-tete" data-revele><p className="surtitre">Questions</p><h2 className="grand-titre">Ce qu&apos;on nous demande.</h2></div>
        {FAQ.map(([q, r]) => <details key={q}><summary>{q}</summary><p>{r}</p></details>)}
      </section>

      <section className="fn-fin env" data-revele>
        <h2>On commence ?</h2>
        <div className="boutons"><Link className="btn btn-noir btn-large" href="/vendre">Vendre un parfum</Link><Link className="btn btn-large" href="/parfums">Voir les parfums</Link></div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, r]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: r}}))}).replace(/</g, '\\u003c')}} />
    </div>
  );
}
