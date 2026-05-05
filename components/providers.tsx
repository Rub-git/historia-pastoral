'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, translations, t as translate } from '@/lib/i18n';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language, saveToDb?: boolean) => void;
  t: (key: keyof typeof translations.es, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'es' as Language,
      setLanguage: () => {},
      t: (key: keyof typeof translations.es) => translate(key, 'es'),
    };
  }
  return context;
}

function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { data: session, status } = useSession() || {};

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage?.getItem('language') as Language;
    if (saved && (saved === 'es' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  // Sync with database when logged in (only once per session)
  useEffect(() => {
    if (status === 'authenticated' && mounted && !initialized) {
      // Fetch user's language preference from database
      fetch('/api/settings')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.language && (data.language === 'es' || data.language === 'en')) {
            // Only update if different from current
            const currentLocal = localStorage?.getItem('language');
            if (!currentLocal) {
              // No local preference, use database preference
              setLanguageState(data.language);
              localStorage?.setItem('language', data.language);
            }
            // If there's a local preference, keep it (user's most recent choice)
          }
          setInitialized(true);
        })
        .catch(() => setInitialized(true));
    } else if (status === 'unauthenticated') {
      setInitialized(true);
    }
  }, [status, mounted, initialized]);

  const handleSetLanguage = useCallback((lang: Language, saveToDb: boolean = true) => {
    setLanguageState(lang);
    localStorage?.setItem('language', lang);
    
    // Optionally save to database
    if (saveToDb && status === 'authenticated') {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      }).catch(console.error);
    }
  }, [status]);

  const t = useCallback((key: keyof typeof translations.es, params?: Record<string, string | number>) => {
    return translate(key, language, params);
  }, [language]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </SessionProvider>
  );
}