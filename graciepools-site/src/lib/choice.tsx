// Le choix du visiteur, partagé entre l'accueil, le comparateur, le pied de page et la demande de devis :
// le coloris (qui teinte aussi le site) et le bassin qu'il a demandé à voir.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { finishById, MODELS, type FinishId } from '@/lib/pools'

export type Pick = { model: string; size: number }

type Choice = {
  finish: FinishId
  setFinish: (f: FinishId) => void
  pick: Pick
  setPick: (p: Pick) => void
  /** le bassin joint à la demande de devis (bouton « Ask about this pool ») */
  request: (Pick & { finish: FinishId }) | null
  setRequest: (r: (Pick & { finish: FinishId }) | null) => void
}

const Ctx = createContext<Choice | null>(null)

export function ChoiceProvider({ children }: { children: ReactNode }) {
  const [finish, setFinish] = useState<FinishId>('california')
  const [pick, setPick] = useState<Pick>({ model: 'laguna', size: 0 })
  const [request, setRequest] = useState<Choice['request']>(null)

  // la teinte de l'eau passe au reste du site (boutons, filets, sélection de texte)
  useEffect(() => {
    const f = finishById(finish)
    document.documentElement.style.setProperty('--water', f.tint)
    document.documentElement.style.setProperty('--water-deep', f.deep)
  }, [finish])

  const value = useMemo(() => ({ finish, setFinish, pick, setPick, request, setRequest }), [finish, pick, request])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useChoice() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useChoice hors de ChoiceProvider')
  return c
}

export const modelExists = (id: string) => MODELS.some((m) => m.id === id)
