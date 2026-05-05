'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/providers';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Give time for webhook to process
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  const content = {
    es: {
      title: '¡Gracias por tu suscripción!',
      subtitle: 'Tu suscripción ha sido activada exitosamente.',
      description: 'Ahora tienes acceso completo a todas las funcionalidades de Pastoral History. Puedes comenzar a registrar y acompañar a las personas de tu ministerio.',
      dashboard: 'Ir al Dashboard',
      processing: 'Procesando tu pago...',
    },
    en: {
      title: 'Thank you for your subscription!',
      subtitle: 'Your subscription has been successfully activated.',
      description: 'You now have full access to all Pastoral History features. You can start recording and accompanying people in your ministry.',
      dashboard: 'Go to Dashboard',
      processing: 'Processing your payment...',
    },
  };

  const c = content[language];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-sage-600 mb-4" />
            <p className="text-sage-600">{c.processing}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <Card className="w-full max-w-md border-sage-200">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-sage-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-sage-600" />
          </div>
          <Image
            src="/logo.png"
            alt="Pastoral History"
            width={80}
            height={80}
            className="mx-auto object-contain"
          />
          <CardTitle className="text-2xl font-serif text-sage-800">
            {c.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-sage-700 font-medium">
            {c.subtitle}
          </p>
          <p className="text-sage-600 text-sm">
            {c.description}
          </p>
          <Link href="/dashboard">
            <Button className="w-full">
              {c.dashboard}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <Loader2 className="w-12 h-12 animate-spin text-sage-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
