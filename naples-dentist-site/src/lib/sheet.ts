// Fiche des soins (panneau latéral) : un petit état partagé, ouvert depuis n'importe quelle section.
import { useSyncExternalStore } from 'react'

export type SheetState = { open: boolean; title: string; ids: string[]; from?: string }

let state: SheetState = { open: false, title: '', ids: [] }
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function openSheet(ids: string[], title = '', from?: string) {
  state = { open: true, title, ids, from }
  emit()
}

export function closeSheet() {
  state = { ...state, open: false }
  emit()
}

export function useSheet() {
  return useSyncExternalStore(
    (on) => {
      listeners.add(on)
      return () => listeners.delete(on)
    },
    () => state,
    () => state,
  )
}

// Demande de rendez-vous : le formulaire reprend le motif choisi dans une fiche.
// n change à chaque demande, même si le motif est le même que la fois précédente.
let reason = { text: '', n: 0 }
const empty = { text: '', n: 0 }
const reasonListeners = new Set<() => void>()
export function setReason(text: string) {
  reason = { text, n: reason.n + 1 }
  reasonListeners.forEach((l) => l())
}
export function useReason() {
  return useSyncExternalStore(
    (on) => {
      reasonListeners.add(on)
      return () => reasonListeners.delete(on)
    },
    () => reason,
    () => empty,
  )
}
