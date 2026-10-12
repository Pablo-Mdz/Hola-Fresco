'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type Lang = 'es' | 'en'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

const LangContext = createContext<LangCtx>({ lang: 'es', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hf-lang') as Lang | null
      if (stored === 'en' || stored === 'es') setLangState(stored)
    } catch {}
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem('hf-lang', l) } catch {}
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

/** Pick the right language variant, falling back to the other if null/undefined */
export function pick(
  es: string | null | undefined,
  en: string | null | undefined,
  lang: Lang,
): string {
  if (lang === 'en') return (en ?? es) ?? ''
  return (es ?? en) ?? ''
}
