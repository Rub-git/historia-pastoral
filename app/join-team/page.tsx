'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/components/providers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function JoinTeamContent() {
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { data: session, status } = useSession() || {};
  
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<{
    email: string;
    role: string;
    ownerName: string;
    ownerEmail: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(language === 'es' ? 'Token de invitación no válido' : 'Invalid invitation token');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const res = await fetch(`/api/team/invitation/${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setInvitation(data);
        } else {
          setError(data.error || (language === 'es' ? 'Invitación no válida' : 'Invalid invitation'));
        }
      } catch (err) {
        setError(language === 'es' ? 'Error al cargar la invitación' : 'Error loading invitation');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, language]);

  const handleAccept = async () => {
    if (!token) return;
    
    setAccepting(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/team/invitation/${token}`, {
        method: 'POST',
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/discipleship');
        }, 2000);
      } else {
        setError(data.error || (language === 'es' ? 'Error al aceptar' : 'Error accepting'));
      }
    } catch (err) {
      setError(language === 'es' ? 'Error al aceptar la invitación' : 'Error accepting invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-warm-50">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  // Not logged in
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-warm-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="w-12 h-12 text-sage-600 mx-auto mb-2" />
            <CardTitle>{language === 'es' ? 'Invitación de Equipo' : 'Team Invitation'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sage-600">
              {language === 'es' 
                ? 'Debes iniciar sesión o crear una cuenta para unirte al equipo.'
                : 'You must log in or create an account to join the team.'}
            </p>
            <div className="flex gap-2">
              <Link href={`/login?callbackUrl=/join-team?token=${token}`} className="flex-1">
                <Button className="w-full">
                  {language === 'es' ? 'Iniciar Sesión' : 'Log In'}
                </Button>
              </Link>
              <Link href={`/signup?callbackUrl=/join-team?token=${token}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  {language === 'es' ? 'Crear Cuenta' : 'Sign Up'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-warm-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-700">
              {language === 'es' ? 'Error de Invitación' : 'Invitation Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sage-600">{error}</p>
            <Link href="/dashboard">
              <Button variant="outline">
                {language === 'es' ? 'Ir al Inicio' : 'Go to Home'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-warm-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-green-700">
              {language === 'es' ? '¡Te has unido al equipo!' : 'You joined the team!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sage-600 mb-4">
              {language === 'es' 
                ? 'Redirigiendo al módulo de Discipulado...'
                : 'Redirecting to Discipleship module...'}
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-sage-600 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show invitation details
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-warm-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="w-12 h-12 text-sage-600 mx-auto mb-2" />
          <CardTitle>
            {language === 'es' ? 'Invitación de Equipo' : 'Team Invitation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-sage-50 p-4 rounded-lg text-center">
            <p className="text-sage-600 mb-2">
              {language === 'es' ? 'Has sido invitado por:' : 'You have been invited by:'}
            </p>
            <p className="text-xl font-semibold text-sage-800">{invitation?.ownerName}</p>
            <p className="text-sm text-sage-500">{invitation?.ownerEmail}</p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">
              {language === 'es' ? 'Rol asignado:' : 'Assigned role:'}
            </p>
            <p className="font-semibold text-blue-800">
              {invitation?.role === 'admin' 
                ? (language === 'es' ? 'Admin (acceso total)' : 'Admin (full access)')
                : (language === 'es' ? 'Líder (acceso a Discipulado y Ministerios)' : 'Leader (access to Discipleship and Ministries)')}
            </p>
          </div>

          {session?.user?.email !== invitation?.email && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-700">
              {language === 'es' 
                ? `Esta invitación es para ${invitation?.email}. Estás conectado como ${session?.user?.email}.`
                : `This invitation is for ${invitation?.email}. You are logged in as ${session?.user?.email}.`}
            </Alert>
          )}

          <div className="flex gap-2 pt-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </Button>
            </Link>
            <Button 
              className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]"
              onClick={handleAccept}
              disabled={accepting || session?.user?.email !== invitation?.email}
            >
              {accepting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {language === 'es' ? 'Aceptar' : 'Accept'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    }>
      <JoinTeamContent />
    </Suspense>
  );
}
