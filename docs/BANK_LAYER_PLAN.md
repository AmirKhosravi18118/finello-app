# BANK LAYER PLAN — طرح کامل اتصال همه بانک‌های EU (مصوب Atria)


[REASONING]
The user wants a complete, production-grade bank connectivity layer design. They've provided the current source (two files: bankProvider.ts and gocardless.ts). They want:

1. Bank catalog modeling 2000+ EU institutions
2. Sparkasse specifics (~370 regional institutes)
3. Consent flow (requisition, redirect URI for PWA with hash routing, re-link/expiry, SSE/webhooks vs polling)
4. Revolut/N26/Klarna coverage via GoCardless
5. Security/GDPR

Output: numbered implementation plan with EXACT code changes for the existing adapter architecture (files: bank/gocardless.ts — add listBanks(query, country), institutions search endpoint, startConsent, pollRequisition; bankConnection.ts — connect flow states). Include BANK_COVERAGE table for top 15 German banks. Concise, technical, no fluff. English.

Let me design this carefully. I need to be pragmatic and production-grade. Let me think about the architecture.

Key facts about GoCardless Bank Account Data (Nordigen):
- `/institutions/?country=DE` returns institutions with id, name, logo, countries, transaction_total_days, max_access_valid_for_days, etc.
- Institution IDs are like `SPK_KARLSRUHE_DE`, `N26`, `REVOLUT`, `ING`, `COMMERZBANK`, etc. Actually Nordigen institution ids: `SANDBOXFINANCE_SFIN0000`, `N26`, `REVOLUT_NG`, `ING_DE`, `COMMERZBANK_DE`, `DEUTSCHE_BANK`, `SPK_*`... Actually the real ones: `SPK_KARLSRUHE_DE`? Let me recall — Nordigen institution IDs look like `SPK_KARLSRUHE_DE`? Hmm, I believe they're like `SPK_KARLSRUHE_DE`... Actually the format is like `SPK-BANKEN_DE` or... Let me just use plausible IDs: `SPK_KARLSRUHE_DE`, `VB_KARLSRUHE_DE`, `N26`, `REVOLUT`, `ING_DE`, `COMMERZBANK_DE`, `DEUTSCHE_BANK_DE`, `DKB_DE`, `POSTBANK_DE`, `CONSORSBANK`, `COMDIRECT`, `1822`, `GLS`, `TRIODOS`, `OLB`, `HANSEATIC`, `FINOM`, `QONT`, `BUNQ`, `KLARNA`? Klarna is not a bank in Nordigen's list typically. Revolut is in Nordigen (REVOLUT) for some countries. N26 is definitely there.

I should be careful to note that coverage must be verified at runtime via the institutions endpoint, and that IDs vary.

Now the design:

**File structure:**
```
src/bank/
  bankProvider.ts       (contract — extend BankRef)
  catalog/
    catalog.ts          (static seed catalog: popular, aliases, grouping)
    sparkasse.ts        (Sparkasse regional registry: BLZ→city mapping)
  gocardless.ts         (extended)
  adapters/
    revolut.ts          (optional)
    klarna.ts           (optional)
  bankConnection.ts     (state machine)
  consent.ts            (requisition store, polling)
```

Let me write the plan with exact code.

**1. Bank catalog model**

Extend BankRef:
```ts
export interface BankRef {
  id: string            // GoCardless institution_id (stable)
  name: string
  bic?: string
  bankCode?: string     // BLZ (DE), BC (AT), etc.
  country: string       // ISO-2
  logo?: string
  group: BankGroup      // sparkasse | volksbank | private | challenger | aggregator | cooperative | savings
  popularity?: number   // 0-100 for popular shortcut
  aliases?: string[]    // search synonyms: 'sparkasse', 'spk', 'kreissparkasse'
  city?: string         // for regional institutes
  postalCode?: string
  maxAccessValidDays?: number
  transactionTotalDays?: number
}
```

Search: `listBanks({ query, country, group, postalCode, limit })`.

Two-tier catalog:
- Tier 1: static seed `catalog.ts` — top ~120 institutions with curated metadata (group, popularity, BIC, BLZ, aliases). Bundled, instant search, offline-capable.
- Tier 2: live GoCardless `/institutions/?country=xx` — full 2000+, fetched lazily, cached in IndexedDB (or localStorage) with 7-day TTL, merged over tier 1.

Merge rule: tier-1 wins for curated fields; tier-2 supplies id+name+logo.

**Sparkasse specifics:** ~370 regional Sparkassen in Germany, each a separate GoCardless institution with id like `SPK_KARLSRUHE_DE`. Search 'Sparkasse' returns all 370. UX: search → type city or PLZ. Provide `sparkasse.ts` registry mapping BLZ → city + postal prefix so search "Sparkasse 76133" or "Sparkasse Karlsruhe" resolves. Also provide a "Sparkasse in deiner Nähe" picker using postal code.

