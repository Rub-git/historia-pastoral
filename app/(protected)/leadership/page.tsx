'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Search,
  UserPlus,
  Crown,
  Download,
  ChevronDown,
} from 'lucide-react';

interface Assignment {
  id: string;
  year: number;
  personName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

interface Position {
  id: string;
  name: string;
  category: string | null;
  sortOrder: number;
  assignments: Assignment[];
}

const emptyAssignment = {
  personName: '',
  phone: '',
  email: '',
  notes: '',
};

export default function MinistriesPage() {
  const { language } = useLanguage();
  const [positions, setPositions] = useState<Position[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [addingToPosition, setAddingToPosition] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState(emptyAssignment);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ministries: { es: 'Liderazgo de la Iglesia', en: 'Church Leadership' },
      year: { es: 'Año', en: 'Year' },
      search: { es: 'Buscar cargo...', en: 'Search position...' },
      noAssignments: { es: 'Sin asignaciones este año', en: 'No assignments this year' },
      addPerson: { es: 'Agregar Persona', en: 'Add Person' },
      personName: { es: 'Nombre Completo', en: 'Full Name' },
      phone: { es: 'Teléfono', en: 'Phone' },
      email: { es: 'Correo', en: 'Email' },
      notes: { es: 'Notas', en: 'Notes' },
      save: { es: 'Guardar', en: 'Save' },
      cancel: { es: 'Cancelar', en: 'Cancel' },
      edit: { es: 'Editar', en: 'Edit' },
      delete: { es: 'Eliminar', en: 'Delete' },
      confirmDelete: { es: '¿Eliminar esta asignación?', en: 'Delete this assignment?' },
      loading: { es: 'Cargando...', en: 'Loading...' },
      initializeFirst: { es: 'Inicializando ministerios...', en: 'Initializing ministries...' },
      noResults: { es: 'No se encontraron ministerios', en: 'No ministries found' },
      assignedPeople: { es: 'personas asignadas', en: 'people assigned' },
      editAssignment: { es: 'Editar Asignación', en: 'Edit Assignment' },
      newAssignment: { es: 'Nueva Asignación', en: 'New Assignment' },
      downloadList: { es: 'Descargar Lista', en: 'Download List' },
      downloadAll: { es: 'Todos los Líderes', en: 'All Leaders' },
      downloadFiltered: { es: 'Solo resultados filtrados', en: 'Filtered results only' },
    };
    return translations[key]?.[language] || key;
  };

