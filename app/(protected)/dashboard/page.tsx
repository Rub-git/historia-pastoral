'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HandHeart,
  Clock,
  Users,
  Heart,
} from 'lucide-react';
import Image from 'next/image';
import { WelcomeModal } from '@/components/welcome-modal';

interface DashboardData {
  pendingFollowUps: any[];
  inactiveMembers: any[];
  sensitiveCases: any[];
  observationCases: any[];
  totalMembers: number;
  thresholdDays: number;
}

interface PriorityPerson {
  id: string;
  firstName: string;
  lastName: string;
  priority: 'sensitive' | 'followup' | 'accompaniment' | 'attention';
  reason: string;
  daysInfo?: number;
}

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const { t, language } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysAgo = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Build priority list: people first, max 5
  const getPriorityPeople = (): PriorityPerson[] => {
    const people: PriorityPerson[] = [];
    
    // 1. Sensitive cases first (highest priority)
    data?.sensitiveCases?.slice(0, 2).forEach(member => {
      people.push({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        priority: 'sensitive',
        reason: language === 'es' ? 'Caso sensible activo' : 'Active sensitive case',
      });
    });

    // 2. Pending follow-ups
    data?.pendingFollowUps?.slice(0, 2).forEach(record => {
      if (people.length < 5 && !people.find(p => p.id === record.member?.id)) {
        people.push({
          id: record.member?.id,
          firstName: record.member?.firstName,
          lastName: record.member?.lastName,
          priority: 'followup',
          reason: language === 'es' ? 'Seguimiento recomendado' : 'Follow-up recommended',
          daysInfo: getDaysAgo(record.followUpDate) ?? undefined,
        });
      }
    });

    // 3. Under observation (close accompaniment)
    data?.observationCases?.slice(0, 2).forEach(member => {
      if (people.length < 5 && !people.find(p => p.id === member.id)) {
        people.push({
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          priority: 'accompaniment',
          reason: language === 'es' ? 'En acompañamiento cercano' : 'In close accompaniment',
        });
      }
    });

    // 4. Inactive members (need attention)
    data?.inactiveMembers?.slice(0, 2).forEach(member => {
      if (people.length < 5 && !people.find(p => p.id === member.id)) {
        people.push({
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          priority: 'attention',
          reason: language === 'es' ? 'Necesita atención pastoral' : 'Needs pastoral attention',
          daysInfo: getDaysAgo(member.lastContact) ?? undefined,
        });
      }
    });

    return people.slice(0, 5);
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'sensitive':
        return { bg: 'bg-red-50 border-l-4 border-red-400', badge: 'danger' as const };
      case 'followup':
        return { bg: 'bg-amber-50 border-l-4 border-amber-400', badge: 'warning' as const };
      case 'accompaniment':
        return { bg: 'bg-blue-50 border-l-4 border-blue-400', badge: 'info' as const };
      case 'attention':
        return { bg: 'bg-sage-50 border-l-4 border-sage-400', badge: 'default' as const };
      default:
        return { bg: 'bg-warm-50', badge: 'default' as const };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-sage-600">{t('loading')}</div>
      </div>
    );
  }

  const userName = (session?.user as any)?.name || session?.user?.email || '';
  const priorityPeople = getPriorityPeople();
  const hasPriorities = priorityPeople.length > 0;

  return (
    <>
      <WelcomeModal />
      <div className="space-y-8">
        {/* Welcome header */}
        <div className="flex items-center gap-4">
        <Image
          src="/logo.png"
          alt="Pastoral History"
          width={56}
          height={56}
          className="object-contain"
        />
        <div>
          <h1 className="text-2xl font-semibold text-sage-800 font-serif">
            {t('welcomeBack')}, {userName?.split?.(' ')?.[0] || ''}
          </h1>
          <p className="text-sage-600">{t('appDescription')}</p>
        </div>
      </div>

      {/* Priority Section - People First */}
      <Card className="border-sage-200">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <HandHeart className="w-6 h-6 text-sage-600" />
          <div>
            <CardTitle className="text-lg">
              {language === 'es' ? 'Personas que requieren tu atención' : 'People who need your attention'}
            </CardTitle>
            <p className="text-sm text-sage-500 font-normal mt-1">
              {language === 'es' 
                ? 'Prioridades pastorales para hoy' 
                : 'Pastoral priorities for today'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {!hasPriorities ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-sage-300 mx-auto mb-3" />
              <p className="text-sage-500">
                {language === 'es' 
                  ? 'No hay alertas pastorales pendientes. ¡Buen trabajo!' 
                  : 'No pending pastoral alerts. Great work!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorityPeople.map((person) => {
                const styles = getPriorityStyles(person.priority);
                return (
                  <Link
                    key={person.id}
                    href={`/members/${person.id}`}
                    className={`block p-4 rounded-lg ${styles.bg} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-sage-800 text-lg">
                          {person.firstName} {person.lastName}
                        </p>
                        <p className="text-sage-600 mt-1">
                          {person.reason}
                          {person.daysInfo !== undefined && (
                            <span className="text-sage-500">
                              {' · '}{person.daysInfo} {language === 'es' ? 'días' : 'days'}
                            </span>
                          )}
                        </p>
                      </div>
                      <Badge variant={styles.badge} className="shrink-0">
                        {person.priority === 'sensitive' && (language === 'es' ? 'Sensible' : 'Sensitive')}
                        {person.priority === 'followup' && (language === 'es' ? 'Seguimiento' : 'Follow-up')}
                        {person.priority === 'accompaniment' && (language === 'es' ? 'Acompañamiento' : 'Accompaniment')}
                        {person.priority === 'attention' && (language === 'es' ? 'Atención' : 'Attention')}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compact Summary - Secondary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/members?filter=sensitive" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-sage-600 mb-1">
                {language === 'es' ? 'Casos sensibles' : 'Sensitive cases'}
              </p>
              <p className="text-xl font-medium text-red-600">{data?.sensitiveCases?.length ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/members?filter=followup" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-sage-600 mb-1">
                {language === 'es' ? 'Seguimientos' : 'Follow-ups'}
              </p>
              <p className="text-xl font-medium text-amber-600">{data?.pendingFollowUps?.length ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/members?filter=observation" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-sage-600 mb-1">
                {language === 'es' ? 'Acompañamiento' : 'Accompaniment'}
              </p>
              <p className="text-xl font-medium text-blue-600">{data?.observationCases?.length ?? 0}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/members" className="block">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-sage-600 mb-1">
                {language === 'es' ? 'Total miembros' : 'Total members'}
              </p>
              <p className="text-xl font-medium text-sage-700">{data?.totalMembers ?? 0}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Action */}
      <div className="flex justify-center">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 transition-colors"
        >
          <Users className="w-5 h-5" />
          {language === 'es' ? 'Ver todos los miembros' : 'View all members'}
        </Link>
        </div>
      </div>
    </>
  );
}