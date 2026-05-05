'use client';

import { useLanguage } from '@/components/providers';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Contacto',
      subtitle: 'Estamos aquí para ayudarte',
      intro: 'Si tienes preguntas, sugerencias o necesitas asistencia con Pastoral History, no dudes en comunicarte con nosotros.',
      phoneLabel: 'Teléfono',
      emailLabel: 'Correo electrónico',
      responseNote: 'Respondemos dentro de 24-48 horas hábiles.',
      backToSettings: 'Volver a Configuración',
    },
    en: {
      title: 'Contact',
      subtitle: 'We are here to help',
      intro: 'If you have questions, suggestions, or need assistance with Pastoral History, please don\'t hesitate to reach out.',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      responseNote: 'We respond within 24-48 business hours.',
      backToSettings: 'Back to Settings',
    },
  };

  const t = content[language] || content.es;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-sage-600" />
        </div>
        <h1 className="text-3xl font-semibold text-sage-800 font-serif">
          {t.title}
        </h1>
        <p className="text-sage-600 mt-2">{t.subtitle}</p>
      </div>

      {/* Intro */}
      <p className="text-center text-sage-700">
        {t.intro}
      </p>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone */}
        <Card className="border-sage-200">
          <CardContent className="pt-6">
            <a 
              href="tel:+19097091281"
              className="flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mb-3 group-hover:bg-sage-200 transition-colors">
                <Phone className="w-6 h-6 text-sage-600" />
              </div>
              <p className="text-xs text-sage-500 mb-1">{t.phoneLabel}</p>
              <p className="text-base font-medium text-sage-800 group-hover:text-sage-600 transition-colors">
                (909) 709-1281
              </p>
            </a>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-sage-200">
          <CardContent className="pt-6">
            <a 
              href="mailto:soporte@prospectosdigitales.com"
              className="flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mb-3 group-hover:bg-sage-200 transition-colors">
                <Mail className="w-6 h-6 text-sage-600" />
              </div>
              <p className="text-xs text-sage-500 mb-1">{t.emailLabel}</p>
              <p className="text-sm font-medium text-sage-800 group-hover:text-sage-600 transition-colors break-all">
                soporte@prospectosdigitales.com
              </p>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Response Note */}
      <p className="text-center text-sm text-sage-500 italic">
        {t.responseNote}
      </p>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/settings"
          className="text-sage-600 hover:text-sage-800 transition-colors"
        >
          ← {t.backToSettings}
        </Link>
      </div>
    </div>
  );
}
