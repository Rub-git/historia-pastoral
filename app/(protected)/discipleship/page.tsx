'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { 
  Users, BookOpen, Droplets, 
  ChevronRight, Upload, Download, Loader2,
  GraduationCap, UserPlus, CheckCircle, Plus, X, Trash2,
  TrendingUp, Clock, ClipboardCheck, UserCheck
} from 'lucide-react';

type DiscipleshipStatus = 'INTEREST' | 'STUDYING' | 'BAPTIZED';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  discipleshipStatus: string;
  currentLesson: string | null;
  lessonsCompleted: number;
  baptismDate: string | null;
  mentorAssigned: string | null;
  consolidationStage: string;
  baptismCohort: string | null;
  notes: string | null;
  // Retention fields
  retention90Status: string | null;
  retention90DueDate: string | null;
  integrationConfirmedAt: string | null;
}

interface Metrics {
  activeStudents: number;
  preparingBaptism: number;
  baptismsThisYear: number;
  consolidationsCompleted: number;
  // Retention metrics
  retentionRate: number | null;
  pendingRetentionEvaluations: number;
  totalEvaluatedThisYear: number;
}

interface AddStudentForm {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  baptismCohort: string;
  notes: string;
  // Campos para estudiantes activos (STUDYING)
  mentorAssigned: string;
  currentLesson: string;
  lessonsCompleted: number;
}

const COLUMNS: { status: DiscipleshipStatus; icon: React.ReactNode; color: string; headerColor: string }[] = [
  { status: 'INTEREST', icon: <UserPlus className="w-5 h-5" />, color: 'bg-blue-50 border-blue-200', headerColor: 'bg-blue-100' },
  { status: 'STUDYING', icon: <BookOpen className="w-5 h-5" />, color: 'bg-amber-50 border-amber-200', headerColor: 'bg-amber-100' },
  { status: 'BAPTIZED', icon: <Droplets className="w-5 h-5" />, color: 'bg-green-50 border-green-200', headerColor: 'bg-green-100' },
];

const emptyForm: AddStudentForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  baptismCohort: '',
  notes: '',
  mentorAssigned: '',
  currentLesson: '',
  lessonsCompleted: 0,
};

