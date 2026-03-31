'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/i18n/translations/en.json';
import mar from '@/i18n/translations/mar.json';
import ru from '@/i18n/translations/ru.json';

export type Language = 'ru' | 'en' | 'mar';

type TranslationTree = Record<string, string | TranslationTree>;

const translations: Record<Language, TranslationTree> = { ru, en, mar };

function translate(tree: TranslationTree, key: string): string {
  const value = key.split('.').reduce<string | TranslationTree | undefined>((acc, part) => {
    if (!acc || typeof acc === 'string') {
      return undefined;
    }

    return acc[part];
  }, tree);

  return typeof value === 'string' ? value : key;
}

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    const stored = localStorage.getItem('app_language') as Language | null;
    if (stored && translations[stored]) {
      setLanguage(stored);
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    return {
      language,
      setLanguage: (nextLanguage) => {
        setLanguage(nextLanguage);
        localStorage.setItem('app_language', nextLanguage);
      },
      t: (key) => translate(translations[language], key)
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