  // Download CSV function
  const downloadCSV = (positionsToDownload: Position[], filename: string) => {
    if (positionsToDownload.length === 0) return;

    const rows: string[] = [];
    // Header
    rows.push(`"${language === 'es' ? 'Ministerio' : 'Ministry'}","${language === 'es' ? 'Nombre' : 'Name'}","${language === 'es' ? 'Teléfono' : 'Phone'}","${language === 'es' ? 'Correo' : 'Email'}","${language === 'es' ? 'Notas' : 'Notes'}"`);

    positionsToDownload.forEach(position => {
      if (position.assignments.length > 0) {
        position.assignments.forEach(assignment => {
          const ministry = position.name.replace(/"/g, '""');
          const name = assignment.personName.replace(/"/g, '""');
          const phone = (assignment.phone || '').replace(/"/g, '""');
          const email = (assignment.email || '').replace(/"/g, '""');
          const notes = (assignment.notes || '').replace(/"/g, '""');
          rows.push(`"${ministry}","${name}","${phone}","${email}","${notes}"`);
        });
      }
    });

    // If no assignments at all, show message
    if (rows.length === 1) {
      alert(language === 'es' ? 'No hay líderes asignados para descargar' : 'No leaders assigned to download');
      return;
    }

    const csvContent = rows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${year}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  // Get unique ministries that have assignments for grouping
  const ministriesWithAssignments = positions.filter(p => p.assignments.length > 0);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/ministries?year=${year}`);
      const data = await res.json();
      
      if (data.positions && data.positions.length === 0) {
        // Initialize default positions
        await fetch('/api/ministries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'initialize' }),
        });
        // Fetch again
        const res2 = await fetch(`/api/ministries?year=${year}`);
        const data2 = await res2.json();
        setPositions(data2.positions || []);
      } else {
        setPositions(data.positions || []);
      }
    } catch (err) {
      console.error('Error fetching ministries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [year]);

  const handleAddAssignment = async () => {
    if (!addingToPosition || !formData.personName.trim()) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ministries/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: addingToPosition,
          year,
          ...formData,
        }),
      });

      if (res.ok) {
        setAddingToPosition(null);
        setFormData(emptyAssignment);
        await fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al guardar');
      }
    } catch (err) {
      setError('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment || !formData.personName.trim()) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const res = await fetch('/api/ministries/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAssignment.id,
          ...formData,
        }),
      });

      if (res.ok) {
        setEditingAssignment(null);
        setFormData(emptyAssignment);
        await fetchData();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al actualizar');
      }
    } catch (err) {
      setError('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
      await fetch(`/api/ministries/assignments?id=${id}`, {
        method: 'DELETE',
      });
      await fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      personName: assignment.personName,
      phone: assignment.phone || '',
      email: assignment.email || '',
      notes: assignment.notes || '',
    });
  };

  const filteredPositions = positions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssignments = positions.reduce(
    (sum, p) => sum + p.assignments.length,
    0
  );

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
          <Crown className="w-8 h-8 text-[#6B7B3C]" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#4A5D23]">
              {t('ministries')}
            </h1>
            <p className="text-sm text-gray-600">
              {totalAssignments} {t('assignedPeople')} ({year})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setYear(y => y - 1)}
              className="p-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-lg font-bold text-[#4A5D23] min-w-[80px] text-center">
              {year}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setYear(y => y + 1)}
              className="p-1"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Download Button with Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center gap-2 border-[#6B7B3C] text-[#6B7B3C] hover:bg-[#6B7B3C]/10"
              disabled={totalAssignments === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('downloadList')}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-3 py-1 font-medium">
                    {language === 'es' ? 'Descargar como CSV' : 'Download as CSV'}
                  </p>
                  
                  {/* Download All */}
                  <button
                    onClick={() => downloadCSV(positions, language === 'es' ? 'todos_los_lideres' : 'all_leaders')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-[#6B7B3C]" />
                    <span className="font-medium">{t('downloadAll')}</span>
                    <span className="text-xs text-gray-400 ml-auto">({totalAssignments})</span>
                  </button>

                  {/* Download Filtered (if search is active) */}
                  {searchTerm && (
                    <button
                      onClick={() => downloadCSV(filteredPositions, language === 'es' ? 'filtrados' : 'filtered')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 text-[#6B7B3C]" />
                      <span>{t('downloadFiltered')}</span>
                      <span className="text-xs text-gray-400 ml-auto">
                        ({filteredPositions.reduce((sum, p) => sum + p.assignments.length, 0)})
                      </span>
                    </button>
                  )}

                  {/* Divider */}
                  {ministriesWithAssignments.length > 0 && (
                    <>
                      <div className="border-t my-2" />
                      <p className="text-xs text-gray-500 px-3 py-1 font-medium">
                        {language === 'es' ? 'Por ministerio específico' : 'By specific ministry'}
                      </p>
                      <div className="max-h-48 overflow-y-auto">
                        {ministriesWithAssignments.map(position => (
                          <button
                            key={position.id}
                            onClick={() => downloadCSV([position], position.name.toLowerCase().replace(/\s+/g, '_'))}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center justify-between"
                          >
                            <span className="truncate pr-2">{position.name}</span>
                            <span className="text-xs text-gray-400 flex-shrink-0">({position.assignments.length})</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDownloadMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDownloadMenu(false)}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder={t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Ministry List */}
      {filteredPositions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            {t('noResults')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPositions.map((position) => (
            <Card key={position.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-[#4A5D23] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#6B7B3C]" />
                  {position.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Assignments List */}
                {position.assignments.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-2">
                    {t('noAssignments')}
                  </p>
                ) : (
                  <ul className="space-y-2 mb-3">
                    {position.assignments.map((assignment) => (
                      <li
                        key={assignment.id}
                        className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                      >
                        <div>
                          <p className="font-medium text-sm">{assignment.personName}</p>
                          {assignment.phone && (
                            <p className="text-xs text-gray-500">{assignment.phone}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(assignment)}
                            className="p-1 text-gray-400 hover:text-[#6B7B3C]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add Person Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full border border-dashed border-gray-300 hover:border-[#6B7B3C] hover:bg-[#6B7B3C]/5"
                  onClick={() => {
                    setAddingToPosition(position.id);
                    setEditingPosition(position);
                    setFormData(emptyAssignment);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('addPerson')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(addingToPosition || editingAssignment) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {editingAssignment ? t('editAssignment') : t('newAssignment')}
                {editingPosition && (
                  <span className="block text-sm font-normal text-gray-500 mt-1">
                    {editingPosition.name}
                  </span>
                )}
              </CardTitle>
              <button
                onClick={() => {
                  setAddingToPosition(null);
                  setEditingAssignment(null);
                  setEditingPosition(null);
                  setFormData(emptyAssignment);
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
                label={t('personName')}
                value={formData.personName}
                onChange={(e) => setFormData(f => ({ ...f, personName: e.target.value }))}
                placeholder={language === 'es' ? 'Juan Pérez' : 'John Smith'}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                  placeholder="555-1234"
                />
                <Input
                  label={t('email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                />
              </div>
              
              <Input
                label={t('notes')}
                value={formData.notes}
                onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                placeholder={language === 'es' ? 'Notas adicionales...' : 'Additional notes...'}
              />

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAddingToPosition(null);
                    setEditingAssignment(null);
                    setEditingPosition(null);
                    setFormData(emptyAssignment);
                    setError(null);
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]"
                  onClick={editingAssignment ? handleUpdateAssignment : handleAddAssignment}
                  disabled={saving || !formData.personName.trim()}
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
