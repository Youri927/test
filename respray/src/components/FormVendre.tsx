'use client';
/* Le formulaire de vente : six blocs, et à droite l'annonce telle qu'elle sera, qui se remplit au fil des réponses.
   Les photos sont réduites dans le navigateur (2 000 px de côté au plus) avant l'envoi : l'envoi reste rapide, même
   en 4G. */
import {useActionState, useMemo, useState, startTransition} from 'react';
import {envoyerVente, type EtatVente} from '@/app/actions/vendre';
import {PHOTOS, CONCENTRATIONS, GROUPES_FAMILLES, FORMATS, LIEUX, DEFAUTS, BOITES, MISES_EN_AVANT, annees, eur, eur2, normal} from '@/lib/regles';

type Parfum = {id: number; nom: string; conc: string; genre: string; famille: string; notes: string; formats: {ml: number}[]};
type Maison = {id: number; nom: string; parfums: Parfum[]};

async function reduire(f: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return f; // HEIC : envoyé tel quel
  const img = await createImageBitmap(f).catch(() => null);
  if (!img) return f;
  const k = Math.min(1, 2000 / Math.max(img.width, img.height));
  if (k === 1 && f.size < 2.5e6) return f;
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * k);
  c.height = Math.round(img.height * k);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  const blob: Blob | null = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
  return blob ? new File([blob], f.name.replace(/\.\w+$/, '') + '.jpg', {type: 'image/jpeg'}) : f;
}

const Segment = ({nom, val, choix, set}: {nom: string; val: string; choix: readonly (readonly [string, string])[]; set: (v: string) => void}) => (
  <div className="segment" role="radiogroup">
    {choix.map(([v, l]) => (
      <label className="choix" key={v}>
        <input type="radio" name={nom} value={v} checked={val === v} onChange={() => set(v)} /> {l}
      </label>
    ))}
  </div>
);

