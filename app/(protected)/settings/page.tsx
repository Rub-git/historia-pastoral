'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { User, Bell, Globe, Shield, FileText, Heart, MessageCircle, CreditCard, Crown, Users, UserPlus, Trash2, Edit2, X, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface UserSettings {
  fullName: string;
  email: string;
  language: string;
  inactiveThresholdDays: number;
  emailNotifications: boolean;
  role: string;
  teamOwnerId: string | null;
  subscriptionPlan: string;
  maxTeamMembers: number;
}

interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
}

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('leader');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        // Use current language from context instead of database
        // This ensures UI stays consistent with user's current selection
        setSettings({
          ...data,
          language: language, // Use context language
        });
        
        // If user is owner with team plan, fetch team
        if (data.role === 'owner' && data.maxTeamMembers > 0) {
          fetchTeam();
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/team');
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(data.teamMembers || []);
        setPendingInvitations(data.pendingInvitations || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    setInviteError(null);
    
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteRole('leader');
        fetchTeam();
        // Show invite link
        if (data.inviteUrl) {
          alert(language === 'es' 
            ? `Enlace de invitación generado. Compártelo con ${inviteEmail}:\n\n${data.inviteUrl}`
            : `Invitation link generated. Share it with ${inviteEmail}:\n\n${data.inviteUrl}`
          );
        }
      } else {
        setInviteError(data.error || 'Error al invitar');
      }
    } catch (err) {
      setInviteError('Error al invitar');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm(language === 'es' ? '¿Eliminar este miembro del equipo?' : 'Remove this team member?')) return;
    
    try {
      await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
      fetchTeam();
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      await fetch(`/api/team/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      fetchTeam();
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/join-team?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess(true);
        // Update language in context (this also saves to localStorage and DB)
        if (settings.language) {
          setLanguage(settings.language as 'es' | 'en', false); // false = don't save to DB again
        }
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-sage-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-sage-800 font-serif">{t('settings')}</h1>

      {success && (
        <Alert variant="success">{t('changesSaved')}</Alert>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <User className="w-5 h-5 text-sage-600" />
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label={t('fullName')}
            value={settings?.fullName ?? ''}
            onChange={(e) => setSettings(s => s ? { ...s, fullName: e.target.value } : null)}
          />
          <Input
            label={t('email')}
            value={settings?.email ?? ''}
            disabled
            className="bg-sage-50"
          />
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Globe className="w-5 h-5 text-sage-600" />
          <CardTitle>{t('languagePreference')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings?.language ?? 'es'}
            onChange={(e) => setSettings(s => s ? { ...s, language: e.target.value } : null)}
            options={[
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Bell className="w-5 h-5 text-sage-600" />
          <CardTitle>{t('notificationSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label={t('inactiveThreshold')}
            type="number"
            min={1}
            max={365}
            value={settings?.inactiveThresholdDays ?? 30}
            onChange={(e) => setSettings(s => s ? { ...s, inactiveThresholdDays: parseInt(e.target.value) || 30 } : null)}
          />
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.emailNotifications ?? false}
                onChange={(e) => setSettings(s => s ? { ...s, emailNotifications: e.target.checked } : null)}
                className="w-5 h-5 rounded border-sage-300 text-sage-600 focus:ring-sage-500"
              />
              <span className="text-sage-700">{t('enableEmailNotifications')}</span>
            </label>
            <p className="text-sm text-sage-500 ml-8">
              {language === 'es' 
                ? 'Solo recibirás recordatorios genéricos de seguimiento. Nunca se envía información confidencial por correo.' 
                : 'You will only receive generic follow-up reminders. Confidential information is never sent by email.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? t('loading') : t('saveChanges')}
      </Button>

      {/* Subscription Section */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center gap-3">
          <CreditCard className="w-5 h-5 text-sage-600" />
          <CardTitle>
            {language === 'es' ? 'Suscripción' : 'Subscription'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href="/pricing"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sage-50 transition-colors group"
          >
            <Crown className="w-5 h-5 text-sage-500 group-hover:text-sage-600" />
            <div>
              <p className="text-sage-800 font-medium">
                {language === 'es' ? 'Ver Planes y Precios' : 'View Plans & Pricing'}
              </p>
              <p className="text-sm text-sage-500">
                {language === 'es' ? 'Administra tu suscripción y método de pago' : 'Manage your subscription and payment method'}
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Team Management Section - Only for owners with team/church plan */}
      {settings?.role === 'owner' && settings?.maxTeamMembers > 0 && (
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-sage-600" />
              <CardTitle>
                {language === 'es' ? 'Gestión de Equipo' : 'Team Management'}
              </CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => setShowInviteModal(true)}
              disabled={teamMembers.length >= settings.maxTeamMembers}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {language === 'es' ? 'Invitar' : 'Invite'}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-sage-500 mb-4">
              {language === 'es' 
                ? `${teamMembers.length} de ${settings.maxTeamMembers} miembros del equipo`
                : `${teamMembers.length} of ${settings.maxTeamMembers} team members`}
            </p>

            {/* Team Members */}
            {teamMembers.length > 0 && (
              <div className="space-y-3 mb-4">
                <h4 className="text-sm font-medium text-sage-700">
                  {language === 'es' ? 'Miembros del Equipo' : 'Team Members'}
                </h4>
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-sage-50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sage-800">{member.fullName}</p>
                      <p className="text-sm text-sage-500">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        className="text-sm border border-sage-200 rounded px-2 py-1"
                      >
                        <option value="admin">{language === 'es' ? 'Admin (acceso total)' : 'Admin (full access)'}</option>
                        <option value="leader">{language === 'es' ? 'Líder (acceso limitado)' : 'Leader (limited access)'}</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-sage-700">
                  {language === 'es' ? 'Invitaciones Pendientes' : 'Pending Invitations'}
                </h4>
                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between bg-amber-50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sage-800">{inv.email}</p>
                      <p className="text-sm text-amber-600">
                        {inv.role === 'admin' 
                          ? (language === 'es' ? 'Admin' : 'Admin')
                          : (language === 'es' ? 'Líder' : 'Leader')}
                      </p>
                    </div>
                    <button
                      onClick={() => copyInviteLink(inv.token)}
                      className="flex items-center gap-1 px-2 py-1 text-sm bg-white border border-sage-200 rounded hover:bg-sage-50"
                    >
                      {copiedLink === inv.token ? (
                        <><Check className="w-4 h-4 text-green-500" /> {language === 'es' ? 'Copiado' : 'Copied'}</>
                      ) : (
                        <><Copy className="w-4 h-4" /> {language === 'es' ? 'Copiar enlace' : 'Copy link'}</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {teamMembers.length === 0 && pendingInvitations.length === 0 && (
              <p className="text-center text-sage-400 py-4">
                {language === 'es' 
                  ? 'No tienes miembros en tu equipo. ¡Invita a alguien!'
                  : 'You have no team members. Invite someone!'}
              </p>
            )}

            {/* Role Explanation */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p className="font-medium text-blue-800 mb-1">
                {language === 'es' ? 'Roles disponibles:' : 'Available roles:'}
              </p>
              <ul className="text-blue-700 space-y-1">
                <li><strong>Admin:</strong> {language === 'es' ? 'Ve toda la información (Dashboard, Miembros, Discipulado, Ministerios)' : 'Sees all information (Dashboard, Members, Discipleship, Ministries)'}</li>
                <li><strong>{language === 'es' ? 'Líder' : 'Leader'}:</strong> {language === 'es' ? 'Solo ve Discipulado y Ministerios' : 'Only sees Discipleship and Ministries'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {language === 'es' ? 'Invitar al Equipo' : 'Invite to Team'}
              </CardTitle>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {inviteError && (
                <Alert className="bg-red-50 border-red-200 text-red-700">{inviteError}</Alert>
              )}
              <Input
                label={language === 'es' ? 'Correo electrónico' : 'Email address'}
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@ejemplo.com"
              />
              <Select
                label={language === 'es' ? 'Rol' : 'Role'}
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                options={[
                  { value: 'admin', label: language === 'es' ? 'Admin (acceso total)' : 'Admin (full access)' },
                  { value: 'leader', label: language === 'es' ? 'Líder (acceso limitado)' : 'Leader (limited access)' },
                ]}
              />
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button 
                  className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]" 
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {language === 'es' ? 'Invitar' : 'Invite'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legal & Ethics Section */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center gap-3">
          <FileText className="w-5 h-5 text-sage-600" />
          <CardTitle>
            {language === 'es' ? 'Información Legal y Ética' : 'Legal & Ethics Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link
              href="/ethics"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-sage-50 transition-colors group"
            >
              <Heart className="w-5 h-5 text-sage-500 group-hover:text-sage-600" />
              <div>
                <p className="text-sage-800 font-medium">
                  {language === 'es' ? 'Ética Pastoral y Descargo' : 'Pastoral Ethics & Disclaimer'}
                </p>
                <p className="text-sm text-sage-500">
                  {language === 'es' ? 'Principios que guían el uso de esta herramienta' : 'Principles guiding the use of this tool'}
                </p>
              </div>
            </Link>
            <Link
              href="/privacy"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-sage-50 transition-colors group"
            >
              <Shield className="w-5 h-5 text-sage-500 group-hover:text-sage-600" />
              <div>
                <p className="text-sage-800 font-medium">
                  {language === 'es' ? 'Privacidad y Confidencialidad' : 'Privacy and Confidentiality'}
                </p>
                <p className="text-sm text-sage-500">
                  {language === 'es' ? 'Cómo protegemos la información' : 'How we protect information'}
                </p>
              </div>
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-sage-50 transition-colors group"
            >
              <FileText className="w-5 h-5 text-sage-500 group-hover:text-sage-600" />
              <div>
                <p className="text-sage-800 font-medium">
                  {language === 'es' ? 'Términos de Uso' : 'Terms of Use'}
                </p>
                <p className="text-sm text-sage-500">
                  {language === 'es' ? 'Condiciones para el uso del sistema' : 'Conditions for using the system'}
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <MessageCircle className="w-5 h-5 text-sage-600" />
          <CardTitle>
            {language === 'es' ? 'Soporte y Contacto' : 'Support & Contact'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href="/contact"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-sage-50 transition-colors group"
          >
            <MessageCircle className="w-5 h-5 text-sage-500 group-hover:text-sage-600" />
            <div>
              <p className="text-sage-800 font-medium">
                {language === 'es' ? 'Contactar Soporte' : 'Contact Support'}
              </p>
              <p className="text-sm text-sage-500">
                {language === 'es' ? 'Teléfono y correo electrónico de asistencia' : 'Phone and email assistance'}
              </p>
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}