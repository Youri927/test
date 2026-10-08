// « Every model, drawn to scale » : le comparateur. Une forme, un modèle, une taille, un coloris ;
// la scène montre le bassin à sa vraie taille sur la grille, la fiche donne les mesures officielles,
// et le bouton joint ce bassin à la demande de devis.
import { ArrowRight, FileDown, MessageSquareText, Pin, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { FinishPicker } from '@/components/finish-picker'
import { Lines } from '@/components/lines'
import { PoolPlan } from '@/components/pool-plan'
import { PoolStage } from '@/components/pool-stage'
import { RiseBg } from '@/components/rise'
import { Segmented } from '@/components/segmented'
import { useChoice } from '@/lib/choice'
import { scrollToId } from '@/lib/motion'
import { photo } from '@/lib/photos'
import { depthRange, FAMILIES, feet, finishById, gallons, MODELS, modelById, sizeLabel, type Family, type Model } from '@/lib/pools'
import { SHEET, sms } from '@/lib/site'
import { cn } from '@/lib/utils'

const familyName = (m: Model) =>
  m.families
    .map((f) => FAMILIES.find((x) => x.id === f)?.label)
    .join(' · ')
    .replace('Spas & sundecks', m.id.includes('sundeck') ? 'Sundeck' : 'Spa')

const inList = (m: Model, f: Family | 'all') => (f === 'all' ? !m.families.includes('spa') : m.families.includes(f))

export function Planner() {
  const { finish, setFinish, pick, setPick, setRequest } = useChoice()
  const [family, setFamily] = useState<Family | 'all'>('all')
  const [pinned, setPinned] = useState<{ model: string; size: number } | null>(null)
  const model = modelById(pick.model)
  const size = model.sizes[pick.size] ?? model.sizes[0]
  const list = useMemo(() => MODELS.filter((m) => inList(m, family)), [family])
  const options = useMemo(() => FAMILIES.map((f) => ({ value: f.id, label: f.label, count: MODELS.filter((m) => inList(m, f.id)).length })), [])

  const chooseFamily = (f: Family | 'all') => {
    setFamily(f)
    // si le bassin affiché n'est pas de cette famille, on montre le premier de la liste
    const cur = modelById(pick.model)
    if (!inList(cur, f)) setPick({ model: MODELS.filter((m) => inList(m, f))[0].id, size: 0 })
  }

  const ask = () => {
    setRequest({ model: model.id, size: pick.size, finish })
    scrollToId('contact')
  }

  const label = `${model.name}, ${feet(size.l)} by ${feet(size.w)}, drawn to scale on a grid in feet, in ${finishById(finish).name}`
  const rows: [string, string][] = [
    ['Length', feet(size.l)],
    ['Width', feet(size.w)],
    [model.families.includes('spa') ? 'Depth' : 'Depth', depthRange(size)],
    ...(size.extra ?? []),
    ...(size.gal ? ([['Water', `about ${gallons(size.gal)} gallons`]] as [string, string][]) : []),
  ]
  const shot = model.photo ? photo(model.photo) : null
  const ghostModel = pinned ? modelById(pinned.model) : null
  const ghost = ghostModel && pinned ? { model: ghostModel, size: ghostModel.sizes[pinned.size] ?? ghostModel.sizes[0] } : null
  const samePinned = pinned && pinned.model === model.id && pinned.size === pick.size

  return (
    <section id="models" tabIndex={-1} className="on-dark relative isolate text-white">
      <RiseBg above="#ffffff" below="var(--deck)" />
      <div className="wrap pt-[clamp(84px,10vw,150px)] pb-[clamp(72px,8vw,120px)]">
        <div className="grid gap-x-10 gap-y-6 lg:grid-cols-12 lg:items-end">
          <Lines className="t-h2 lg:col-span-7">Every model, drawn to scale</Lines>
          <p className="t-lead text-white/72 lg:col-span-5" data-up>
            All the Barrier Reef shells we install, on the same grid in feet. Pick one and it takes its real size, with the manufacturer’s
            own measurements.
          </p>
        </div>

        <div className="mt-[clamp(40px,5vw,72px)] grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <div className="rounded-[20px] bg-[#0e2330] p-3 pt-4 sm:p-5 sm:pt-6" data-up>
              <PoolStage model={model} size={size} finish={finish} label={label} caption={`${model.name}  ·  ${feet(size.l)} × ${feet(size.w)}`} ghost={samePinned ? null : ghost} />
            </div>

            <div className="mt-8" data-up>
              <Segmented label="Pool shape" options={options} value={family} onChange={chooseFamily} />
              <ul className="lineup mt-5" aria-label="Models">
                {list.map((m) => (
                  <li key={m.id}>
                    <LineupItem model={m} selected={m.id === model.id} finish={finish} onPick={() => setPick({ model: m.id, size: 0 })} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-4" aria-label="Selected model">
            <div className="lg:sticky lg:top-[calc(var(--header)+28px)]">
              <p className="text-[15px] text-white/60">{familyName(model)}</p>
              <h3 key={model.id} className="name-in mt-1 text-[clamp(38px,3.6vw,58px)] leading-[0.95] font-[680] tracking-[-0.035em]">
                {model.name}
              </h3>
              {model.note ? <p className="mt-3 text-[15px] text-white/70">{model.note}</p> : null}

              {model.sizes.length > 1 ? (
                <div className="mt-6" role="group" aria-label="Size">
                  <div className="flex flex-wrap gap-2">
                    {model.sizes.map((s, i) => (
                      <button key={i} type="button" aria-pressed={i === pick.size} onClick={() => setPick({ model: model.id, size: i })} className="size-btn tnum">
                        {sizeLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <dl className="specs mt-7">
                {rows.map(([k, v]) => (
                  <div key={k} className="specs-row">
                    <dt>{k}</dt>
                    <dd className="tnum" key={`${model.id}-${pick.size}-${k}`}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 min-h-11">
                {pinned && !samePinned && ghost ? (
                  <div className="flex items-center gap-2 text-[15px] text-white/80">
                    <span className="inline-block h-0 w-6 border-t-[1.5px] border-dashed border-white/85" aria-hidden />
                    <span>
                      Compared with the <span className="font-[600] text-white">{ghost.model.name}</span> <span className="tnum">{feet(ghost.size.l)}</span>
                    </span>
                    <button type="button" onClick={() => setPinned(null)} className="ml-auto grid size-10 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white" aria-label="Stop comparing">
                      <X className="size-4" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPinned(samePinned ? null : { model: model.id, size: pick.size })}
                    aria-pressed={!!samePinned}
                    className="inline-flex h-11 items-center gap-2 text-[15px] font-[600] text-white/80 hover:text-white"
                  >
                    <Pin className="size-4" aria-hidden />
                    {samePinned ? 'Pinned: now pick another model to compare' : 'Pin this pool, then compare'}
                  </button>
                )}
              </div>

              <FinishPicker value={finish} onChange={setFinish} className="mt-6" />

              <div className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <button type="button" onClick={ask} className="btn btn-white justify-between">
                  Ask about this pool
                  <ArrowRight className="btn-arrow size-[18px]" aria-hidden />
                </button>
                <a href={sms(`Hi Gracie Pools, I'm looking at the ${model.name} (${feet(size.l)}). Here's a photo of my yard:`)} className="btn btn-line-dark justify-between">
                  Text a photo of your yard
                  <MessageSquareText className="size-[18px]" aria-hidden />
                </a>
              </div>

              {shot ? (
                <figure className="mt-8 grid grid-cols-[112px_1fr] items-center gap-4">
                  <img src={shot.src} alt={`${model.name} installed in a backyard`} width={shot.width} height={shot.height} loading="lazy" className="aspect-[4/3] w-[112px] rounded-[10px] object-cover" />
                  <figcaption className="text-[14px] leading-snug text-white/60">
                    A {model.name} in a backyard.
                    <br />
                    Photo: Barrier Reef
                  </figcaption>
                </figure>
              ) : null}
            </div>
          </aside>
        </div>

        <p className="mt-14 max-w-[64rem] text-[14px] leading-relaxed text-white/50">
          Drawings and measurements from Barrier Reef’s 2025 model sheet. The outlines are scaled to each model’s listed length and width;
          measurements are approximate and models can change. Water volumes from the Gracie Pools model pages. Colors on a screen are never
          exact: ask us for a color chip.{' '}
          <a href={SHEET} className="inline-flex items-center gap-1 text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white" target="_blank" rel="noreferrer">
            <FileDown className="size-3.5" aria-hidden />
            2025 model sheet (PDF)
          </a>
        </p>
      </div>
    </section>
  )
}

/** Un modèle dans la liste : son dessin à la même petite échelle que tous les autres, son nom, sa longueur */
const MINI = 3.2

function LineupItem({ model, selected, finish, onPick }: { model: Model; selected: boolean; finish: Parameters<typeof PoolPlan>[0]['finish']; onPick: () => void }) {
  const s = model.sizes[0]
  const L = (s.l / 12) * MINI
  return (
    <button type="button" aria-pressed={selected} onClick={onPick} className={cn('lineup-item', selected && 'is-on')}>
      <svg width={Math.ceil(L) + 4} height={16.5 * MINI + 4} aria-hidden className="block overflow-visible">
        <PoolPlan model={model} size={s} finish={finish} ppf={MINI} x={2} y={2} drift={false} lines={false} />
      </svg>
      <span className="mt-2 block text-[14px] leading-tight font-[600]">{model.name}</span>
      <span className="tnum block text-[13px] text-white/55">{model.sizes.map((x) => feet(x.l)).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}</span>
    </button>
  )
}
