// État du cabinet en direct, à l'heure de Naples (America/New_York), d'après les horaires de la page Contact.
// Côté serveur (page pré-générée), il n'y a pas d'état : l'heure ne serait plus juste au moment de la visite.
import { useSyncExternalStore } from 'react'

import { HOURS } from '@/data/content'

export type OfficeStatus = { open: boolean; label: string; detail: string; today: number }

const DAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

export function officeStatus(now = new Date()): OfficeStatus {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(now)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const day = DAYS[get('weekday')] ?? now.getDay()
  const h = Number(get('hour')) + Number(get('minute')) / 60
  const open = HOURS[day].open

  if (open && h >= open[0] && h < open[1]) return { open: true, label: 'Open now', detail: 'Until 5:00 PM today', today: day }
  if (open && h < open[0]) return { open: false, label: 'Opens at 8:00 AM', detail: 'Today, until 5:00 PM', today: day }
  if (day >= 1 && day <= 4) return { open: false, label: 'Closed now', detail: 'Opens tomorrow at 8:00 AM', today: day }
  if (day === 5 || day === 6) return { open: false, label: 'Closed now', detail: 'Saturday by appointment, Monday from 8:00 AM', today: day }
  return { open: false, label: 'Closed today', detail: 'Opens Monday at 8:00 AM', today: day }
}

// une mise à jour par minute suffit
let current: OfficeStatus | null = null
let key = ''
const listeners = new Set<() => void>()
let timer: number | undefined

function read() {
  const s = officeStatus()
  const k = `${s.label}|${s.detail}|${s.today}`
  if (k !== key) {
    key = k
    current = s
  }
  return current
}

export function useOfficeStatus() {
  return useSyncExternalStore(
    (on) => {
      listeners.add(on)
      if (!timer) timer = window.setInterval(() => listeners.forEach((l) => l()), 60_000)
      return () => {
        listeners.delete(on)
        if (!listeners.size) {
          window.clearInterval(timer)
          timer = undefined
        }
      }
    },
    read,
    () => null,
  )
}
