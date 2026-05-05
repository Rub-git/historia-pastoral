'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { MemberForm } from '@/components/member-form';
import {
  Search,
  Plus,
  User,
  AlertTriangle,
  Eye,
  ChevronRight,
  Download,
} from 'lucide-react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isSensitive: boolean;
  underObservation: boolean;
  spiritualHistory?: {
    spiritualState: string;
  };
}

export default function MembersPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const fetchMembers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/members?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data ?? []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateLabel = (state: string) => {
    const key = `state_${state}` as keyof typeof import('@/lib/i18n').translations.es;
    return t(key);
  };

  const getStateBadgeVariant = (state: string) => {
    switch (state) {
      case 'in_crisis':
        return 'danger';
      case 'restoration':
        return 'warning';
      case 'active':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleMemberCreated = () => {
    setShowAddModal(false);
    fetchMembers();
  };

  const downloadMembersList = () => {
    const header = 'Nombre,Apellido,Email,Teléfono,Estado Espiritual,Bajo Observación,Sensible';
    const rows = members.map(m => {
      const state = m.spiritualHistory?.spiritualState || '';
      const observation = m.underObservation ? 'Sí' : 'No';
      const sensitive = m.isSensitive ? 'Sí' : 'No';
      return `"${m.firstName}","${m.lastName || ''}","${m.email || ''}","${m.phone || ''}","${state}","${observation}","${sensitive}"`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `miembros_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-sage-800 font-serif">{t('members')}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={downloadMembersList}
            disabled={members.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Descargar CSV' : 'Download CSV'}
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addMember')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage-400" />
        <Input
          placeholder={t('searchMembers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12"
        />
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-sage-600">{t('loading')}</div>
        </div>
      ) : (members?.length ?? 0) === 0 ? (
        <Card className="py-12 text-center">
          <User className="w-12 h-12 text-sage-300 mx-auto mb-4" />
          <p className="text-sage-600">{t('noMembersFound')}</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {members?.map?.((member) => (
            <Card
              key={member?.id}
              onClick={() => router.push(`/members/${member?.id}`)}
              className="hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-sage-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sage-800">
                      {member?.firstName} {member?.lastName}
                    </h3>
                    <p className="text-sm text-sage-600">
                      {member?.email || member?.phone || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {member?.isSensitive && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  {member?.underObservation && (
                    <Eye className="w-5 h-5 text-blue-500" />
                  )}
                  {member?.spiritualHistory?.spiritualState && (
                    <Badge variant={getStateBadgeVariant(member?.spiritualHistory?.spiritualState)}>
                      {getStateLabel(member?.spiritualHistory?.spiritualState)}
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-sage-400" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('addMember')}
        className="max-w-2xl"
      >
        <MemberForm onSuccess={handleMemberCreated} onCancel={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}