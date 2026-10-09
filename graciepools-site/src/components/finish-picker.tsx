// Les six coloris Shimmer, présentés par leur vraie pastille de gelcoat (fiche Barrier Reef 2025).
// Un groupe de boutons radio (Radix) : flèches du clavier, un seul arrêt de tabulation.
import { RadioGroup } from 'radix-ui'

import { photo } from '@/lib/photos'
import { FINISHES, finishById, type FinishId } from '@/lib/pools'
import { cn } from '@/lib/utils'

export function FinishPicker({ value, onChange, className, dark = true }: { value: FinishId; onChange: (f: FinishId) => void; className?: string; dark?: boolean }) {
  const current = finishById(value)
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <span id="finish-label" className={cn('text-[15px] font-[600]', dark ? 'text-white' : 'text-ink')}>
          Finish
        </span>
        <span className={cn('text-[15px]', dark ? 'text-white/70' : 'text-ink-soft')} aria-live="polite">
          {current.name}
        </span>
      </div>
      <RadioGroup.Root
        value={value}
        onValueChange={(v) => onChange(v as FinishId)}
        aria-labelledby="finish-label"
        className="mt-3 flex flex-wrap gap-2.5"
        orientation="horizontal"
        loop
      >
        {FINISHES.map((f) => (
          <RadioGroup.Item key={f.id} value={f.id} aria-label={f.name} className={cn('chip', dark ? 'chip-dark' : 'chip-light')}>
            <img src={photo(`chip-${f.id}`).src} alt="" width={44} height={44} loading="lazy" decoding="async" className="chip-img" draggable={false} />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  )
}
