'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Mail, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/components/providers';

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, language }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
      <Card className="w-full max-w-md border-sage-200">
        <CardHeader className="text-center space-y-4">
          <Image
            src="/logo.png"
            alt="Pastoral History"
            width={120}
            height={120}
            className="mx-auto object-contain"
          />
          <CardTitle className="text-2xl font-serif text-sage-800">
            Recuperar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-sage-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sage-800 font-medium">
                  ¡Revisa tu correo!
                </p>
                <p className="text-sage-600 text-sm">
                  Si existe una cuenta con el correo <strong>{email}</strong>, 
                  recibirás un enlace para restablecer tu contraseña.
                </p>
                <p className="text-sage-500 text-xs mt-4">
                  El enlace expira en 1 hora.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sage-600 text-sm text-center">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {error && <Alert variant="error">{error}</Alert>}

              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-sage-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