export function FormVendre({maisons, pseudo, prix, credits = 0}: {maisons: Maison[]; pseudo: string; prix: Record<number, number[]>; credits?: number}) {
  const [etat, agir, enCours] = useActionState<EtatVente, FormData>(envoyerVente, {});
  const [v, setV] = useState({
    maisonId: '', maisonAutre: '', parfumId: '', parfumAutre: '', conc: '', genre: '', format: 'flacon', ml: '', etat: 'entame', niveau: 80, visible: '',
    boite: '', annee: '', lieu: '', lumiere: '', chaleur: '', lot: '', lotIllisible: false, description: '', prix: '', mainPropre: false, ville: '', miseEnAvant: '', engagement: false,
  });
  const [familles, setFamilles] = useState<string[]>([]);
  const [defauts, setDefauts] = useState<string[]>([]);
  const [apercus, setApercus] = useState<Record<string, string>>({});
  const set = (k: keyof typeof v) => (x: string | number | boolean) => setV((o) => ({...o, [k]: x}));

  const autreMaison = v.maisonId === 'autre';
  const maison = maisons.find((m) => String(m.id) === v.maisonId);
  const parfum = maison?.parfums.find((p) => String(p.id) === v.parfumId);
  const parfumLibre = autreMaison || (maison && (!maison.parfums.length || v.parfumId === 'autre'));
  const pret = !!(parfum || parfumLibre);
  const nomMaison = maison?.nom || (autreMaison ? v.maisonAutre : '');
  const nomParfum = parfum?.nom || (parfumLibre ? v.parfumAutre : '');
  const ml = Number(String(v.ml).replace(',', '.')) || 0;
  const prixN = Number(String(v.prix).replace(',', '.')) || 0;
  const conc = parfum?.conc || v.conc;
  const ressemble = useMemo(() => {
    const t = normal(v.maisonAutre.trim());
    if (t.length < 3) return null;
    return maisons.find((m) => normal(m.nom) === t || normal(m.nom).startsWith(t) || (t.length > 4 && normal(m.nom).includes(t)));
  }, [v.maisonAutre, maisons]);
  const blocs: [string, boolean][] = [
    ['Le parfum', !!(nomMaison && nomParfum && (parfum || (v.conc && v.genre)))],
    ['Le flacon', ml > 0 && (v.etat === 'neuf' || !!v.visible) && !!v.boite],
    ['Son histoire', !!(v.annee && v.lieu && v.lumiere && v.chaleur)],
    ['Photos et code lot', PHOTOS.every((p) => !p.obl || apercus[p.k]) && !!(v.lot.trim() || v.lotIllisible)],
    ['Prix et remise', prixN >= 3 && (!v.mainPropre || !!v.ville.trim())],
    ['Engagement', v.engagement],
  ];
  const fourchette = parfum && prix[parfum.id]?.length ? [Math.min(...prix[parfum.id]), Math.max(...prix[parfum.id])] : null;

  async function choisirPhoto(k: string, input: HTMLInputElement) {
    const f = input.files?.[0];
    if (!f) return;
    const r = await reduire(f);
    if (r !== f) {
      const dt = new DataTransfer();
      dt.items.add(r);
      input.files = dt.files;
    }
    setApercus((o) => ({...o, [k]: URL.createObjectURL(r)}));
  }
  const coche = (liste: string[], setL: (l: string[]) => void, x: string) => setL(liste.includes(x) ? liste.filter((y) => y !== x) : [...liste, x]);

  return (
    <div className="vendre-grille">
      {/* envoi à la main : avec action={…}, React vide le formulaire après une erreur, photos comprises */}
      <form
        className="formulaire"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(() => agir(fd));
        }}
      >
        <section className="bloc-form">
          <h2 className="h2"><span className="bloc-n">1</span>Le parfum</h2>
          <label htmlFor="maison">Maison</label>
          <select id="maison" name="maisonId" className="champ" value={v.maisonId} onChange={(e) => setV((o) => ({...o, maisonId: e.target.value, parfumId: '', ml: ''}))} required>
            <option value="">Choisir une maison</option>
            {maisons.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            <option value="autre">Ma maison n'est pas dans la liste</option>
          </select>
          {autreMaison ? (
            <>
              <label htmlFor="maison-autre">Nom de la maison</label>
              <input id="maison-autre" name="maisonAutre" className="champ" value={v.maisonAutre} onChange={(e) => set('maisonAutre')(e.target.value)} placeholder="ex. Maison Crivelli" autoComplete="off" />
              {ressemble ? (
                <p className="p-ressemble">Vouliez-vous dire <strong>{ressemble.nom}</strong> ? <button type="button" className="btn btn-petit" onClick={() => setV((o) => ({...o, maisonId: String(ressemble.id), maisonAutre: ''}))}>Oui, la choisir</button></p>
              ) : (
                <p className="aide">Elle sera proposée à l'équipe, qui vérifie l'orthographe et l'ajoute à la liste. Votre annonce est vérifiée en même temps.</p>
              )}
            </>
          ) : null}
          {maison && maison.parfums.length ? (
            <>
              <label htmlFor="parfum">Parfum</label>
              <select id="parfum" name="parfumId" className="champ" value={v.parfumId} onChange={(e) => setV((o) => ({...o, parfumId: e.target.value, ml: ''}))}>
                <option value="">Choisir un parfum</option>
                {maison.parfums.map((p) => <option key={p.id} value={p.id}>{p.nom}{p.conc ? ` (${p.conc})` : ''}</option>)}
                <option value="autre">Mon parfum n'est pas dans la liste</option>
              </select>
            </>
          ) : null}
          {parfum ? (
            <div className="fiche-auto">
              <p className="surtitre">Rempli d'après le catalogue</p>
              <dl>
                <div><dt>Concentration</dt><dd>{parfum.conc}</dd></div>
                <div><dt>Pour</dt><dd>{parfum.genre}</dd></div>
                <div><dt>Famille</dt><dd>{parfum.famille}</dd></div>
                <div><dt>Notes</dt><dd>{parfum.notes}</dd></div>
              </dl>
            </div>
          ) : null}
          {parfumLibre ? (
            <>
              <label htmlFor="parfum-autre">Nom du parfum</label>
              <input id="parfum-autre" name="parfumAutre" className="champ" value={v.parfumAutre} onChange={(e) => set('parfumAutre')(e.target.value)} placeholder="ex. Tobacco Mandarin" autoComplete="off" />
              <fieldset><legend>Concentration</legend><Segment nom="conc" val={v.conc} choix={CONCENTRATIONS.map((c) => [c, c])} set={set('conc')} /></fieldset>
              <fieldset><legend>Pour</legend><Segment nom="genre" val={v.genre} choix={[['Femme', 'Femme'], ['Homme', 'Homme'], ['Mixte', 'Mixte']]} set={set('genre')} /></fieldset>
              <fieldset>
                <legend>Son caractère <small>une ou deux familles, facultatif</small></legend>
                <div className="groupes-familles">
                  {GROUPES_FAMILLES.map(([g, cl, fs]) => (
                    <div key={g} className={cl}>
                      <p className="groupe-titre">{g}</p>
                      <div className="coches">{fs.map(([f, d]) => (
                        <label className="coche" key={f}><input type="checkbox" name="familles" value={f} checked={familles.includes(f)} onChange={() => coche(familles, setFamilles, f)} /><span>{f}<small>{d}</small></span></label>
                      ))}</div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}
        </section>

        {pret ? (
          <>
            <section className="bloc-form">
              <h2 className="h2"><span className="bloc-n">2</span>Le flacon</h2>
              <fieldset><legend>Format</legend><Segment nom="format" val={v.format} choix={FORMATS} set={(x) => setV((o) => ({...o, format: x, ml: '', etat: x === 'coffret' ? 'neuf' : o.etat}))} /></fieldset>
              {v.format === 'coffret' ? <p className="aide">Un coffret est accepté s'il est neuf, scellé et sous blister.</p> : v.format === 'echantillon' ? <p className="aide">Un échantillon acheté, oui ; un échantillon offert ou marqué « Ne peut être vendu », non.</p> : null}
              <label htmlFor="ml">Contenance</label>
              {parfum && v.format === 'flacon' && parfum.formats.length ? (
                <select id="ml" name="ml" className="champ" value={v.ml} onChange={(e) => set('ml')(e.target.value)}>
                  <option value="">Choisir</option>
                  {parfum.formats.map((f) => <option key={f.ml} value={f.ml}>{f.ml} ml</option>)}
                </select>
              ) : (
                <div className="champ-prix"><input id="ml" name="ml" className="champ" inputMode="decimal" value={v.ml} onChange={(e) => set('ml')(e.target.value)} placeholder="100" /><span>ml</span></div>
              )}
              <fieldset><legend>État</legend><Segment nom="etat" val={v.etat} choix={[['neuf', 'Neuf, jamais ouvert'], ['entame', 'Déjà utilisé']]} set={set('etat')} /></fieldset>
              {v.etat === 'entame' ? (
                <>
                  <label htmlFor="niveau">Il reste environ <output>{v.niveau} %</output></label>
                  <input id="niveau" name="niveau" type="range" min={5} max={100} step={5} value={v.niveau} onChange={(e) => set('niveau')(+e.target.value)} />
                  <p className="aide">Le niveau exact, pas une tranche : l'équipe le compare à la photo du niveau.</p>
                  <fieldset><legend>Le parfum se voit-il à travers le flacon ?</legend><Segment nom="visible" val={v.visible} choix={[['oui', 'Oui'], ['opaque', 'Non, le flacon est opaque']]} set={set('visible')} /></fieldset>
                  {v.visible === 'opaque' ? <p className="note-ajout">Flacon opaque : dans une pièce peu éclairée, collez la lampe allumée d'un téléphone contre le dos du flacon. La limite du parfum se voit nettement ; prenez la photo du niveau comme ça.</p> : null}
                  <fieldset>
                    <legend>Petits défauts <small>facultatif</small></legend>
                    <div className="coches">{DEFAUTS.map((x) => (
                      <label className="coche" key={x}><input type="checkbox" name="defauts" value={x} checked={defauts.includes(x)} onChange={() => coche(defauts, setDefauts, x)} /><span>{x}</span></label>
                    ))}</div>
                  </fieldset>
                </>
              ) : <input type="hidden" name="niveau" value={100} />}
              <fieldset><legend>Et sa boîte ?</legend><Segment nom="boite" val={v.boite} choix={BOITES} set={set('boite')} /></fieldset>
            </section>

            <section className="bloc-form">
              <h2 className="h2"><span className="bloc-n">3</span>Son histoire</h2>
              <div className="ligne-champs">
                <div><label htmlFor="annee">Acheté en</label><select id="annee" name="annee" className="champ" value={v.annee} onChange={(e) => set('annee')(e.target.value)}><option value="">Choisir</option>{annees().map((x) => <option key={x}>{x}</option>)}</select></div>
                <div><label htmlFor="lieu">Où</label><select id="lieu" name="lieu" className="champ" value={v.lieu} onChange={(e) => set('lieu')(e.target.value)}><option value="">Choisir</option>{LIEUX.map((x) => <option key={x}>{x}</option>)}</select></div>
              </div>
              <fieldset><legend>Rangé à l'abri de la lumière ?</legend><Segment nom="lumiere" val={v.lumiere} choix={[['abri', 'Oui, dans un placard ou sa boîte'], ['expose', 'Non, à la lumière']]} set={set('lumiere')} /></fieldset>
              <fieldset><legend>Et de la chaleur ?</legend><Segment nom="chaleur" val={v.chaleur} choix={[['abri', 'Oui'], ['expose', 'Non (salle de bain, près d\'un radiateur…)']]} set={set('chaleur')} /></fieldset>
              <p className="aide">La lumière et la chaleur abîment un parfum : l'acheteur le saura avant d'acheter, c'est ce qui le rassure.</p>
              <label htmlFor="description">Description <small className="facultatif">facultatif</small></label>
              <textarea id="description" name="description" className="champ" rows={3} value={v.description} onChange={(e) => set('description')(e.target.value)} placeholder="Pourquoi vous le vendez, combien de fois il a été porté, ce que l'acheteur doit savoir…" />
            </section>

            <section className="bloc-form">
              <h2 className="h2"><span className="bloc-n">4</span>Photos et code lot</h2>
              <p className="aide">Elles nous permettent de vérifier votre parfum avant de publier l'annonce. Les 6 premières sont obligatoires. Sur la photo preuve, écrivez <strong>@{pseudo}</strong> et la date du jour.</p>
              <div className="photos">
                {PHOTOS.map((p) => (
                  <label className={`photo ${apercus[p.k] ? 'faite' : ''}`} key={p.k}>
                    <input className="vh" type="file" name={'photo_' + p.k} accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(e) => choisirPhoto(p.k, e.currentTarget)} />
                    <span className="photo-cadre">{apercus[p.k] ? <img src={apercus[p.k]} alt="" /> : <span className="photo-plus">+</span>}</span>
                    <span className="photo-txt"><strong>{p.t}{p.obl ? '' : ' '}{p.obl ? null : <em>facultatif</em>}</strong><small>{p.d}</small></span>
                  </label>
                ))}
              </div>
              <label htmlFor="lot">Le code lot, tel qu'on le lit sur la photo du dessous</label>
              <input id="lot" name="lot" className="champ" value={v.lot} onChange={(e) => set('lot')(e.target.value)} placeholder="ex. 3A21" autoComplete="off" disabled={v.lotIllisible} />
              <p className="aide">Gravé ou imprimé sous le flacon, et sur la boîte (souvent à côté du code-barres).</p>
              <label className="choix"><input type="checkbox" name="lotIllisible" checked={v.lotIllisible} onChange={(e) => set('lotIllisible')(e.target.checked)} /> Il est effacé ou illisible</label>
            </section>

            <section className="bloc-form">
              <h2 className="h2"><span className="bloc-n">5</span>Prix et remise</h2>
              <label htmlFor="prix">Votre prix</label>
              <div className="champ-prix"><input id="prix" name="prix" className="champ" inputMode="decimal" value={v.prix} onChange={(e) => set('prix')(e.target.value)} placeholder="0" /><span>€</span></div>
              {fourchette ? <p className="aide">Annonces actuelles de ce parfum : de {eur(fourchette[0])} à {eur(fourchette[1])}.</p> : null}
              <p className="aide">{prixN >= 3 ? `Vous recevrez ${eur2(prixN)} : aucune commission.` : 'Vous recevez la totalité du prix : aucune commission.'}</p>
              <p className="aide">Envoi en point relais, suivi : vous imprimez l'étiquette, vous avez 5 jours pour déposer le colis.</p>
              <fieldset><legend>Mettre l'annonce en avant <small>facultatif, payé seulement si elle est publiée</small></legend><Segment nom="miseEnAvant" val={v.miseEnAvant} choix={MISES_EN_AVANT.map((x) => [x.k, x.prix ? `${x.t} · ${credits ? 'offerte' : eur2(x.prix)}` : x.t])} set={set('miseEnAvant')} /></fieldset>
              {credits ? <p className="aide">Il vous reste {credits} mise{credits > 1 ? 's' : ''} en avant offerte{credits > 1 ? 's' : ''} (parrainage ou vendeur fondateur).</p> : null}
              <label className="choix"><input type="checkbox" name="mainPropre" checked={v.mainPropre} onChange={(e) => set('mainPropre')(e.target.checked)} /> J'accepte aussi la remise en main propre</label>
              {v.mainPropre ? (<><label htmlFor="ville">Ville ou arrondissement</label><input id="ville" name="ville" className="champ" value={v.ville} onChange={(e) => set('ville')(e.target.value)} placeholder="ex. Lyon 3e" /></>) : null}
            </section>

            <section className="bloc-form">
              <h2 className="h2"><span className="bloc-n">6</span>Votre engagement</h2>
              <label className="choix engagement"><input type="checkbox" name="engagement" checked={v.engagement} onChange={(e) => set('engagement')(e.target.checked)} /> <span>Je certifie que ce parfum est authentique, qu'il n'a été ni dilué ni transvasé, et que je l'ai entre les mains. Je sais qu'une contrefaçon entraîne le remboursement de l'acheteur et l'exclusion de Respray.</span></label>
            </section>
            {etat.erreur ? <p className="erreur" role="alert">{etat.erreur}</p> : null}
            <button className="btn btn-noir btn-large" type="submit" disabled={enCours}>{enCours ? 'Envoi des photos…' : 'Envoyer à la vérification'}</button>
          </>
        ) : null}
      </form>
      <aside className="apercu" aria-label="Aperçu de votre annonce">
        <p className="surtitre">Votre annonce</p>
        <div id="apercu">
          <div className="apercu-carte">
            <div className="apercu-photo">{apercus.face ? <img className="visuel" src={apercus.face} alt="" /> : <span className="visuel apercu-sans" />}{apercus.face ? null : <span className="apercu-vide">Votre photo de face</span>}</div>
            <p className="carte-maison">{nomMaison || 'Maison'}</p>
            <p className="carte-nom">{nomParfum || 'Parfum'}</p>
            <p className="carte-meta">{conc || 'Concentration'}{ml > 0 ? ` · ${ml} ml` : ''}{v.etat === 'neuf' ? ' · neuf sous blister' : ml > 0 ? ` · reste ~${v.niveau} % (≈ ${Math.round((ml * v.niveau) / 100)} ml)` : ''}</p>
            <p className="carte-prix">{prixN >= 3 ? eur(prixN) : '— €'}</p>
          </div>
          <ol className="apercu-etapes">{blocs.map(([t, ok]) => <li key={t} className={ok ? 'fait' : ''}><span>{ok ? '✓' : ''}</span>{t}</li>)}</ol>
          <p className="aide">{blocs.filter((b) => b[1]).length} sur {blocs.length} · l'équipe vérifie ensuite, en général en quelques heures.</p>
        </div>
      </aside>
    </div>
  );
}
