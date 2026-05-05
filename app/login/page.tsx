'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Mail, Lock } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t('loginError'));
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-sage-50 flex flex-col">
      {/* Language toggle */}
      <div className="absolute top-4 right-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
          className="px-3 py-1.5 rounded-lg border border-sage-200 bg-white text-sm text-sage-700"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Pastoral History"
                width={180}
                height={180}
                className="object-contain"
                priority
              />
            </div>
            <p className="text-sage-600 mt-1">{t('appDescription')}</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-sage-100 p-8">
            <h2 className="text-xl font-semibold text-sage-800 mb-6 font-serif">{t('login')}</h2>

            {error && (
              <Alert variant="error" className="mb-6">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <Input
                  type="email"
                  placeholder={t('email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
                <Input
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12"
                />
              </div>

              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-sage-600 hover:text-sage-800 hover:underline transition-colors"
                >
                  {language === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t('loading') : t('login')}
              </Button>
            </form>

            <p className="text-center mt-6 text-sm text-sage-600">
              {t('noAccount')}{' '}
              <Link href="/signup" className="text-sage-700 font-medium hover:underline">
                {t('signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}