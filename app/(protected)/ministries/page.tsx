'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import {
  Church,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Search,
  Users,
  Download,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Quote,
  Tent,
  Mountain,
  Compass,
  Heart,
  BookOpen,
  UsersRound,
} from 'lucide-react';

interface GroupMember {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  role: string | null;
  notes: string | null;
}

interface MinistryGroup {
  id: string;
  name: string;
  type: string;
  customName: string | null;
  motto: string | null;
  description: string | null;
  classNumber: string | null;
  teacher: string | null;
  isActive: boolean;
  members: GroupMember[];
}

const MINISTRY_TYPES = [
  { value: 'conquistadores', labelEs: 'Conquistadores', labelEn: 'Pathfinders', icon: Compass },
  { value: 'aventureros', labelEs: 'Aventureros', labelEn: 'Adventurers', icon: Tent },
  { value: 'guias_mayores', labelEs: 'Guías Mayores', labelEn: 'Master Guides', icon: Mountain },
  { value: 'grupo_pequeno', labelEs: 'Grupo Pequeño', labelEn: 'Small Group', icon: UsersRound },
  { value: 'hombres', labelEs: 'Ministerio de Hombres', labelEn: 'Men\'s Ministry', icon: Users },
  { value: 'mujeres', labelEs: 'Ministerio de la Mujer', labelEn: 'Women\'s Ministry', icon: Heart },
  { value: 'jovenes', labelEs: 'Ministerio Juvenil', labelEn: 'Youth Ministry', icon: Users },
  { value: 'escuela_sabatica', labelEs: 'Escuela Sabática', labelEn: 'Sabbath School', icon: BookOpen },
  { value: 'otro', labelEs: 'Otro Ministerio', labelEn: 'Other Ministry', icon: Church },
];

const emptyGroupForm = {
  name: '',
  type: 'grupo_pequeno',
  customName: '',
  motto: '',
  description: '',
  classNumber: '',
  teacher: '',
};

const emptyMemberForm = {
  fullName: '',
  phone: '',
  email: '',
  role: '',
  notes: '',
};