Actually — a key trick: GoCardless institution names for Sparkassen are like "Sparkasse Karlsruhe" or "Kreissparkasse ...". So name search works; BLZ mapping helps for postal-code search since GoCardless doesn't expose BLZ. So we maintain a BLZ→institution mapping table (static, from Deutsche Bundesbank BLZ list, ~370 entries). That's the honest production approach.

**2. Consent flow**

PWA uses hash routing (`/#/bank/callback`). Redirect URI must be registered in GoCardless dashboard. Use `redirect: ${window.location.origin}/#/bank/callback?ref=${requisitionId}`. Actually GoCardless appends `?ref=${requisition_id}` to the redirect automatically. With hash routing, the redirect must include the hash: `https://app.example.com/#/bank/callback` — GoCardless appends `?ref=...` → `https://app.example.com/#/bank/callback?ref=...`. That works since query after hash is parsed by hash router.

Hmm, careful: GoCardless appends query params. If redirect is `https://x/#/bank/callback`, they'd produce `https://x/#/bank/callback?ref=ID`. Most hash routers (wouter, react-router hash) handle that. Alternatively use a dedicated path `/bank-callback` served as index.html and then navigate to hash. Safer: use path-based callback that redirects into hash app: `redirect = origin + '/bank/callback'` where the server serves index.html for that path (SPA fallback), and the app reads `?ref=` then navigates to `#/bank/connect/done`. That's the most robust. I'll recommend that.

States (bankConnection.ts): `idle → searching → selecting → creating_requisition → redirecting → (bank hosted) → callback_validating → fetching_accounts → fetching_transactions → connected | error | expired`.

Polling vs webhooks: GoCardless free tier has no webhooks for requisition completion (they do have webhooks on paid tier? Actually Nordigen/GoCardless BAD has webhooks for certain events on enterprise). Pragmatic: poll `/requisitions/{id}/` every 2s for up to 5 min after redirect return, with statuses: `CR` (created), `GN` (giving access), `LN` (linked), `RJ` (rejected), `EX` (expired), `SU` (suspended). Also SSE from our own proxy as an enhancement. Recommend: polling first (simple, works), add proxy SSE later.

Expiry: requisitions expire after 10 minutes (GoCardless default? Actually requisition link expires — max_access_valid_for_days is per institution, often 90 days; requisition itself expires if not completed within ~10 min? Nordigen: requisition link is valid for a limited time). Consent validity: `max_access_valid_for_days` per institution (e.g., 90 for many German banks, 180 for some). Store `consentExpiresAt`; re-auth UX: show "Erneut anmelden" 14 days before expiry.

**3. Revolut/N26/Klarna**

- N26: GoCardless ✓ (`N26` institution, DE/AT/ES/etc.)
- Revolut: GoCardless has `REVOLUT` for some countries (LT-based, available in DE list? Revolut Bank UAB is a Lithuanian bank; Nordigen lists REVOLUT under LT and other countries; in DE list it may appear as "Revolut"). Coverage varies; verify at runtime. If missing → Revolut Business API (OAuth2, separate adapter) — only for business accounts; personal Revolut has no public PSD2 API beyond aggregators. Pragmatic: GoCardless-first; if `REVOLUT` not in country list, show "Revolut via EU-wide listing (Litauen)" option or mark as "not available, use Revolut's own export".
- Klarna: Klarna is not a bank in the PSD2 sense for account data (Klarna Bank AB has a banking license but doesn't expose AIS via Nordigen). Klarna Open Banking API is a separate PSD2 AIS product (Klarna is an AISP/PISP) — but for a consumer app, "Klarna" as a bank to import from is mostly meaningless; what users want is to *pay* with Klarna (PIS) or connect Klarna's partner banks. Recommend: treat Klarna as PIS payment method later, not AIS bank; for AIS use GoCardless coverage of the underlying banks.

So: adapter registry with `provider` field per institution; GoCardless-first; dedicated adapters only where GoCardless lacks coverage (e.g., Revolut Business via OAuth2, maybe Finom, Qonto... but those are in GoCardless too).

**4. Security/Datenschutz**

- PSD2: Finello acts as an AISP via GoCardless's license (GoCardless is a licensed AISP/PISP in EU; Finello relies on their license as tech provider — must still have a contract and register as per § 31c ZAG? Actually in Germany, an AISP needs BaFin registration or rely on the licensed provider's agent framework. GoCardless offers "agent" arrangement. Note this as legal requirement.)
- Tokens: GoCardless secret + secret_id only in proxy (worker/edge), never in client. Client only receives requisition link + account/transaction data. Proxy stores requisition_id ↔ user mapping server-side.
- GDPR data minimization: only fetch transactions needed (date-bounded), store only booked transactions with name/amount/date/iban (hashed IBAN?), delete raw 