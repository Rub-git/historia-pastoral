'use client';

import Link from 'next/link';
import { useLanguage } from './providers';
import { Heart } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();

  const currentYear = new Date().getFullYear();

  const content = {
    es: {
      about: 'Acerca de',
      privacy: 'Privacidad',
      terms: 'Términos',
      ethics: 'Ética Pastoral',
      contact: 'Contacto',
      tagline: 'Cuidado pastoral con integridad y compasión.',
      rights: 'Todos los derechos reservados.',
      values: ['Cuidado sobre control', 'Memoria sobre burocracia', 'Compasión sobre métricas'],
    },
    en: {
      about: 'About',
      privacy: 'Privacy',
      terms: 'Terms',
      ethics: 'Pastoral Ethics',
      contact: 'Contact',
      tagline: 'Pastoral care with integrity and compassion.',
      rights: 'All rights reserved.',
      values: ['Care over control', 'Memory over bureaucracy', 'Compassion over metrics'],
    },
  };

  const t = content[language] || content.es;

  return (
    <footer className="bg-sage-50 border-t border-sage-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Brand & Tagline */}
          <div className="space-y-2">
            <p className="font-serif text-sage-800 font-medium">
              Pastoral History
            </p>
            <p className="text-sm text-sage-600">
              {t.tagline}
            </p>
          </div>

          {/* Values */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sage-500">
            {t.values.map((value, index) => (
              <span key={index} className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-sage-400" />
                {value}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-6 pt-6 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-sage-500">
            © {currentYear} Pastoral History. {t.rights}
          </p>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/about"
              className="text-sage-600 hover:text-sage-800 transition-colors"
            >
              {t.about}
            </Link>
            <Link
              href="/ethics"
              className="text-sage-600 hover:text-sage-800 transition-colors"
            >
              {t.ethics}
            </Link>
            <Link
              href="/privacy"
              className="text-sage-600 hover:text-sage-800 transition-colors"
            >
              {t.privacy}
            </Link>
            <Link
              href="/terms"
              className="text-sage-600 hover:text-sage-800 transition-colors"
            >
              {t.terms}
            </Link>
            <Link
              href="/contact"
              className="text-sage-600 hover:text-sage-800 transition-colors"
            >
              {t.contact}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
