import { useMemo } from 'react';
import { useUiPrefs } from '../useSavedState';
import { writeUiPrefs } from '../uiPrefs';
import { translate, type Locale } from './ui';

export function setLocale(locale: Locale) {
  writeUiPrefs({ locale });
}

export function useLocale() {
  const locale = useUiPrefs().locale ?? 'zh';
  return useMemo(() => ({
    locale,
    setLocale,
    t: (key: string, values?: Record<string, string | number>) => translate(locale, key, values),
  }), [locale]);
}
