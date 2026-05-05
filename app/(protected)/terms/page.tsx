'use client';

import { useLanguage } from '@/components/providers';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Scale, AlertCircle, UserCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Términos de Uso',
      sections: [
        {
          text: 'Pastoral History se proporciona como una herramienta para apoyar el cuidado pastoral, el acompañamiento espiritual y la organización ministerial.',
          icon: FileText,
        },
        {
          text: 'Al usar este sistema, usted acepta usarlo de manera responsable, ética y consistente con la integridad pastoral y las leyes aplicables.',
          icon: Scale,
        },
        {
          text: 'Pastoral History no proporciona asesoramiento médico, psicológico, legal o clínico. Cualquier nota pastoral, observación o registro es solo para referencia ministerial personal.',
          icon: AlertCircle,
        },
        {
          text: 'Los usuarios son los únicos responsables de la exactitud, idoneidad y manejo ético de la información que ingresan.',
          icon: UserCheck,
        },
        {
          text: 'Los desarrolladores y proveedores de Pastoral History no son responsables de las decisiones, acciones o resultados derivados del uso o mal uso de la plataforma.',
          icon: ShieldAlert,
        },
        {
          text: 'El mal uso del sistema, incluyendo la recopilación de datos no ética, el intercambio no autorizado de información o la violación de la confidencialidad, puede resultar en la suspensión o terminación del acceso.',
          icon: ShieldAlert,
        },
      ],
      agreement: 'El uso continuado de Pastoral History constituye la aceptación de estos términos.',
      backToSettings: 'Volver a Configuración',
    },
    en: {
      title: 'Terms of Use',
      sections: [
        {
          text: 'Pastoral History is provided as a tool to support pastoral care, spiritual accompaniment, and ministry organization.',
          icon: FileText,
        },
        {
          text: 'By using this system, you agree to use it responsibly, ethically, and in a manner consistent with pastoral integrity and applicable laws.',
          icon: Scale,
        },
        {
          text: 'Pastoral History does not provide medical, psychological, legal, or clinical advice. Any pastoral notes, observations, or records are for personal ministerial reference only.',
          icon: AlertCircle,
        },
        {
          text: 'Users are solely responsible for the accuracy, appropriateness, and ethical handling of the information they enter.',
          icon: UserCheck,
        },
        {
          text: 'The developers and providers of Pastoral History are not liable for decisions, actions, or outcomes resulting from the use or misuse of the platform.',
          icon: ShieldAlert,
        },
        {
          text: 'Misuse of the system, including unethical data collection, unauthorized sharing of information, or violation of confidentiality, may result in suspension or termination of access.',
          icon: ShieldAlert,
        },
      ],
      agreement: 'Continued use of Pastoral History constitutes acceptance of these terms.',
      backToSettings: 'Back to Settings',
    },
  };

  const t = content[language] || content.es;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-sage-600" />
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
