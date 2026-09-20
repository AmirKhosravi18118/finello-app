/** Legal content (Impressum / Datenschutz / AGB) — trilingual, structured.
 *  German texts are the legally relevant versions (DDG / DSGVO).
 *  Placeholders in [brackets] MUST be replaced by the owner before public launch. */

export interface LegalSection {
  heading: string
  paragraphs: string[]
}

export interface LegalDoc {
  title: string
  sections: LegalSection[]
}

type LegalBundle = Record<'impressum' | 'privacy' | 'terms', LegalDoc>

const de: LegalBundle = {
  impressum: {
    title: 'Impressum',
    sections: [
      {
        heading: 'Angaben gemäß § 5 DDG',
        paragraphs: [
          '[Vor- und Nachname des Betreibers]',
          '[Straße und Hausnummer]',
          '[PLZ, Ort] — Deutschland',
          'E-Mail: [kontakt@ihre-domain.de]',
        ],
      },
      {
        heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
        paragraphs: ['[Vor- und Nachname, Anschrift wie oben]'],
      },
      {
        heading: 'Hinweis',
        paragraphs: [
          'Vor dem öffentlichen Betrieb sind alle Platzhalter in [eckigen Klammern] durch die echten Angaben des Betreibers zu ersetzen.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Datenschutzerklärung',
    sections: [
      {
        heading: '1. Grundsatz: Local-first',
        paragraphs: [
          'Finello speichert Ihre Zahlungen, Ausgaben, Einnahmen und Einstellungen standardmäßig ausschließlich lokal auf Ihrem Gerät (Browserspeicher). Ihre Finanzdaten werden nicht an den Betreiber oder Dritte übertragen.',
        ],
      },
      {
        heading: '2. Optionale Bankverbindung (GoCardless, PSD2)',
        paragraphs: [
          'Aktivieren Sie optional eine Bankverbindung, erfolgt der Abruf Ihrer Transaktionen über den lizenzieren Dienst GoCardless Bank Account Data (PSD2). Über einen verschlüsselten Proxy übermittelt werden ausschließlich Transaktionsdaten (Buchungsdatum, Verwendungszweck, Betrag). Online-Banking-Zugangsdaten fließen niemals an den Betreiber.',
          'Rechtsgrundlage ist Ihre ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), jederzeit über „Verbindung trennen“ widerrufbar. Ausführliche Informationen der Datenverarbeitung durch GoCardless: https://gocardless.com/de/rechtliches/datenschutz/',
        ],
      },
      {
        heading: '3. Speicherfrist & Löschung',
        paragraphs: [
          'Alle lokal gespeicherten Daten können jederzeit über „Alle Daten löschen“ unwiderruflich entfernt werden.',
        ],
      },
      {
        heading: '4. Ihre Rechte (Art. 15–21 DSGVO)',
        paragraphs: [
          'Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Anfragen: [kontakt@ihre-domain.de]. Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde (z. B. LDI NRW).',
        ],
      },
      {
        heading: '5. Verantwortlicher',
        paragraphs: ['[Vor- und Nachname, Anschrift, E-Mail — wie Impressum]'],
      },
    ],
  },
  terms: {
    title: 'AGB / Nutzungsbedingungen',
    sections: [
      {
        heading: '1. Leistung',
        paragraphs: [
          'Finello ist ein Werkzeug zur Organisation von Zahlungen, Ausgaben und steuerrelevanten Belegen. Die Anwendung wird im Beta-Stadium „wie besehen“ bereitgestellt.',
        ],
      },
      {
        heading: '2. Keine Steuer- oder Rechtsberatung',
        paragraphs: [
          'Alle Inhalte — insbesondere Steuerschätzungen und Pauschalen — dienen ausschließlich der Information und ersetzen keine Beratung durch Steuerberater:innen oder Rechtsanwält:innen.',
        ],
      },
      {
        heading: '3. Haftung',
        paragraphs: [
          'Eine Haftung für Schäden aus versäumten Zahlungen oder steuerlichen Nachteilen der Beta-Nutzung ist ausgeschlossen; Haftung bei Vorsatz und grober Fahrlässigkeit bleibt unberührt.',
        ],
      },
      {
        heading: '4. Verfügbarkeit',
        paragraphs: [
          'Im Beta-Stadium besteht kein Anspruch auf Verfügbarkeit. Die lokale Nutzung funktioniert auch ohne Internetverbindung.',
        ],
      },
    ],
  },
}

const en: LegalBundle = {
  impressum: {
    title: 'Imprint (Impressum)',
    sections: de.impressum.sections,
  },
  privacy: {
    title: 'Privacy policy (Datenschutzerklärung)',
    sections: de.privacy.sections,
  },
  terms: {
    title: 'Terms of use (AGB)',
    sections: de.terms.sections,
  },
}

const fa: LegalBundle = {
  impressum: { title: 'Imprint (Impressum)', sections: de.impressum.sections },
  privacy: { title: 'حریم خصوصی (Datenschutz)', sections: de.privacy.sections },
  terms: { title: 'شرایط استفاده (AGB)', sections: de.terms.sections },
}

const BUNDLES: Record<string, LegalBundle> = { fa, de, en }

export function legalDoc(lang: string, doc: keyof LegalBundle): LegalDoc {
  return (BUNDLES[lang] ?? BUNDLES.en)[doc]
}

export type LegalDocKey = keyof LegalBundle
