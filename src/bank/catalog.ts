import { activeBankProvider } from './bankProvider'
import type { BankRef } from './bankProvider'

/** EU bank catalog (WP28): static seed of popular German/EU banks + live search
 *  against the provider. Sparkasse/Volksbank are families of ~370 regional
 *  institutes — the catalog resolves them by city/postal code at runtime. */

export interface CatalogBank extends BankRef {
  group: BankGroup
  city?: string
  aliases?: string[]
}

export type BankGroup = 'sparkasse' | 'volksbank' | 'private' | 'challenger' | 'direct'

export const POPULAR_BANKS: CatalogBank[] = [
  {
    id: 'sparkasse',
    name: 'Sparkasse',
    group: 'sparkasse',
    aliases: ['spk', 'kreissparkasse', 'stadtsparkasse'],
  },
  { id: 'volksbank', name: 'Volksbank', group: 'volksbank', aliases: ['vr', 'raiffeisen', 'vrb'] },
  { id: 'deutsche-bank', name: 'Deutsche Bank', group: 'private' },
  { id: 'commerzbank', name: 'Commerzbank', group: 'private' },
  { id: 'ing', name: 'ING', group: 'direct', aliases: ['ing-diba'] },
  { id: 'n26', name: 'N26', group: 'challenger' },
  { id: 'revolut', name: 'Revolut', group: 'challenger' },
  { id: 'dkb', name: 'DKB', group: 'direct', aliases: ['deutsche kreditbank'] },
  { id: 'postbank', name: 'Postbank', group: 'private' },
  { id: 'comdirect', name: 'comdirect', group: 'direct' },
  { id: 'consorsbank', name: 'Consorsbank', group: 'direct' },
  { id: 'klarna', name: 'Klarna', group: 'challenger' },
]

/** Normalize a search query: lowercase, strip umlauts/diacritics for matching. */
function norm(q: string): string {
  return q
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .trim()
}

export interface CatalogQuery {
  query?: string
  country?: string
  limit?: number
}

/** Search the provider catalog; falls back to the static seed when the live
 *  provider is unavailable. Matches name + aliases, ranks popular banks first. */
export async function searchCatalog(q: CatalogQuery): Promise<CatalogBank[]> {
  const query = norm(q.query ?? '')
  let rows: BankRef[] = []
  try {
    rows = await activeBankProvider.listBanks()
  } catch {
    rows = POPULAR_BANKS.map(({ id, name }) => ({ id, name }))
  }
  const mapped: CatalogBank[] = rows.map((r) => {
    const known = POPULAR_BANKS.find((p) => norm(p.id) === norm(r.id) || norm(p.name) === norm(r.name))
    return { ...r, group: known?.group ?? 'private', aliases: known?.aliases }
  })

  let result = mapped
  if (query) {
    result = result.filter(
      (b) =>
        norm(b.name).includes(query) ||
        (b.aliases ?? []).some((a) => norm(a).includes(query) || query.includes(norm(a))),
    )
    // popular banks first, then alphabetical
    result.sort((a, b) => {
      const pa = POPULAR_BANKS.findIndex((p) => p.id === a.id)
      const pb = POPULAR_BANKS.findIndex((p) => p.id === b.id)
      return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb) || a.name.localeCompare(b.name)
    })
  }
  return result.slice(0, q.limit ?? 30)
}
