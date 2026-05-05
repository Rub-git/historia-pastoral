'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './providers';
import { Button } from './ui/button';
import { X, Heart } from 'lucide-react';
import Image from 'next/image';

const WELCOME_SEEN_KEY = 'pastoral_history_welcome_seen';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
    // Check if user has seen the welcome message
    const hasSeenWelcome = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setIsOpen(false);
  };

  const content = {
    es: {
      title: 'Bienvenido a Pastoral History',
      intro: 'Pastoral History es un espacio creado para apoyar el cuidado pastoral reflexivo, ético y compasivo.',
      purpose: 'Este sistema está diseñado para ayudarte a recordar historias, acompañar a las personas fielmente y mantener la continuidad en tu ministerio pastoral—sin reducir a los individuos a datos o métricas.',
      guidance: 'Todo lo registrado aquí debe estar guiado por la oración, el discernimiento, la confidencialidad y el respeto por la dignidad humana.',
      disclaimer: 'Pastoral History no reemplaza el juicio pastoral ni el discernimiento espiritual. Existe para apoyarlos.',
      thanks: 'Gracias por servir con cuidado, integridad y compasión.',
      begin: 'Comenzar',
    },
    en: {
      title: 'Welcome to Pastoral History',
      intro: 'Pastoral History is a space created to support thoughtful, ethical, and compassionate pastoral care.',
      purpose: 'This system is designed to help you remember stories, accompany people faithfully, and maintain continuity in your pastoral ministry—without reducing individuals to data or metrics.',
      guidance: 'Everything recorded here should be guided by prayer, discernment, confidentiality, and respect for human dignity.',
      disclaimer: 'Pastoral History does not replace pastoral judgment or spiritual discernment. It exists to support them.',
      thanks: 'Thank you for serving with care, integrity, and compassion.',
      begin: 'Begin',
    },
  };

  const t = content[language] || content.es;

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-sage-900/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-warm-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-sage-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-sage-400 hover:text-sage-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Logo */}
          <div className="text-center">
            <Image
              src="/logo.png"
              alt="Pastoral History"
              width={100}
              height={100}
              className="mx-auto object-contain"
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-sage-800 text-center font-serif">
            {t.title}
          </h2>

          {/* Body */}
          <div className="space-y-4 text-sage-700">
            <p className="leading-relaxed">
              {t.intro}
            </p>
            
            <p className="leading-relaxed">
              {t.purpose}
            </p>
            
            <p className="leading-relaxed italic border-l-4 border-sage-300 pl-4 py-2 bg-sage-50 rounded-r">
              {t.guidance}
            </p>
            
            <p className="leading-relaxed text-sage-600 text-sm">
              {t.disclaimer}
            </p>
          </div>

          {/* Thanks */}
          <div className="text-center pt-2">
            <p className="text-sage-600 flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-sage-500" />
              {t.thanks}
              <Heart className="w-4 h-4 text-sage-500" />
            </p>
          </div>

          {/* Button */}
          <div className="pt-2">
            <Button 
              onClick={handleClose}
              className="w-full"
            >
              {t.begin}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
