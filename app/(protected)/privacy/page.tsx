'use client';

import { useLanguage } from '@/components/providers';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Privacidad y Confidencialidad',
      sections: [
        {
          text: 'Pastoral History está diseñado para respetar y proteger la privacidad, dignidad y confidencialidad de cada persona cuya información se registra en el sistema.',
          icon: Shield,
        },
        {
          text: 'Todos los datos ingresados en Pastoral History están destinados únicamente para fines de cuidado pastoral y acompañamiento espiritual. La plataforma no recopila, analiza, vende ni comparte información personal para uso comercial, de marketing o de terceros.',
          icon: Lock,
        },
        {
          text: 'Los usuarios son responsables de asegurar que cualquier información ingresada en el sistema sea manejada con discreción pastoral y de acuerdo con las leyes de privacidad aplicables y estándares éticos.',
          icon: Eye,
        },
        {
          text: 'La información sensible debe registrarse de manera reflexiva y solo cuando sea necesaria para apoyar el cuidado pastoral.',
          icon: Heart,
        },
        {
          text: 'Pastoral History implementa medidas técnicas razonables para proteger los datos almacenados; sin embargo, los usuarios son en última instancia responsables de salvaguardar sus credenciales de acceso y mantener la confidencialidad.',
          icon: Shield,
        },
      ],
      agreement: 'Al usar este sistema, usted reconoce y acepta mantener los principios de privacidad, confianza y responsabilidad ética.',
      backToSettings: 'Volver a Configuración',
    },
    en: {
      title: 'Privacy and Confidentiality',
      sections: [
        {
          text: 'Pastoral History is designed to respect and protect the privacy, dignity, and confidentiality of every individual whose information is recorded within the system.',
          icon: Shield,
        },
        {
          text: 'All data entered into Pastoral History is intended solely for pastoral care and spiritual accompaniment purposes. The platform does not collect, analyze, sell, or share personal information for commercial, marketing, or third-party use.',
          icon: Lock,
        },
        {
          text: 'Users are responsible for ensuring that any information entered into the system is handled with pastoral discretion and in accordance with applicable privacy laws and ethical standards.',
          icon: Eye,
        },
        {
          text: 'Sensitive information should be recorded thoughtfully and only when necessary to support pastoral care.',
          icon: Heart,
        },
        {
          text: 'Pastoral History implements reasonable technical measures to protect stored data; however, users are ultimately responsible for safeguarding access credentials and maintaining confidentiality.',
          icon: Shield,
        },
      ],
      agreement: 'By using this system, you acknowledge and agree to uphold the principles of privacy, trust, and ethical responsibility.',
      backToSettings: 'Back to Settings',
    },
  };

  const t = content[language] || content.es;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-sage-600" />
        </div>
        <h1 className="text-3xl font-semibold text-sage-800 font-serif">
          {t.title}
        </h1>
      </div>

      {/* Content */}
      <Card className="border-sage-200">
        <CardContent className="pt-6 space-y-6">
          {t.sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sage-500" />
                </div>
                <p className="text-sage-700 leading-relaxed pt-2">
                  {section.text}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Agreement */}
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-6 text-center">
        <p className="text-sage-700 font-medium">
          {t.agreement}
        </p>
      </div>

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
