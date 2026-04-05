import { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en';
import ar from '../i18n/ar';

const strings = { en, ar };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('spotlight_lang') || 'en');

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const toggle = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    localStorage.setItem('spotlight_lang', next);
  };

  const t = (key) => strings[lang][key] ?? strings['en'][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, dir, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
