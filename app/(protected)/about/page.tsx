'use client';

import { useLanguage } from '@/components/providers';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, BookOpen, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  const { language } = useLanguage();

  const content = {
    es: {
      title: 'Acerca de Pastoral History',
      intro: 'Pastoral History es un sistema web diseñado para ayudar a pastores y capellanes a acompañar de manera ética y compasiva a las personas a lo largo de su camino espiritual.',
      description: 'Inspirado en la estructura y ética del expediente clínico—pero centrado en el cuidado espiritual—Pastoral History proporciona un espacio seguro y reflexivo para registrar encuentros pastorales, procesos espirituales y seguimiento continuo con integridad y respeto.',
      notAbout: 'Esta plataforma no se trata de control, métricas o vigilancia. Existe para apoyar la memoria pastoral, el discernimiento y la continuidad del cuidado—para que ninguna historia, lucha o camino sea olvidado.',
      honor: 'Pastoral History honra la dignidad humana, la confidencialidad y la confianza. Está construido para líderes espirituales que creen que cuidar bien requiere escuchar profundamente, recordar fielmente y caminar junto a otros con compasión.',
      values: [
        { title: 'Cuidado sobre control', icon: Heart },
        { title: 'Memoria sobre burocracia', icon: BookOpen },
        { title: 'Compasión sobre métricas', icon: Shield },
      ],
    },
    en: {
      title: 'About Pastoral History',
      intro: 'Pastoral History is a web-based system designed to help pastors and chaplains ethically and compassionately accompany people throughout their spiritual journey.',
      description: 'Inspired by the structure and ethics of a clinical record—but centered on spiritual care—Pastoral History provides a safe and thoughtful space to record pastoral encounters, spiritual processes, and ongoing follow-up with integrity and respect.',
      notAbout: 'This platform is not about control, metrics, or surveillance. It exists to support pastoral memory, discernment, and continuity of care—so that no story, struggle, or journey is forgotten.',
      honor: 'Pastoral History honors human dignity, confidentiality, and trust. It is built for spiritual leaders who believe that caring well requires listening deeply, remembering faithfully, and walking alongside others with compassion.',
      values: [
        { title: 'Care over control', icon: Heart },
        { title: 'Memory over bureaucracy', icon: BookOpen },
        { title: 'Compassion over metrics', icon: Shield },
      ],
    },
  };

  const t = content[language] || content.es;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header with Logo */}
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="Pastoral History"
          width={120}
          height={120}
          className="mx-auto mb-6 object-contain"
        />
        <h1 className="text-3xl font-semibold text-sage-800 font-serif">
          {t.title}
        </h1>
      </div>

      {/* Main Content */}
      <Card className="border-sage-200">
        <CardContent className="prose prose-sage max-w-none space-y-6 pt-6">
          <p className="text-lg text-sage-700 leading-relaxed">
            {t.intro}
          </p>
          
          <p className="text-sage-600 leading-relaxed">
            {t.description}
          </p>
          
          <p className="text-sage-600 leading-relaxed italic border-l-4 border-sage-300 pl-4">
            {t.notAbout}
          </p>
          
          <p className="text-sage-600 leading-relaxed">
            {t.honor}
          </p>
        </CardContent>
      </Card>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {t.values.map((value, index) => {
          const Icon = value.icon;
          return (
            <Card key={index} className="border-sage-200 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-sage-600" />
                </div>
                <p className="font-medium text-sage-800 font-serif">
                  {value.title}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ethics Link */}
      <Link
        href="/ethics"
        className="block bg-sage-100 border border-sage-200 rounded-xl p-6 hover:bg-sage-50 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center group-hover:bg-sage-300 transition-colors">
              <Heart className="w-6 h-6 text-sage-700" />
            </div>
            <div>
              <p className="font-medium text-sage-800 font-serif">
                {language === 'es' ? 'Ética Pastoral y Descargo' : 'Pastoral Ethics & Disclaimer'}
              </p>
              <p className="text-sm text-sage-600">
                {language === 'es' 
                  ? 'Conoce los principios que guían esta herramienta' 
                  : 'Learn the principles that guide this tool'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-sage-500 group-hover:text-sage-700 transition-colors" />
        </div>
      </Link>
    </div>
  );
}
