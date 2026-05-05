'use client';

import { useState } from 'react';
import { useLanguage } from './providers';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { spiritualStates, growthStages, maritalStatuses, employmentStatuses } from '@/lib/i18n';

interface MemberFormProps {
  member?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MemberForm({ member, onSuccess, onCancel }: MemberFormProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: member?.firstName ?? '',
    lastName: member?.lastName ?? '',
    email: member?.email ?? '',
    phone: member?.phone ?? '',
    address: member?.address ?? '',
    birthDate: member?.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
    notes: member?.notes ?? '',
    // Personal and family context
    maritalStatus: member?.maritalStatus ?? '',
    employmentStatus: member?.employmentStatus ?? '',
    occupation: member?.occupation ?? '',
    hasChildren: member?.hasChildren ?? '',
    previousChurch: member?.previousChurch ?? '',
    countryOfOrigin: member?.countryOfOrigin ?? '',
    // Flags
    isSensitive: member?.isSensitive ?? false,
    underObservation: member?.underObservation ?? false,
    // Spiritual history
    conversionDate: member?.spiritualHistory?.conversionDate ? new Date(member.spiritualHistory.conversionDate).toISOString().split('T')[0] : '',
    baptismDate: member?.spiritualHistory?.baptismDate ? new Date(member.spiritualHistory.baptismDate).toISOString().split('T')[0] : '',
    spiritualState: member?.spiritualHistory?.spiritualState ?? 'active',
    growthStage: member?.spiritualHistory?.growthStage ?? '',
    spiritualGifts: member?.spiritualHistory?.spiritualGifts ?? '',
    growthAreas: member?.spiritualHistory?.growthAreas ?? '',
    confidentialObs: member?.spiritualHistory?.confidentialObs ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = member ? `/api/members/${member.id}` : '/api/members';
      const method = member ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save member');
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const stateOptions = spiritualStates.map(state => ({
    value: state,
    label: t(`state_${state}` as any),
  }));

  const stageOptions = growthStages.map(stage => ({
    value: stage,
    label: t(`stage_${stage}` as any),
  }));

  const maritalOptions = maritalStatuses.map(status => ({
    value: status,
    label: t(`marital_${status}` as any),
  }));

  const employmentOptions = employmentStatuses.map(status => ({
    value: status,
    label: t(`employment_${status}` as any),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-medium text-sage-800 border-b border-sage-100 pb-2 font-serif">
          {language === 'es' ? 'Información Básica' : 'Basic Information'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('firstName')}
            value={formData.firstName}
            onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))}
            required
          />
          <Input
            label={t('lastName')}
            value={formData.lastName}
            onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('email')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
          />
          <Input
            label={t('phone')}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <Input
          label={t('address')}
          value={formData.address}
          onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
        />
        <Input
          label={t('birthDate')}
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData(f => ({ ...f, birthDate: e.target.value }))}
        />
        <Textarea
          label={t('generalNotes')}
          value={formData.notes}
          onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Personal and Family Context */}
      <div className="space-y-4">
        <div className="border-b border-sage-100 pb-2">
          <h3 className="font-medium text-sage-800 font-serif">
            {t('personalContext')}
          </h3>
          <p className="text-sm text-sage-500 mt-1">
            {t('personalContextSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('maritalStatus')}
            value={formData.maritalStatus}
            onChange={(e) => setFormData(f => ({ ...f, maritalStatus: e.target.value }))}
            options={maritalOptions}
          />
          <Select
            label={t('employmentStatus')}
            value={formData.employmentStatus}
            onChange={(e) => setFormData(f => ({ ...f, employmentStatus: e.target.value }))}
            options={employmentOptions}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('occupation')}
            value={formData.occupation}
            onChange={(e) => setFormData(f => ({ ...f, occupation: e.target.value }))}
            placeholder={language === 'es' 
              ? '¿A qué se dedica?' 
              : 'What do they do?'}
          />
          <Input
            label={t('hasChildren')}
            value={formData.hasChildren}
            onChange={(e) => setFormData(f => ({ ...f, hasChildren: e.target.value }))}
            placeholder={language === 'es' 
              ? 'Ej: Sí, 2 hijos' 
              : 'E.g.: Yes, 2 children'}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('countryOfOrigin')}
            value={formData.countryOfOrigin}
            onChange={(e) => setFormData(f => ({ ...f, countryOfOrigin: e.target.value }))}
            placeholder={language === 'es' 
              ? '¿De dónde viene?' 
              : 'Where are they from?'}
          />
          <div /> {/* Empty for alignment */}
        </div>
        <Textarea
          label={t('previousChurch')}
          value={formData.previousChurch}
          onChange={(e) => setFormData(f => ({ ...f, previousChurch: e.target.value }))}
          rows={2}
          placeholder={language === 'es' 
            ? '¿Tiene antecedentes en otra iglesia o comunidad de fe?' 
            : 'Any background in another church or faith community?'}
        />
      </div>

      {/* Flags */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isSensitive}
            onChange={(e) => setFormData(f => ({ ...f, isSensitive: e.target.checked }))}
            className="w-5 h-5 rounded border-sage-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sage-700">{t('markSensitive')}</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.underObservation}
            onChange={(e) => setFormData(f => ({ ...f, underObservation: e.target.checked }))}
            className="w-5 h-5 rounded border-sage-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sage-700">{t('markObservation')}</span>
        </label>
      </div>

      {/* Spiritual History */}
      <div className="space-y-4">
        <h3 className="font-medium text-sage-800 border-b border-sage-100 pb-2 font-serif">
          {t('spiritualHistory')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('conversionDate')}
            type="date"
            value={formData.conversionDate}
            onChange={(e) => setFormData(f => ({ ...f, conversionDate: e.target.value }))}
          />
          <Input
            label={t('baptismDate')}
            type="date"
            value={formData.baptismDate}
            onChange={(e) => setFormData(f => ({ ...f, baptismDate: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('spiritualState')}
            value={formData.spiritualState}
            onChange={(e) => setFormData(f => ({ ...f, spiritualState: e.target.value }))}
            options={stateOptions}
          />
          <Select
            label={t('growthStage')}
            value={formData.growthStage}
            onChange={(e) => setFormData(f => ({ ...f, growthStage: e.target.value }))}
            options={stageOptions}
          />
        </div>
        <Textarea
          label={t('spiritualGifts')}
          value={formData.spiritualGifts}
          onChange={(e) => setFormData(f => ({ ...f, spiritualGifts: e.target.value }))}
          rows={2}
          placeholder={language === 'es' 
            ? 'Describe los dones que has discernido en esta persona...' 
            : 'Describe the gifts you have discerned in this person...'}
        />
        <Textarea
          label={t('growthAreas')}
          value={formData.growthAreas}
          onChange={(e) => setFormData(f => ({ ...f, growthAreas: e.target.value }))}
          rows={2}
          placeholder={language === 'es' 
            ? '¿En qué áreas percibes que Dios está trabajando?' 
            : 'In what areas do you sense God is working?'}
        />
        <Textarea
          label={t('confidentialObs')}
          value={formData.confidentialObs}
          onChange={(e) => setFormData(f => ({ ...f, confidentialObs: e.target.value }))}
          rows={3}
          placeholder={language === 'es' 
            ? 'Notas pastorales para continuidad del cuidado...' 
            : 'Pastoral notes for continuity of care...'}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-sage-100">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('loading') : t('save')}
        </Button>
      </div>
    </form>
  );
}