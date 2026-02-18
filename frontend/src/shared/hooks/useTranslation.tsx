import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr' | 'es' | 'fr';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
  translations: Record<Language, Record<string, string>>;
  defaultLanguage?: Language;
}

export const TranslationProvider = ({ 
  children, 
  translations, 
  defaultLanguage = 'en' 
}: TranslationProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or use default
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('demo-language') as Language;
      if (saved && translations[saved]) {
        return saved;
      }
    }
    return defaultLanguage;
  });

  useEffect(() => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo-language', language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = translations[language]?.[key] || translations[defaultLanguage]?.[key] || key;
    
    // Replace parameters in translation
    if (params) {
      return Object.entries(params).reduce((str, [param, value]) => {
        return str.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      }, translation);
    }
    
    return translation;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};
