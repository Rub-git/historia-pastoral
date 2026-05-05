'use client';

import { useState } from 'react';
import { useLanguage } from './providers';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { encounterTypes } from '@/lib/i18n';

interface AccompanimentFormProps {
  memberId: string;
  record?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AccompanimentForm({ memberId, record, onSuccess, onCancel }: AccompanimentFormProps) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    encounterDate: record?.encounterDate 
      ? new Date(record.encounterDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    encounterType: record?.encounterType ?? 'visit',
    reason: record?.reason ?? '',
    observations: record?.observations ?? '',
    commitments: record?.commitments ?? '',
    nextSteps: record?.nextSteps ?? '',
    followUpDate: record?.followUpDate 
      ? new Date(record.followUpDate).toISOString().split('T')[0] 
      : '',
    followUpCompleted: record?.followUpCompleted ?? false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = record ? `/api/accompaniments/${record.id}` : '/api/accompaniments';
      const method = record ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, memberId }),
      });

      if (!res.ok) {
        throw new Error('Failed to save record');
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = encounterTypes.map(type => ({
    value: type,
    label: t(`type_${type}` as any),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('encounterDate')}
          type="date"
          value={formData.encounterDate}
          onChange={(e) => setFormData(f => ({ ...f, encounterDate: e.target.value }))}
          required
        />
        <Select
          label={t('encounterType')}
          value={formData.encounterType}
          onChange={(e) => setFormData(f => ({ ...f, encounterType: e.target.value }))}
          options={typeOptions}
        />
      </div>

      <Textarea
        label={t('mainReason')}
        value={formData.reason}
        onChange={(e) => setFormData(f => ({ ...f, reason: e.target.value }))}
        rows={2}
        placeholder={language === 'es' 
          ? '¿Qué trajo a esta persona a buscar acompañamiento?' 
          : 'What brought this person to seek accompaniment?'}
      />

      <Textarea
        label={t('pastoralObservations')}
        value={formData.observations}
        onChange={(e) => setFormData(f => ({ ...f, observations: e.target.value }))}
        rows={3}
        placeholder={language === 'es' 
          ? '¿Qué percibiste durante el encuentro? ¿Cómo está la persona?' 
          : 'What did you perceive during the encounter? How is this person doing?'}
      />

      <Textarea
        label={t('agreedCommitments')}
        value={formData.commitments}
        onChange={(e) => setFormData(f => ({ ...f, commitments: e.target.value }))}
        rows={2}
        placeholder={language === 'es' 
          ? '¿Qué acordaron juntos? (si aplica)' 
          : 'What did you agree together? (if applicable)'}
      />

      <Textarea
        label={t('nextSteps')}
        value={formData.nextSteps}
        onChange={(e) => setFormData(f => ({ ...f, nextSteps: e.target.value }))}
        rows={2}
        placeholder={language === 'es' 
          ? '¿Qué acordaron como siguiente paso en su caminar?' 
          : 'What did you agree as the next step in their journey?'}
      />

      <Input
        label={t('suggestedFollowUp')}
        type="date"
        value={formData.followUpDate}
        onChange={(e) => setFormData(f => ({ ...f, followUpDate: e.target.value }))}
      />

      {record && (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.followUpCompleted}
            onChange={(e) => setFormData(f => ({ ...f, followUpCompleted: e.target.checked }))}
            className="w-5 h-5 rounded border-sage-300 text-sage-600 focus:ring-sage-500"
          />
          <span className="text-sage-700">{t('markCompleted')}</span>
        </label>
      )}

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