export default function MinistriesPage() {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<MinistryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Group modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MinistryGroup | null>(null);
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  
  // Download dropdown state
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  
  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDownloadMenu && !target.closest('.download-dropdown')) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadMenu]);
  
  // Member modal state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [addingMemberToGroup, setAddingMemberToGroup] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<GroupMember | null>(null);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('owner');

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ministries: { es: 'Ministerios', en: 'Ministries' },
      ministriesDesc: { es: 'Grupos y ministerios de la iglesia', en: 'Church groups and ministries' },
      search: { es: 'Buscar ministerio...', en: 'Search ministry...' },
      allTypes: { es: 'Todos los tipos', en: 'All types' },
      addGroup: { es: 'Agregar Ministerio', en: 'Add Ministry' },
      editGroup: { es: 'Editar Ministerio', en: 'Edit Ministry' },
      newGroup: { es: 'Nuevo Ministerio', en: 'New Ministry' },
      groupName: { es: 'Nombre del Ministerio', en: 'Ministry Name' },
      type: { es: 'Tipo', en: 'Type' },
      customName: { es: 'Nombre Personalizado (opcional)', en: 'Custom Name (optional)' },
      motto: { es: 'Lema o Frase Distintiva', en: 'Motto or Distinctive Phrase' },
      description: { es: 'Descripción', en: 'Description' },
      classNumber: { es: 'Número de Clase', en: 'Class Number' },
      teacher: { es: 'Maestro/a', en: 'Teacher' },
      save: { es: 'Guardar', en: 'Save' },
      cancel: { es: 'Cancelar', en: 'Cancel' },
      delete: { es: 'Eliminar', en: 'Delete' },
      confirmDeleteGroup: { es: '¿Eliminar este ministerio y todos sus miembros?', en: 'Delete this ministry and all its members?' },
      confirmDeleteMember: { es: '¿Eliminar este miembro?', en: 'Delete this member?' },
      loading: { es: 'Cargando...', en: 'Loading...' },
      noGroups: { es: 'No hay ministerios todavía', en: 'No ministries yet' },
      noGroupsDesc: { es: 'Crea grupos como Conquistadores, Grupos Pequeños, etc.', en: 'Create groups like Pathfinders, Small Groups, etc.' },
      members: { es: 'miembros', en: 'members' },
      addMember: { es: 'Agregar Miembro', en: 'Add Member' },
      editMember: { es: 'Editar Miembro', en: 'Edit Member' },
      newMember: { es: 'Nuevo Miembro', en: 'New Member' },
      fullName: { es: 'Nombre Completo', en: 'Full Name' },
      phone: { es: 'Teléfono', en: 'Phone' },
      email: { es: 'Correo', en: 'Email' },
      role: { es: 'Rol/Cargo', en: 'Role/Position' },
      notes: { es: 'Notas', en: 'Notes' },
      downloadList: { es: 'Descargar Lista', en: 'Download List' },
      downloadAll: { es: 'Descargar Todos', en: 'Download All' },
      downloadFiltered: { es: 'Descargar Filtrados', en: 'Download Filtered' },
      downloadByType: { es: 'Por Tipo de Ministerio', en: 'By Ministry Type' },
      noMembers: { es: 'Sin miembros registrados', en: 'No members registered' },
    };
    return translations[key]?.[language] || key;
  };

  const getTypeLabel = (type: string) => {
    const t = MINISTRY_TYPES.find(mt => mt.value === type);
    return t ? (language === 'es' ? t.labelEs : t.labelEn) : type;
  };

  const getTypeIcon = (type: string) => {
    const t = MINISTRY_TYPES.find(mt => mt.value === type);
    return t?.icon || Church;
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/ministry-groups?type=${filterType}`);
      const data = await res.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role || 'owner');
      }
    } catch (err) {
      console.error('Error fetching role:', err);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [filterType]);

  const toggleExpand = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Group CRUD
  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      setError(language === 'es' ? 'El nombre es requerido' : 'Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = editingGroup ? 'PUT' : 'POST';
      const body = editingGroup
        ? { id: editingGroup.id, ...groupForm }
        : groupForm;

      const res = await fetch('/api/ministry-groups', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowGroupModal(false);
        setEditingGroup(null);
        setGroupForm(emptyGroupForm);
        await fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Error');
      }
    } catch (err) {
      setError('Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm(t('confirmDeleteGroup'))) return;
    try {
      await fetch(`/api/ministry-groups?id=${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Member CRUD
  const handleSaveMember = async () => {
    if (!memberForm.fullName.trim()) {
      setError(language === 'es' ? 'El nombre es requerido' : 'Name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = editingMember ? 'PUT' : 'POST';
      const body = editingMember
        ? { id: editingMember.id, ...memberForm }
        : { groupId: addingMemberToGroup, ...memberForm };

      const res = await fetch('/api/ministry-groups/members', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowMemberModal(false);
        setEditingMember(null);
        setAddingMemberToGroup(null);
        setMemberForm(emptyMemberForm);
        await fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Error');
      }
    } catch (err) {
      setError('Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm(t('confirmDeleteMember'))) return;
    try {
      await fetch(`/api/ministry-groups/members?id=${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Download CSV for all groups
  const downloadAllMembers = (groupsToDownload: MinistryGroup[], fileNamePrefix: string) => {
    const allMembers = groupsToDownload.flatMap(group => 
      group.members.map(member => ({
        ...member,
        groupName: group.customName || group.name,
        groupType: MINISTRY_TYPES.find(t => t.value === group.type)?.[language === 'es' ? 'labelEs' : 'labelEn'] || group.type,
      }))
    );
    
    if (allMembers.length === 0) {
      alert(language === 'es' ? 'No hay miembros para descargar' : 'No members to download');
      return;
    }

    const headers = language === 'es' 
      ? ['Ministerio', 'Tipo', 'Nombre Completo', 'Rol', 'Teléfono', 'Email', 'Notas']
      : ['Ministry', 'Type', 'Full Name', 'Role', 'Phone', 'Email', 'Notes'];
    
    const rows = [
      headers.join(','),
      ...allMembers.map(m => [
        `"${m.groupName}"`,
        `"${m.groupType}"`,
        `"${m.fullName}"`,
        `"${m.role || ''}"`,
        `"${m.phone || ''}"`,
        `"${m.email || ''}"`,
        `"${(m.notes || '').replace(/"/g, '""')}"`,
      ].join(','))
    ];

    const csvContent = rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.download = `${fileNamePrefix}_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download CSV for single group
  const downloadGroupMembers = (group: MinistryGroup) => {
    if (group.members.length === 0) {
      alert(language === 'es' ? 'No hay miembros para descargar' : 'No members to download');
      return;
    }

    const rows: string[] = [];
    rows.push(`"${language === 'es' ? 'Nombre' : 'Name'}","${language === 'es' ? 'Rol' : 'Role'}","${language === 'es' ? 'Teléfono' : 'Phone'}","${language === 'es' ? 'Correo' : 'Email'}","${language === 'es' ? 'Notas' : 'Notes'}"`);

    group.members.forEach(member => {
      const name = member.fullName.replace(/"/g, '""');
      const role = (member.role || '').replace(/"/g, '""');
      const phone = (member.phone || '').replace(/"/g, '""');
      const email = (member.email || '').replace(/"/g, '""');
      const notes = (member.notes || '').replace(/"/g, '""');
      rows.push(`"${name}","${role}","${phone}","${email}","${notes}"`);
    });

    const csvContent = rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = (group.customName || group.name).toLowerCase().replace(/\s+/g, '_');
    link.download = `${fileName}_miembros.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openEditGroup = (group: MinistryGroup) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name,
      type: group.type,
      customName: group.customName || '',
      motto: group.motto || '',
      description: group.description || '',
      classNumber: group.classNumber || '',
      teacher: group.teacher || '',
    });
    setShowGroupModal(true);
  };

  const openAddMember = (groupId: string) => {
    setAddingMemberToGroup(groupId);
    setEditingMember(null);
    setMemberForm(emptyMemberForm);
    setError(null);
    setShowMemberModal(true);
  };

  const openEditMember = (member: GroupMember) => {
    setEditingMember(member);
    setAddingMemberToGroup(null);
    setMemberForm({
      fullName: member.fullName,
      phone: member.phone || '',
      email: member.email || '',
      role: member.role || '',
      notes: member.notes || '',
    });
    setShowMemberModal(true);
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.customName && g.customName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canEdit = userRole === 'owner' || userRole === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B7B3C]" />
        <span className="ml-2 text-[#4A5D23]">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Church className="w-8 h-8 text-[#6B7B3C]" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#4A5D23]">
              {t('ministries')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('ministriesDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Dropdown */}
          <div className="relative download-dropdown">
            <Button
              variant="outline"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 border-[#6B7B3C] text-[#6B7B3C] hover:bg-[#6B7B3C]/10"
              disabled={groups.length === 0}
            >
              <Download className="w-4 h-4" />
              {t('downloadList')}
              <ChevronDown className="w-4 h-4" />
            </Button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => {
                      downloadAllMembers(groups, 'todos_ministerios');
                      setShowDownloadMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t('downloadAll')}
                  </button>
                  
                  {searchTerm && filteredGroups.length !== groups.length && (
                    <button
                      onClick={() => {
                        downloadAllMembers(filteredGroups, 'ministerios_filtrados');
                        setShowDownloadMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      {t('downloadFiltered')} ({filteredGroups.length})
                    </button>
                  )}
                  
                  <div className="border-t my-1"></div>
                  <div className="px-4 py-1 text-xs text-gray-500 font-medium">
                    {t('downloadByType')}
                  </div>
                  
                  {MINISTRY_TYPES.map(type => {
                    const typeGroups = groups.filter(g => g.type === type.value);
                    if (typeGroups.length === 0) return null;
                    const TypeIcon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => {
                          downloadAllMembers(typeGroups, type.value);
                          setShowDownloadMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <TypeIcon className="w-4 h-4" />
                        {language === 'es' ? type.labelEs : type.labelEn} ({typeGroups.length})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {canEdit && (
            <Button
              onClick={() => {
                setEditingGroup(null);
                setGroupForm(emptyGroupForm);
                setError(null);
                setShowGroupModal(true);
              }}
              className="bg-[#6B7B3C] hover:bg-[#5a6a31] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('addGroup')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="sm:w-64"
          options={[
            { value: 'all', label: t('allTypes') },
            ...MINISTRY_TYPES.map(mt => ({
              value: mt.value,
              label: language === 'es' ? mt.labelEs : mt.labelEn,
            })),
          ]}
        />
      </div>

      {/* Groups List */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Church className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t('noGroups')}
            </h3>
            <p className="text-gray-400 mb-4">
              {t('noGroupsDesc')}
            </p>
            {canEdit && (
              <Button
                onClick={() => {
                  setEditingGroup(null);
                  setGroupForm(emptyGroupForm);
                  setShowGroupModal(true);
                }}
                className="bg-[#6B7B3C] hover:bg-[#5a6a31]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addGroup')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => {
            const TypeIcon = getTypeIcon(group.type);
            const isExpanded = expandedGroups.has(group.id);
            
            return (
              <Card key={group.id} className="overflow-hidden">
                {/* Group Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpand(group.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6B7B3C]/10 rounded-lg">
                      <TypeIcon className="w-6 h-6 text-[#6B7B3C]" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {group.customName || group.name}
                        {group.customName && (
                          <span className="text-sm text-gray-500 ml-2">({group.name})</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{getTypeLabel(group.type)}</span>
                        <span>•</span>
                        <span>{group.members.length} {t('members')}</span>
                        {group.teacher && (
                          <>
                            <span>•</span>
                            <span>{language === 'es' ? 'Maestro' : 'Teacher'}: {group.teacher}</span>
                          </>
                        )}
                      </div>
                      {group.motto && (
                        <p className="text-sm text-[#6B7B3C] italic flex items-center gap-1 mt-1">
                          <Quote className="w-3 h-3" />
                          {group.motto}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditGroup(group); }}
                          className="p-2 text-gray-400 hover:text-[#6B7B3C]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                          className="p-2 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content - Members */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    {/* Actions */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-gray-600">
                        {group.members.length} {t('members')}
                      </span>
                      <div className="flex gap-2">
                        {group.members.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadGroupMembers(group)}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            {t('downloadList')}
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            size="sm"
                            onClick={() => openAddMember(group.id)}
                            className="bg-[#6B7B3C] hover:bg-[#5a6a31] flex items-center gap-1"
                          >
                            <UserPlus className="w-4 h-4" />
                            {t('addMember')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Members List */}
                    {group.members.length === 0 ? (
                      <p className="text-center text-gray-400 py-4">
                        {t('noMembers')}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {group.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm"
                          >
                            <div>
                              <p className="font-medium text-gray-900">{member.fullName}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                {member.role && <span className="text-[#6B7B3C]">{member.role}</span>}
                                {member.phone && <span>{member.phone}</span>}
                                {member.email && <span>{member.email}</span>}
                              </div>
                            </div>
                            {canEdit && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => openEditMember(member)}
                                  className="p-1 text-gray-400 hover:text-[#6B7B3C]"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {editingGroup ? t('editGroup') : t('newGroup')}
              </CardTitle>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setEditingGroup(null);
                  setGroupForm(emptyGroupForm);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200 text-red-700">
                  {error}
                </Alert>
              )}

              <Select
                label={t('type')}
                value={groupForm.type}
                onChange={(e) => setGroupForm(f => ({ ...f, type: e.target.value }))}
                options={MINISTRY_TYPES.map(mt => ({
                  value: mt.value,
                  label: language === 'es' ? mt.labelEs : mt.labelEn,
                }))}
              />

              <Input
                label={t('groupName')}
                value={groupForm.name}
                onChange={(e) => setGroupForm(f => ({ ...f, name: e.target.value }))}
                placeholder={language === 'es' ? 'Ej: Conquistadores Central' : 'Ex: Central Pathfinders'}
                required
              />

              <Input
                label={t('customName')}
                value={groupForm.customName}
                onChange={(e) => setGroupForm(f => ({ ...f, customName: e.target.value }))}
                placeholder={language === 'es' ? 'Ej: Los Valientes de Jehová' : 'Ex: Jehovah\'s Brave'}
              />

              <Input
                label={t('motto')}
                value={groupForm.motto}
                onChange={(e) => setGroupForm(f => ({ ...f, motto: e.target.value }))}
                placeholder={language === 'es' ? 'Lema o frase distintiva' : 'Motto or distinctive phrase'}
              />

              {groupForm.type === 'escuela_sabatica' && (
                <>
                  <Input
                    label={t('classNumber')}
                    value={groupForm.classNumber}
                    onChange={(e) => setGroupForm(f => ({ ...f, classNumber: e.target.value }))}
                    placeholder={language === 'es' ? 'Ej: Clase 1, Adultos A' : 'Ex: Class 1, Adults A'}
                  />
                  <Input
                    label={t('teacher')}
                    value={groupForm.teacher}
                    onChange={(e) => setGroupForm(f => ({ ...f, teacher: e.target.value }))}
                    placeholder={language === 'es' ? 'Nombre del maestro/a' : 'Teacher name'}
                  />
                </>
              )}

              <Textarea
                label={t('description')}
                value={groupForm.description}
                onChange={(e) => setGroupForm(f => ({ ...f, description: e.target.value }))}
                placeholder={language === 'es' ? 'Descripción opcional' : 'Optional description'}
                rows={3}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowGroupModal(false);
                    setEditingGroup(null);
                    setGroupForm(emptyGroupForm);
                    setError(null);
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]"
                  onClick={handleSaveGroup}
                  disabled={saving || !groupForm.name.trim()}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {editingMember ? t('editMember') : t('newMember')}
              </CardTitle>
              <button
                onClick={() => {
                  setShowMemberModal(false);
                  setEditingMember(null);
                  setAddingMemberToGroup(null);
                  setMemberForm(emptyMemberForm);
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200 text-red-700">
                  {error}
                </Alert>
              )}

              <Input
                label={t('fullName')}
                value={memberForm.fullName}
                onChange={(e) => setMemberForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder={language === 'es' ? 'Juan Pérez' : 'John Smith'}
                required
              />

              <Input
                label={t('role')}
                value={memberForm.role}
                onChange={(e) => setMemberForm(f => ({ ...f, role: e.target.value }))}
                placeholder={language === 'es' ? 'Ej: Director, Consejero, Miembro' : 'Ex: Director, Counselor, Member'}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('phone')}
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="555-1234"
                />
                <Input
                  label={t('email')}
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <Textarea
                label={t('notes')}
                value={memberForm.notes}
                onChange={(e) => setMemberForm(f => ({ ...f, notes: e.target.value }))}
                placeholder={language === 'es' ? 'Notas adicionales' : 'Additional notes'}
                rows={2}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowMemberModal(false);
                    setEditingMember(null);
                    setAddingMemberToGroup(null);
                    setMemberForm(emptyMemberForm);
                    setError(null);
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]"
                  onClick={handleSaveMember}
                  disabled={saving || !memberForm.fullName.trim()}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
