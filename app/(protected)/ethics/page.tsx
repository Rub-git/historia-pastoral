'use client';

import { useLanguage } from '@/components/providers';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, HandHeart, BookOpen, AlertTriangle, Users, Stethoscope } from 'lucide-react';
import Link from 'next/link';

export default function EthicsPage() {
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Ética Pastoral y Descargo',
      subtitle: 'El corazón de nuestro compromiso',
      sections: [
        {
          text: 'Pastoral History está fundamentado en la creencia de que el cuidado pastoral es relacional, espiritual y profundamente humano.',
          icon: Heart,
        },
        {
          text: 'Este sistema no pretende reemplazar la oración, la sabiduría pastoral, el discernimiento espiritual o la presencia personal. Es una herramienta de apoyo—no un sustituto de la responsabilidad pastoral.',
          icon: HandHeart,
        },
        {
          text: 'La información registrada en Pastoral History nunca debe usarse para controlar, manipular, evaluar o coaccionar a las personas.',
          icon: AlertTriangle,
          highlight: true,
        },
        {
          text: 'Las notas pastorales no son diagnósticos, juicios o clasificaciones. Son reflexiones destinadas a apoyar la continuidad del cuidado y el acompañamiento compasivo.',
          icon: BookOpen,
        },
        {
          text: 'Se anima a los usuarios a ejercer humildad, discreción y responsabilidad ética en cada interacción y registro.',
          icon: Users,
        },
        {
          text: 'Cuando las situaciones excedan el ámbito pastoral—como crisis de salud mental, condiciones médicas o asuntos legales—se recomienda encarecidamente la derivación profesional apropiada.',
          icon: Stethoscope,
        },
      ],
      commitment: 'Al usar Pastoral History, usted afirma un compromiso con la ética pastoral, la confidencialidad y la dignidad de cada persona.',
      backToAbout: 'Volver a Acerca de',
    },
    en: {
      title: 'Pastoral Ethics and Disclaimer',
      subtitle: 'The heart of our commitment',
      sections: [
        {
          text: 'Pastoral History is grounded in the belief that pastoral care is relational, spiritual, and deeply human.',
          icon: Heart,
        },
        {
          text: 'This system is not intended to replace prayer, pastoral wisdom, spiritual discernment, or personal presence. It is a support tool—not a substitute for pastoral responsibility.',
          icon: HandHeart,
        },
        {
          text: 'Information recorded in Pastoral History should never be used to control, manipulate, evaluate, or coerce individuals.',
          icon: AlertTriangle,
          highlight: true,
        },
        {
          text: 'Pastoral notes are not diagnoses, judgments, or classifications. They are reflections intended to support continuity of care and compassionate accompaniment.',
          icon: BookOpen,
        },
        {
          text: 'Users are encouraged to exercise humility, discretion, and ethical responsibility in every interaction and record.',
          icon: Users,
        },
        {
          text: 'When situations exceed pastoral scope—such as mental health crises, medical conditions, or legal matters—appropriate professional referral is strongly advised.',
          icon: Stethoscope,
        },
      ],
      commitment: 'By using Pastoral History, you affirm a commitment to pastoral ethics, confidentiality, and the dignity of every person.',
      backToAbout: 'Back to About',
    },
  };

  const t = content[language] || content.es;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-sage-600" />
        </div>
        <h1 className="text-3xl font-semibold text-sage-800 font-serif">
          {t.title}
        </h1>
        <p className="text-sage-600 mt-2 italic">{t.subtitle}</p>
      </div>

      {/* Content */}
      <Card className="border-sage-200">
        <CardContent className="pt-6 space-y-6">
          {t.sections.map((section, index) => {
            const Icon = section.icon;
            const isHighlight = (section as any).highlight;
            return (
              <div 
                key={index} 
                className={`flex gap-4 ${isHighlight ? 'bg-amber-50 border border-amber-200 rounded-lg p-4 -mx-2' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isHighlight ? 'bg-amber-100' : 'bg-sage-50'}`}>
                  <Icon className={`w-5 h-5 ${isHighlight ? 'text-amber-600' : 'text-sage-500'}`} />
                </div>
                <p className={`leading-relaxed pt-2 ${isHighlight ? 'text-amber-800 font-medium' : 'text-sage-700'}`}>
                  {section.text}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Commitment */}
      <div className="bg-sage-100 border border-sage-200 rounded-xl p-6 text-center">
        <Heart className="w-6 h-6 text-sage-600 mx-auto mb-3" />
        <p className="text-sage-800 font-medium font-serif">
          {t.commitment}
        </p>
      </div>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/about"
          className="text-sage-600 hover:text-sage-800 transition-colors"
        >
          ← {t.backToAbout}
        </Link>
      </div>
    </div>
  );
}
