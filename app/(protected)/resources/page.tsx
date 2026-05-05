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
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Search,
  ExternalLink,
  FileText,
  Download,
  Link as LinkIcon,
  BookOpen,
  FileCheck,
  Users,
  GraduationCap,
  FolderPlus,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  resourceType: string;
  externalUrl: string | null;
  cloud_storage_path: string | null;
  fileName: string | null;
  fileSize: number | null;
  isPublic: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'manual', labelEs: 'Manual de Iglesia', labelEn: 'Church Manual', icon: BookOpen },
  { value: 'guide', labelEs: 'Guía de Procedimientos', labelEn: 'Procedures Guide', icon: FileCheck },
  { value: 'job_description', labelEs: 'Descripción de Trabajo', labelEn: 'Job Description', icon: Users },
  { value: 'training', labelEs: 'Material de Capacitación', labelEn: 'Training Material', icon: GraduationCap },
  { value: 'other', labelEs: 'Otros Recursos', labelEn: 'Other Resources', icon: FolderPlus },
];

const emptyForm = {
  title: '',
  description: '',
  category: 'manual',
  resourceType: 'link',
  externalUrl: '',
};

export default function ResourcesPage() {
  const { language } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('owner');

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      resources: { es: 'Recursos', en: 'Resources' },
      resourcesDesc: { es: 'Documentos y materiales de ayuda para pastores y líderes', en: 'Documents and help materials for pastors and leaders' },
      search: { es: 'Buscar recurso...', en: 'Search resource...' },
      allCategories: { es: 'Todas las categorías', en: 'All categories' },
      addResource: { es: 'Agregar Recurso', en: 'Add Resource' },
      editResource: { es: 'Editar Recurso', en: 'Edit Resource' },
      newResource: { es: 'Nuevo Recurso', en: 'New Resource' },
      title: { es: 'Título', en: 'Title' },
      description: { es: 'Descripción', en: 'Description' },
      category: { es: 'Categoría', en: 'Category' },
      type: { es: 'Tipo', en: 'Type' },
      externalLink: { es: 'Enlace Externo', en: 'External Link' },
      linkUrl: { es: 'URL del enlace', en: 'Link URL' },
      save: { es: 'Guardar', en: 'Save' },
      cancel: { es: 'Cancelar', en: 'Cancel' },
      delete: { es: 'Eliminar', en: 'Delete' },
      confirmDelete: { es: '¿Eliminar este recurso?', en: 'Delete this resource?' },
      loading: { es: 'Cargando...', en: 'Loading...' },
      noResources: { es: 'No hay recursos todavía', en: 'No resources yet' },
      noResourcesDesc: { es: 'Agrega manuales, guías y documentos para tu equipo', en: 'Add manuals, guides and documents for your team' },
      view: { es: 'Ver', en: 'View' },
      download: { es: 'Descargar', en: 'Download' },
      resourcesCount: { es: 'recursos', en: 'resources' },
    };
    return translations[key]?.[language] || key;
  };

  const getCategoryLabel = (value: string) => {
    const cat = CATEGORIES.find(c => c.value === value);
    return cat ? (language === 'es' ? cat.labelEs : cat.labelEn) : value;
  };

  const getCategoryIcon = (value: string) => {
    const cat = CATEGORIES.find(c => c.value === value);
    return cat?.icon || FolderOpen;
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/resources?category=${filterCategory}`);
      const data = await res.json();
      setResources(data.resources || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
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
  }, [filterCategory]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError(language === 'es' ? 'El título es requerido' : 'Title is required');
      return;
    }

    if (formData.resourceType === 'link' && !formData.externalUrl.trim()) {
      setError(language === 'es' ? 'La URL es requerida' : 'URL is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = editingResource ? 'PUT' : 'POST';
      const body = editingResource
        ? { id: editingResource.id, ...formData }
        : formData;

      const res = await fetch('/api/resources', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingResource(null);
        setFormData(emptyForm);
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

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await fetch(`/api/resources?id=${id}`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      resourceType: resource.resourceType,
      externalUrl: resource.externalUrl || '',
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingResource(null);
    setFormData(emptyForm);
    setError(null);
    setShowModal(true);
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group resources by category
  const groupedResources = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

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
          <FolderOpen className="w-8 h-8 text-[#6B7B3C]" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#4A5D23]">
              {t('resources')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('resourcesDesc')}
            </p>
          </div>
        </div>

        {canEdit && (
          <Button
            onClick={openAddModal}
            className="bg-[#6B7B3C] hover:bg-[#5a6a31] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('addResource')}
          </Button>
        )}
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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="sm:w-64"
          options={[
            { value: 'all', label: t('allCategories') },
            ...CATEGORIES.map(cat => ({
              value: cat.value,
              label: language === 'es' ? cat.labelEs : cat.labelEn,
            })),
          ]}
        />
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t('noResources')}
            </h3>
            <p className="text-gray-400 mb-4">
              {t('noResourcesDesc')}
            </p>
            {canEdit && (
              <Button
                onClick={openAddModal}
                className="bg-[#6B7B3C] hover:bg-[#5a6a31]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addResource')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResources).map(([category, categoryResources]) => {
            const CategoryIcon = getCategoryIcon(category);
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <CategoryIcon className="w-5 h-5 text-[#6B7B3C]" />
                  <h2 className="text-lg font-semibold text-[#4A5D23]">
                    {getCategoryLabel(category)}
                  </h2>
                  <span className="text-sm text-gray-400">
                    ({categoryResources.length} {t('resourcesCount')})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryResources.map((resource) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {resource.resourceType === 'link' ? (
                              <LinkIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <FileText className="w-5 h-5 text-[#6B7B3C] flex-shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">
                                {resource.title}
                              </h3>
                              {resource.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {canEdit && (
                            <div className="flex gap-1 ml-2 flex-shrink-0">
                              <button
                                onClick={() => openEditModal(resource)}
                                className="p-1 text-gray-400 hover:text-[#6B7B3C]"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(resource.id)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <div className="mt-4">
                          {resource.resourceType === 'link' && resource.externalUrl && (
                            <a
                              href={resource.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {t('view')}
                            </a>
                          )}
                          {resource.resourceType === 'file' && resource.cloud_storage_path && (
                            <a
                              href={`/api/resources/download?id=${resource.id}`}
                              className="inline-flex items-center gap-2 text-sm text-[#6B7B3C] hover:text-[#4A5D23]"
                            >
                              <Download className="w-4 h-4" />
                              {t('download')}
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {editingResource ? t('editResource') : t('newResource')}
              </CardTitle>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingResource(null);
                  setFormData(emptyForm);
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
                label={t('title')}
                value={formData.title}
                onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                placeholder={language === 'es' ? 'Ej: Manual de Iglesia 2024' : 'Ex: Church Manual 2024'}
                required
              />

              <Textarea
                label={t('description')}
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder={language === 'es' ? 'Descripción opcional del recurso' : 'Optional resource description'}
                rows={3}
              />

              <Select
                label={t('category')}
                value={formData.category}
                onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
                options={CATEGORIES.map(cat => ({
                  value: cat.value,
                  label: language === 'es' ? cat.labelEs : cat.labelEn,
                }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('type')}
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resourceType"
                      value="link"
                      checked={formData.resourceType === 'link'}
                      onChange={(e) => setFormData(f => ({ ...f, resourceType: e.target.value }))}
                      className="text-[#6B7B3C] focus:ring-[#6B7B3C]"
                    />
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{t('externalLink')}</span>
                  </label>
                </div>
              </div>

              {formData.resourceType === 'link' && (
                <Input
                  label={t('linkUrl')}
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) => setFormData(f => ({ ...f, externalUrl: e.target.value }))}
                  placeholder="https://..."
                  required
                />
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setEditingResource(null);
                    setFormData(emptyForm);
                    setError(null);
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]"
                  onClick={handleSave}
                  disabled={saving || !formData.title.trim()}
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
