// TranslationLoader scaffold
// - Provide method to lazy-load JSON translation files for modules
// - Example: load '/assets/i18n/es.json' or '/assets/i18n/auth/es.json'

export async function loadTranslations(lang: string, namespace?: string): Promise<any> {
  const fileName = namespace ? `${namespace}/${lang}.json` : `${lang}.json`;
  // Try several candidate paths to be robust across base-href deployments
  const baseEl = (typeof document !== 'undefined') ? document.querySelector('base') : null;
  const baseHref = baseEl && (baseEl as HTMLBaseElement).href ? (baseEl as HTMLBaseElement).href.replace(/\/$/, '') : '';
  const candidates = [];
  if (baseHref) candidates.push(`${baseHref}/assets/i18n/${fileName}`);
  candidates.push(`/assets/i18n/${fileName}`);
  candidates.push(`assets/i18n/${fileName}`);
  candidates.push(`./assets/i18n/${fileName}`);

  for (const path of candidates) {
    try {
      const res = await fetch(path);
      if (!res.ok) {
        console.debug('loadTranslations: path not ok', path, res.status);
        continue;
      }
      const json = await res.json();
      console.info('loadTranslations: loaded', path, json && Object.keys(json).length);
      return json;
    } catch (err) {
      console.debug('loadTranslations: error fetching', path, err);
      // try next candidate
    }
  }

  console.warn('loadTranslations: no translation file found for', lang, 'namespace', namespace);
  return {};
}
