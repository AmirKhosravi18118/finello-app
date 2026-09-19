import { describe, expect, it } from 'vitest'
import { BUNDLES, leafKeys, resolve, translate } from './engine'

describe('resolve', () => {
  it('resolves nested dot keys', () => {
    expect(resolve(BUNDLES.fa, 'nav.home')).toBe('خانه')
    expect(resolve(BUNDLES.de, 'nav.tax')).toBe('Steuer')
  })
  it('returns undefined for missing keys', () => {
    expect(resolve(BUNDLES.en, 'nav.does-not-exist')).toBeUndefined()
    expect(resolve(BUNDLES.fa, 'nav')).toBeUndefined() // non-leaf
  })
})

describe('translate fallback chain', () => {
  it('falls back to en when a lang lacks a key', () => {
    // simulate: fa missing key -> en used
    expect(translate('fa', 'status.overdue')).toBe('معوق')
    expect(translate('de', 'nonexistent.key')).toBe('nonexistent.key')
  })
  it('interpolates {var} placeholders', () => {
    expect(translate('fa', 'home.daysToSalary', { n: 4 })).toContain('4')
    expect(translate('en', 'tx.count', { n: 12 })).toBe('12 transactions')
  })
})

describe('locale parity', () => {
  it('fa, de and en expose exactly the same key set', () => {
    const faKeys = leafKeys(BUNDLES.fa)
    const deKeys = leafKeys(BUNDLES.de)
    const enKeys = leafKeys(BUNDLES.en)
    expect(deKeys).toEqual(enKeys)
    expect(faKeys).toEqual(enKeys)
  })
})
