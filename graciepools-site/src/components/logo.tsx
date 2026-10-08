// La marque : le rond azur à deux vagues de leur icône actuelle, redessiné, et le nom en Familjen Grotesk.
import { cn } from '@/lib/utils'

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="var(--azure)" />
      <g fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
        <path d="M7.5 13.6c2.1-2.1 4.2-2.1 6.3 0s4.2 2.1 6.3 0 4.2-2.1 4.4-.2" />
        <path d="M7.5 19.6c2.1-2.1 4.2-2.1 6.3 0s4.2 2.1 6.3 0 4.2-2.1 4.4-.2" />
      </g>
    </svg>
  )
}

export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {mark ? <Mark className="size-[30px] shrink-0" /> : null}
      <span className="text-[21px] leading-none font-[700] tracking-[-0.03em]">Gracie Pools</span>
    </span>
  )
}
