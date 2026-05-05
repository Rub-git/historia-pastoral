'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers';
import { MemberForm } from '@/components/member-form';
import { AccompanimentForm } from '@/components/accompaniment-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  User,
  Calendar,
  Heart,
  BookOpen,
  AlertTriangle,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  Users,
  Briefcase,
  Globe,
  Church,
  Baby,
  HeartHandshake,
} from 'lucide-react';

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAccompanimentModal, setShowAccompanimentModal] = useState(false);
  const [editingAccompaniment, setEditingAccompaniment] = useState<any>(null);

  useEffect(() => {
    fetchMember();
  }, [params?.id]);

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/members/${params?.id}`);
      if (res.ok) {
        const data = await res.json();
        setMember(data);
      } else {
        router.push('/members');
      }
    } catch (error) {
      console.error('Error fetching member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/members/${params?.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/members');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const handleMemberUpdated = () => {
    setShowEditModal(false);
    fetchMember();
  };

  const handleAccompanimentSaved = () => {
    setShowAccompanimentModal(false);
    setEditingAccompaniment(null);
    fetchMember();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStateLabel = (state: string) => {
    const key = `state_${state}` as keyof typeof import('@/lib/i18n').translations.es;
    return t(key);
  };

  const getStageLabel = (stage: string) => {
    const key = `stage_${stage}` as keyof typeof import('@/lib/i18n').translations.es;
    return t(key);
  };

  const getTypeLabel = (type: string) => {
    const key = `type_${type}` as keyof typeof import('@/lib/i18n').translations.es;
    return t(key);
  };

  const getMaritalLabel = (status: string) => {
    if (!status) return null;
    const key = `marital_${status}` as keyof typeof import('@/lib/i18n').translations.es;
    return t(key);
  };

  const getEmploymentLabel = (status: string) => {
    if (!status) return null;
    const key = `employment_${status}` as keyof typeof import('@/lib/i18n').translations.es;
    return t(key);
  };

  const hasPersonalContext = () => {
    return member?.maritalStatus || member?.employmentStatus || member?.occupation || 
           member?.hasChildren || member?.previousChurch || member?.countryOfOrigin;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-sage-600">{t('loading')}</div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/members')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            {t('edit')}
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            {t('delete')}
          </Button>
        </div>
      </div>

      {/* Member Header */}
      <Card>
        <CardContent className="flex items-start gap-6 py-6">
          <div className="w-20 h-20 rounded-2xl bg-sage-100 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-sage-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-sage-800 font-serif">
                {member?.firstName} {member?.lastName}
              </h1>
              {member?.isSensitive && (
                <Badge variant="danger">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {language === 'es' ? 'Sensible' : 'Sensitive'}
                </Badge>
              )}
              {member?.underObservation && (
                <Badge variant="info">
                  <Eye className="w-3 h-3 mr-1" />
                  {language === 'es' ? 'Observación' : 'Observation'}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-sage-600">
              {member?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {member.email}
                </span>
              )}
              {member?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {member.phone}
                </span>
              )}
              {member?.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {member.address}
                </span>
              )}
            </div>
            {member?.notes && (
              <p className="mt-3 text-sage-600 text-sm">{member.notes}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spiritual History */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Heart className="w-5 h-5 text-sage-600" />
          <CardTitle>{t('spiritualHistory')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-sage-500">{t('spiritualState')}</p>
              <p className="font-medium text-sage-800">
                {getStateLabel(member?.spiritualHistory?.spiritualState ?? 'active')}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage-500">{t('growthStage')}</p>
              <p className="font-medium text-sage-800">
                {getStageLabel(member?.spiritualHistory?.growthStage ?? 'initial')}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage-500">{t('conversionDate')}</p>
              <p className="font-medium text-sage-800">
                {formatDate(member?.spiritualHistory?.conversionDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-sage-500">{t('baptismDate')}</p>
              <p className="font-medium text-sage-800">
                {formatDate(member?.spiritualHistory?.baptismDate)}
              </p>
            </div>
          </div>

          {member?.spiritualHistory?.spiritualGifts && (
            <div>
              <p className="text-sm text-sage-500 mb-1">{t('spiritualGifts')}</p>
              <p className="text-sage-800">{member.spiritualHistory.spiritualGifts}</p>
            </div>
          )}

          {member?.spiritualHistory?.growthAreas && (
            <div>
              <p className="text-sm text-sage-500 mb-1">{t('growthAreas')}</p>
              <p className="text-sage-800">{member.spiritualHistory.growthAreas}</p>
            </div>
          )}

          {member?.spiritualHistory?.confidentialObs && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-700 mb-1 font-medium">{t('confidentialObs')}</p>
              <p className="text-amber-900">{member.spiritualHistory.confidentialObs}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personal and Family Context */}
      {hasPersonalContext() && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <HeartHandshake className="w-5 h-5 text-sage-600" />
            <div>
              <CardTitle>{t('personalContext')}</CardTitle>
              <p className="text-sm text-sage-500 mt-0.5">{t('personalContextSubtitle')}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {member?.maritalStatus && (
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-sage-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-sage-500">{t('maritalStatus')}</p>
                    <p className="font-medium text-sage-800">{getMaritalLabel(member.maritalStatus)}</p>
                  </div>
                </div>
              )}
              {member?.employmentStatus && (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-sage-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-sage-500">{t('employmentStatus')}</p>
                    <p className="font-medium text-sage-800">{getEmploymentLabel(member.employmentStatus)}</p>
                  </div>
                </div>
              )}
              {member?.occupation && (
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-sage-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-sage-500">{t('occupation')}</p>
                    <p className="font-medium text-sage-800">{member.occupation}</p>
                  </div>
                </div>
              )}
              {member?.hasChildren && (
                <div className="flex items-start gap-2">
                  <Baby className="w-4 h-4 text-sage-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-sage-500">{t('hasChildren')}</p>
                    <p className="font-medium text-sage-800">{member.hasChildren}</p>
                  </div>
                </div>
              )}
              {member?.countryOfOrigin && (
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-sage-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-sage-500">{t('countryOfOrigin')}</p>
                    <p className="font-medium text-sage-800">{member.countryOfOrigin}</p>
                  </div>
                </div>
              )}
            </div>
            
            {member?.previousChurch && (
              <div className="flex items-start gap-2 pt-2 border-t border-sage-100">
                <Church className="w-4 h-4 text-sage-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-sage-500 mb-1">{t('previousChurch')}</p>
                  <p className="text-sage-800">{member.previousChurch}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Accompaniment Registry */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-sage-600" />
            <CardTitle>{t('accompanimentRegistry')}</CardTitle>
          </div>
          <Button onClick={() => setShowAccompanimentModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newAccompaniment')}
          </Button>
        </CardHeader>
        <CardContent>
          {(member?.accompaniments?.length ?? 0) === 0 ? (
            <p className="text-sage-500 text-sm py-4 text-center">{t('noRecords')}</p>
          ) : (
            <div className="space-y-4">
              {member?.accompaniments?.map?.((record: any) => (
                <div
                  key={record?.id}
                  className="p-4 rounded-lg bg-warm-50 hover:bg-warm-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setEditingAccompaniment(record);
                    setShowAccompanimentModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="default">{getTypeLabel(record?.encounterType)}</Badge>
                      <span className="text-sm text-sage-600">
                        {formatDate(record?.encounterDate)}
                      </span>
                    </div>
                    {record?.followUpDate && (
                      <div className="flex items-center gap-1 text-sm">
                        {record?.followUpCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600" />
                        )}
                        <span className={record?.followUpCompleted ? 'text-green-600' : 'text-amber-600'}>
                          {formatDate(record?.followUpDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  {record?.reason && (
                    <p className="text-sm text-sage-700 mb-1">
                      <strong>{t('mainReason')}:</strong> {record.reason}
                    </p>
                  )}
                  {record?.observations && (
                    <p className="text-sm text-sage-600 line-clamp-2">{record.observations}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('editMember')}
        className="max-w-2xl"
      >
        <MemberForm
          member={member}
          onSuccess={handleMemberUpdated}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('confirmDelete')}
      >
        <div className="space-y-4">
          <p className="text-sage-600">{t('deleteWarning')}</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Accompaniment Modal */}
      <Modal
        isOpen={showAccompanimentModal}
        onClose={() => {
          setShowAccompanimentModal(false);
          setEditingAccompaniment(null);
        }}
        title={editingAccompaniment ? t('editAccompaniment') : t('newAccompaniment')}
        className="max-w-xl"
      >
        <AccompanimentForm
          memberId={params?.id}
          record={editingAccompaniment}
          onSuccess={handleAccompanimentSaved}
          onCancel={() => {
            setShowAccompanimentModal(false);
            setEditingAccompaniment(null);
          }}
        />
      </Modal>
    </div>
  );
}