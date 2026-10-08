// « Open now » / « Closed now », calculé à l'heure de Naples. Avant l'hydratation (page pré-générée), les horaires.
import { useOfficeStatus } from '@/lib/office'
import { cn } from '@/lib/utils'

export function OfficeState({ compact = false, className }: { compact?: boolean; className?: string }) {
  const s = useOfficeStatus()
  const label = s ? s.label : 'Monday to Friday'
  const detail = s ? s.detail : '8:00 AM – 5:00 PM'

  if (compact)
    return (
      <span className={cn('items-center gap-2.5 text-[14.5px] font-[520] whitespace-nowrap', className)}>
        <span className={cn('status-dot', s && !s.open && 'is-closed')} aria-hidden />
        {label}
        {s?.open && <span className="text-ink-soft">· until 5 PM</span>}
      </span>
    )

  return (
    <span className={cn('flex items-start gap-3', className)}>
      <span className={cn('status-dot mt-[7px]', s && !s.open && 'is-closed')} aria-hidden />
      <span className="leading-[1.35]">
        <span className="block font-[600]">{label}</span>
        <span className="block text-ink-soft">{detail}</span>
      </span>
    </span>
  )
}
