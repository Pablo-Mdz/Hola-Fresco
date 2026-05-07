import es from './es'
import en from './en'
import type { Locale } from '@/types'

const translations = { es, en }

export function getT(locale: Locale) {
  return translations[locale] ?? translations.es
}

export type Translations = typeof es