export default function DiscipleshipPage() {
  const { language, t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success?: boolean; count?: number; error?: string } | null>(null);
  
  // Add student modal state
  const [addingToColumn, setAddingToColumn] = useState<DiscipleshipStatus | null>(null);
  const [addForm, setAddForm] = useState<AddStudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Confirm integration
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [studentsRes, metricsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/students/metrics'),
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const moveStudent = async (studentId: string, newStatus: DiscipleshipStatus) => {
    setMoving(studentId);
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: studentId, 
          discipleshipStatus: newStatus,
          firstName: student.firstName,
          lastName: student.lastName,
        }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error moving student:', error);
    } finally {
      setMoving(null);
    }
  };

  const handleAddStudent = async () => {
    if (!addingToColumn || !addForm.firstName.trim()) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      const studentData: Record<string, unknown> = {
        firstName: addForm.firstName.trim(),
        lastName: addForm.lastName.trim(),
        phone: addForm.phone.trim() || null,
        email: addForm.email.trim() || null,
        address: addForm.address.trim() || null,
        baptismCohort: addForm.baptismCohort.trim() || null,
        notes: addForm.notes.trim() || null,
        discipleshipStatus: addingToColumn,
      };
      
      // Agregar campos de estudio solo para estudiantes activos
      if (addingToColumn === 'STUDYING') {
        studentData.mentorAssigned = addForm.mentorAssigned.trim() || null;
        studentData.currentLesson = addForm.currentLesson.trim() || null;
        studentData.lessonsCompleted = addForm.lessonsCompleted || 0;
      }
      
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (res.ok) {
        setAddingToColumn(null);
        setAddForm(emptyForm);
        await fetchData();
      } else {
        const data = await res.json();
        setSaveError(data.error || 'Error al agregar estudiante');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      setSaveError('Error al agregar estudiante');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeletingId(null);
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmIntegration = async (studentId: string) => {
    setConfirmingId(studentId);
    try {
      const res = await fetch('/api/students/confirm-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error confirming integration:', error);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleImport = async () => {
    if (!csvData.trim()) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const lines = csvData.trim().split('\n').filter(line => line.trim());
      const studentsToImport: Array<{
        firstName: string;
        lastName?: string;
        phone?: string;
        email?: string;
        address?: string;
        status?: string;
        currentLesson?: string;
        baptismCohort?: string;
        notes?: string;
      }> = [];

      // Helper to parse CSV line respecting quotes
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      for (const line of lines) {
        const parts = parseCSVLine(line);
        // Skip header row if detected
        if (parts[0]?.toLowerCase() === 'nombre' || parts[0]?.toLowerCase() === 'name') continue;
        
        if (parts[0]) {
          // Order: Nombre, Apellido, Teléfono, Email, Dirección, Estado, Lección Actual, Campaña, Comentarios
          studentsToImport.push({
            firstName: parts[0],
            lastName: parts[1] || '',
            phone: parts[2] || '',
            email: parts[3] || '',
            address: parts[4] || '',
            status: parts[5] || 'STUDYING',
            currentLesson: parts[6] || '',
            baptismCohort: parts[7] || '',
            notes: parts[8] || '',
          });
        }
      }

      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsToImport }),
      });

      const data = await res.json();

      if (res.ok) {
        setImportResult({ success: true, count: data.count });
        setCsvData('');
        await fetchData();
      } else {
        setImportResult({ error: data.error });
      }
    } catch (error) {
      console.error('Error importing:', error);
      setImportResult({ error: 'Error al importar estudiantes' });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'Nombre,Apellido,Teléfono,Email,Dirección,Estado,Lección Actual,Campaña,Comentarios\nJuan,Pérez,555-1234,juan@email.com,"123 Main St, City",STUDYING,Lección 3,Primavera 2026,Muy comprometido\nMaría,López,555-5678,maria@email.com,"456 Oak Ave",INTEREST,,Primavera 2026,Primera visita';
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estudiantes_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusExportLabel = (status: string) => {
    const labels: Record<string, string> = {
      INTEREST: language === 'es' ? 'Interés' : 'Interest',
      STUDYING: language === 'es' ? 'Estudiando' : 'Studying',
      BAPTIZED: language === 'es' ? 'Bautizado' : 'Baptized',
    };
    return labels[status] || status;
  };

  const downloadStudentsList = () => {
    // Estudiantes con estado INTEREST o STUDYING
    const studentsToExport = students.filter(s => s.discipleshipStatus === 'INTEREST' || s.discipleshipStatus === 'STUDYING');
    const header = 'Nombre,Apellido,Teléfono,Email,Dirección,Estado,Lección Actual,Campaña,Comentarios';
    const rows = studentsToExport.map(s => 
      `"${s.firstName}","${s.lastName || ''}","${s.phone || ''}","${s.email || ''}","${(s.address || '').replace(/"/g, '""')}","${getStatusExportLabel(s.discipleshipStatus)}","${s.currentLesson || ''}","${s.baptismCohort || ''}","${(s.notes || '').replace(/"/g, '""')}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudiantes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBaptizedList = () => {
    // Estudiantes con estado BAPTIZED
    const baptizedToExport = students.filter(s => s.discipleshipStatus === 'BAPTIZED');
    const header = 'Nombre,Apellido,Teléfono,Email,Dirección,Estado,Lección Actual,Campaña,Comentarios';
    const rows = baptizedToExport.map(s => {
      const retentionInfo = s.retention90Status 
        ? (language === 'es' 
          ? `Retención: ${s.retention90Status === 'RETAINED' ? 'Retenido' : s.retention90Status === 'NOT_RETAINED' ? 'No retenido' : 'Pendiente'}`
          : `Retention: ${s.retention90Status}`)
        : '';
      const integrationInfo = s.integrationConfirmedAt 
        ? (language === 'es' ? 'Integración confirmada' : 'Integration confirmed') 
        : '';
      const combinedNotes = [s.notes || '', retentionInfo, integrationInfo].filter(Boolean).join(' | ');
      return `"${s.firstName}","${s.lastName || ''}","${s.phone || ''}","${s.email || ''}","${(s.address || '').replace(/"/g, '""')}","${getStatusExportLabel(s.discipleshipStatus)}","${s.currentLesson || ''}","${s.baptismCohort || ''}","${combinedNotes.replace(/"/g, '""')}"`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bautizados_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusLabel = (status: DiscipleshipStatus) => {
    const labels: Record<DiscipleshipStatus, { es: string; en: string }> = {
      INTEREST: { es: 'Interés', en: 'Interest' },
      STUDYING: { es: 'Estudiando', en: 'Studying' },
      BAPTIZED: { es: 'Bautizado', en: 'Baptized' },
    };
    return labels[status][language as 'es' | 'en'] || status;
  };

  const getStudentsByStatus = (status: DiscipleshipStatus) => {
    return students.filter(s => s.discipleshipStatus === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#6B7B3C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#4A5D23]">
            {t('discipleshipPipeline')}
          </h1>
          <p className="text-sage-600 mt-1">
            {language === 'es' 
              ? 'Gestiona el proceso de discipulado de nuevos estudiantes' 
              : 'Manage the discipleship process for new students'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={downloadStudentsList}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {language === 'es' ? 'Estudiantes' : 'Students'}
          </Button>
          <Button
            onClick={downloadBaptizedList}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            <Download className="w-4 h-4" />
            {language === 'es' ? 'Bautizados' : 'Baptized'}
          </Button>
          <Button
            onClick={() => setShowImport(!showImport)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {t('importStudents')}
          </Button>
        </div>
      </div>

      {/* Import Section */}
      {showImport && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{t('importCSV')}</h3>
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                {t('downloadTemplate')}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {language === 'es' 
                ? 'Formato: Nombre, Apellido, Teléfono, Email, Dirección, Estado (INTEREST/STUDYING/BAPTIZED), Lección Actual, Campaña, Comentarios' 
                : 'Format: First Name, Last Name, Phone, Email, Address, Status (INTEREST/STUDYING/BAPTIZED), Current Lesson, Campaign, Comments'}
            </p>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder={language === 'es' 
                ? 'Pega aquí los datos CSV...' 
                : 'Paste CSV data here...'}
              className="w-full h-32 p-3 border rounded-lg text-sm font-mono"
            />
            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={importing || !csvData.trim()}>
                {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {t('importStudents')}
              </Button>
            </div>
            {importResult && (
              <Alert className={importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                {importResult.success 
                  ? `✓ ${importResult.count} ${language === 'es' ? 'estudiantes importados' : 'students imported'}` 
                  : importResult.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {metrics && (
        <div className="space-y-4">
          {/* Primary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{metrics.activeStudents}</p>
                  <p className="text-sm text-amber-600">{t('activeStudents')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 flex items-center gap-3">
                <Droplets className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{metrics.baptismsThisYear}</p>
                  <p className="text-sm text-green-600">{t('baptismsThisYear')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{metrics.consolidationsCompleted}</p>
                  <p className="text-sm text-blue-600">{t('consolidationsCompleted')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 90-Day Retention Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">
                    {metrics.retentionRate !== null ? `${metrics.retentionRate}%` : t('noDataYet')}
                  </p>
                  <p className="text-sm text-emerald-600">{t('retentionRate')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">{metrics.pendingRetentionEvaluations}</p>
                  <p className="text-sm text-orange-600">{t('pendingEvaluations')}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-4 flex items-center gap-3">
                <ClipboardCheck className="w-8 h-8 text-slate-600" />
                <div>
                  <p className="text-2xl font-bold text-slate-700">{metrics.totalEvaluatedThisYear}</p>
                  <p className="text-sm text-slate-600">{t('evaluatedThisYear')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map(({ status, icon, color, headerColor }) => {
          const columnStudents = getStudentsByStatus(status);
          return (
            <div key={status} className={`rounded-lg border-2 ${color} min-h-[400px]`}>
              {/* Column Header */}
              <div className={`p-3 ${headerColor} rounded-t-lg border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium">{getStatusLabel(status)}</span>
                    <span className="bg-white/70 px-2 py-0.5 rounded-full text-sm">
                      {columnStudents.length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Add Button */}
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full border-2 border-dashed border-gray-300 hover:border-[#6B7B3C] hover:bg-[#6B7B3C]/5"
                  onClick={() => setAddingToColumn(status)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('addStudent')}
                </Button>
              </div>

              {/* Students */}
              <div className="p-2 space-y-2">
                {columnStudents.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">
                    {t('noStudentsInColumn')}
                  </p>
                )}
                {columnStudents.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-[#4A5D23]">
                          {student.firstName} {student.lastName}
                        </p>
                        {student.phone && (
                          <p className="text-sm text-gray-500">{student.phone}</p>
                        )}
                        {student.address && (
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {student.address}
                          </p>
                        )}
                        {student.mentorAssigned && (
                          <p className="text-xs text-blue-600 mt-1">
                            👤 {student.mentorAssigned}
                          </p>
                        )}
                        {student.currentLesson && (
                          <p className="text-xs text-[#6B7B3C] mt-1">
                            📖 {student.currentLesson}
                          </p>
                        )}
                        {student.lessonsCompleted > 0 && (
                          <p className="text-xs text-gray-500">
                            ✓ {student.lessonsCompleted} {language === 'es' ? 'lecciones' : 'lessons'}
                          </p>
                        )}
                        {student.baptismCohort && (
                          <p className="text-xs text-purple-600 mt-1">
                            🎯 {student.baptismCohort}
                          </p>
                        )}
                        {student.notes && (
                          <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">
                            💬 {student.notes}
                          </p>
                        )}
                        {/* Retention status for baptized students */}
                        {status === 'BAPTIZED' && student.retention90Status && (
                          <p className={`text-xs mt-1 ${
                            student.retention90Status === 'RETAINED' ? 'text-emerald-600' :
                            student.retention90Status === 'NOT_RETAINED' ? 'text-red-600' :
                            'text-orange-600'
                          }`}>
                            {student.retention90Status === 'RETAINED' && '✓ '}
                            {student.retention90Status === 'NOT_RETAINED' && '✗ '}
                            {student.retention90Status === 'PENDING' && '⏳ '}
                            {t(student.retention90Status === 'RETAINED' ? 'retained' : 
                               student.retention90Status === 'NOT_RETAINED' ? 'notRetained' : 'pending')}
                          </p>
                        )}
                        {/* Integration confirmed indicator */}
                        {status === 'BAPTIZED' && student.integrationConfirmedAt && (
                          <p className="text-xs text-emerald-600 mt-1">
                            ✓ {t('integrationConfirmed')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setDeletingId(student.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title={t('deleteStudent')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Confirm Integration button for baptized students without confirmation */}
                    {status === 'BAPTIZED' && !student.integrationConfirmedAt && (
                      <div className="mt-2 pt-2 border-t">
                        <button
                          onClick={() => handleConfirmIntegration(student.id)}
                          disabled={confirmingId === student.id}
                          className="w-full text-xs py-1.5 px-2 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {confirmingId === student.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
                              {t('confirmIntegration')}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2 pt-2 border-t">
                      {COLUMNS.filter(c => c.status !== status).map((col) => (
                        <button
                          key={col.status}
                          onClick={() => moveStudent(student.id, col.status)}
                          disabled={moving === student.id}
                          className="flex-1 text-xs py-1 px-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-1"
                          title={`${t('moveToColumn')} ${getStatusLabel(col.status)}`}
                        >
                          {moving === student.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>{col.icon}</>                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Student Modal */}
      {addingToColumn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {t('addToColumn')} {getStatusLabel(addingToColumn)}
              </CardTitle>
              <button
                onClick={() => {
                  setAddingToColumn(null);
                  setAddForm(emptyForm);
                  setSaveError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {saveError && (
                <Alert className="bg-red-50 border-red-200 text-red-700">
                  {saveError}
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('firstName')}
                  value={addForm.firstName}
                  onChange={(e) => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                  placeholder={language === 'es' ? 'Juan' : 'John'}
                  required
                />
                <Input
                  label={t('lastName')}
                  value={addForm.lastName}
                  onChange={(e) => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder={language === 'es' ? 'Pérez' : 'Smith'}
                />
              </div>
              <Input
                label={language === 'es' ? 'Teléfono' : 'Phone'}
                value={addForm.phone}
                onChange={(e) => setAddForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="555-1234"
              />
              <Input
                label="Email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))}
                placeholder="email@example.com"
              />
              <Input
                label={language === 'es' ? 'Dirección' : 'Address'}
                value={addForm.address}
                onChange={(e) => setAddForm(f => ({ ...f, address: e.target.value }))}
                placeholder={language === 'es' ? 'Ej: 123 Calle Principal, Ciudad' : 'E.g.: 123 Main St, City'}
              />
              <Input
                label={t('baptismCohort')}
                value={addForm.baptismCohort}
                onChange={(e) => setAddForm(f => ({ ...f, baptismCohort: e.target.value }))}
                placeholder={t('baptismCohortPlaceholder')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'es' ? 'Comentarios' : 'Comments'}
                </label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={language === 'es' ? 'Observaciones o notas sobre el estudiante...' : 'Observations or notes about the student...'}
                  className="w-full p-2 border rounded-lg text-sm resize-none"
                  rows={2}
                />
              </div>
              
              {/* Campos adicionales solo para estudiantes activos */}
              {addingToColumn === 'STUDYING' && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <p className="text-sm font-medium text-[#4A5D23] mb-3">
                      {language === 'es' ? 'Seguimiento de Estudios' : 'Study Tracking'}
                    </p>
                  </div>
                  <Input
                    label={language === 'es' ? 'Mentor Asignado' : 'Assigned Mentor'}
                    value={addForm.mentorAssigned}
                    onChange={(e) => setAddForm(f => ({ ...f, mentorAssigned: e.target.value }))}
                    placeholder={language === 'es' ? 'Nombre del mentor' : 'Mentor name'}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={language === 'es' ? 'Lección Actual' : 'Current Lesson'}
                      value={addForm.currentLesson}
                      onChange={(e) => setAddForm(f => ({ ...f, currentLesson: e.target.value }))}
                      placeholder={language === 'es' ? 'Ej: Lección 3' : 'E.g.: Lesson 3'}
                    />
                    <Input
                      label={language === 'es' ? 'Lecciones Completadas' : 'Lessons Completed'}
                      type="number"
                      value={addForm.lessonsCompleted}
                      onChange={(e) => setAddForm(f => ({ ...f, lessonsCompleted: parseInt(e.target.value) || 0 }))}
                      min={0}
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setAddingToColumn(null);
                    setAddForm(emptyForm);
                    setSaveError(null);
                  }}
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button
                  className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]"
                  onClick={handleAddStudent}
                  disabled={saving || !addForm.firstName.trim()}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {t('addStudent')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center space-y-4">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto" />
              <p className="font-medium">{t('confirmDeleteStudent')}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeletingId(null)}
                  disabled={deleting}
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={() => handleDeleteStudent(deletingId)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('deleteStudent')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
