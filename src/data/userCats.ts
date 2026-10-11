/** User-defined categories (v1.2): stored in localStorage, extend the builtin
 *  palette with custom labels. Used by CategoryGrid, badges, filters. */

import { CATEGORIES } from './demo'
import type { CategoryId } from './demo'

export interface UserCat {
  id: string
  label: string
  color: string
}

const KEY = 'finello_custom_cats'
const PALETTE = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#14b8a6', '#06b6d4']

export function getUserCats(): UserCat[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as UserCat[]
  } catch {
    return []
  }
}

export function addUserCat(label: string): UserCat {
  const list = getUserCats()
  const cat: UserCat = {
    id: `uc-${Date.now()}`,
    label: label.trim(),
    color: PALETTE[list.length % PALETTE.length],
  }
  localStorage.setItem(KEY, JSON.stringify([...list, cat]))
  return cat
}

export function removeUserCat(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getUserCats().filter((c) => c.id !== id)))
}

export function updateUserCatLabel(id: string, label: string): void {
  localStorage.setItem(KEY, JSON.stringify(getUserCats().map((c) => (c.id === id ? { ...c, label } : c))))
}

/** Extended category type: builtin or user-defined. */
export type AnyCatId = CategoryId | `uc-${string}`

/** Resolve any tx categoryId (builtin or user-defined) to label + color.
 *  Unknown/removed ids fall back to 'other' so badges never render raw keys. */
export function catMeta(id: string, t: (k: string) => string): { label: string; color: string } {
  const uc = id.startsWith('uc-') ? getUserCats().find((c) => c.id === id) : undefined
  if (uc) return { label: uc.label, color: uc.color }
  const def = (CATEGORIES as Record<string, { color: string }>)[id]
  if (def) return { label: t(`cat.${id}`), color: def.color }
  return { label: t('cat.other'), color: CATEGORIES.other.color }
}

export function isBuiltin(id: string): boolean {
  return id in ({} as Record<CategoryId, never>) || !id.startsWith('uc-')
}
