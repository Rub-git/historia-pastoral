'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setValidating(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const res = await fetch(`/api/auth/validate-reset-token?token=${token}`);
      setTokenValid(res.ok);
    } catch {
      setTokenValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-sage-600">Validando enlace...</div>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="space-y-2">
          <p className="text-sage-800 font-medium">
            Enlace inválido o expirado
          </p>
          <p className="text-sage-600 text-sm">
            El enlace de recuperación no es válido o ya ha expirado. 
            Por favor, solicita uno nuevo.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-800 transition-colors"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-sage-600" />
        </div>
        <div className="space-y-2">
          <p className="text-sage-800 font-medium">
            ¡Contraseña actualizada!
          </p>
          <p className="text-sage-600 text-sm">
            Tu contraseña ha sido restablecida exitosamente. 
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full">
            Ir a iniciar sesión
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sage-600 text-sm text-center">
        Ingresa tu nueva contraseña.
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="Nueva contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Mínimo 6 caracteres"
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        placeholder="Repite tu contraseña"
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Guardando...' : 'Restablecer contraseña'}
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
  );
}

export default function ResetPasswordPage() {
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
            Restablecer Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-8"><div className="animate-pulse text-sage-600">Cargando...</div></div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
