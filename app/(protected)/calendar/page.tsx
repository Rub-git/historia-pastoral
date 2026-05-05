'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/components/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Clock,
  MapPin,
  Bell,
  Church,
  Users,
  GraduationCap,
  Heart,
  Star,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  eventType: string;
  location: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  reminderEnabled: boolean;
  reminderMinutes: number | null;
}

const EVENT_TYPES = [
  { value: 'general', labelEs: 'General', labelEn: 'General', icon: CalendarIcon, color: 'bg-gray-500' },
  { value: 'worship', labelEs: 'Culto/Adoración', labelEn: 'Worship', icon: Church, color: 'bg-purple-500' },
  { value: 'meeting', labelEs: 'Reunión', labelEn: 'Meeting', icon: Users, color: 'bg-blue-500' },
  { value: 'visit', labelEs: 'Visita Pastoral', labelEn: 'Pastoral Visit', icon: Heart, color: 'bg-pink-500' },
  { value: 'training', labelEs: 'Capacitación', labelEn: 'Training', icon: GraduationCap, color: 'bg-green-500' },
  { value: 'special', labelEs: 'Evento Especial', labelEn: 'Special Event', icon: Star, color: 'bg-amber-500' },
];

const REMINDER_OPTIONS = [
  { value: 15, labelEs: '15 minutos antes', labelEn: '15 minutes before' },
  { value: 30, labelEs: '30 minutos antes', labelEn: '30 minutes before' },
  { value: 60, labelEs: '1 hora antes', labelEn: '1 hour before' },
  { value: 120, labelEs: '2 horas antes', labelEn: '2 hours before' },
  { value: 1440, labelEs: '1 día antes', labelEn: '1 day before' },
];

const emptyEventForm = {
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  allDay: false,
  eventType: 'general',
  location: '',
  reminderEnabled: false,
  reminderMinutes: 60,
};

export default function CalendarPage() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('owner');
  
  // View state
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  
  // Event detail popup
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const t = (key: string): string => {
    const translations: Record<string, { es: string; en: string }> = {
      calendar: { es: 'Calendario', en: 'Calendar' },
      calendarDesc: { es: 'Planifica y organiza las actividades de tu iglesia', en: 'Plan and organize your church activities' },
      addEvent: { es: 'Agregar Evento', en: 'Add Event' },
      editEvent: { es: 'Editar Evento', en: 'Edit Event' },
      deleteEvent: { es: 'Eliminar', en: 'Delete' },
      save: { es: 'Guardar', en: 'Save' },
      cancel: { es: 'Cancelar', en: 'Cancel' },
      title: { es: 'Título', en: 'Title' },
      description: { es: 'Descripción', en: 'Description' },
      date: { es: 'Fecha', en: 'Date' },
      startDate: { es: 'Fecha de Inicio', en: 'Start Date' },
      endDate: { es: 'Fecha de Fin', en: 'End Date' },
      time: { es: 'Hora', en: 'Time' },
      allDay: { es: 'Todo el día', en: 'All day' },
      eventType: { es: 'Tipo de Evento', en: 'Event Type' },
      location: { es: 'Ubicación', en: 'Location' },
      reminder: { es: 'Recordatorio', en: 'Reminder' },
      enableReminder: { es: 'Activar recordatorio', en: 'Enable reminder' },
      month: { es: 'Mes', en: 'Month' },
      week: { es: 'Semana', en: 'Week' },
      today: { es: 'Hoy', en: 'Today' },
      noEvents: { es: 'No hay eventos', en: 'No events' },
      loading: { es: 'Cargando...', en: 'Loading...' },
      confirmDelete: { es: '¿Eliminar este evento?', en: 'Delete this event?' },
    };
    return translations[key]?.[language] || key;
  };

  const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = language === 'es' ? DAYS_ES : DAYS_EN;
  const months = language === 'es' ? MONTHS_ES : MONTHS_EN;

  useEffect(() => {
    fetchRole();
    fetchEvents();
  }, [currentDate, viewMode]);

  const fetchRole = async () => {
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let start: Date, end: Date;

      if (viewMode === 'month') {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else {
        const dayOfWeek = currentDate.getDay();
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - dayOfWeek);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      }

      const res = await fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Create dates properly with local timezone
      let startDateTime: string;
      if (eventForm.allDay || !eventForm.startTime) {
        // For all-day events, use noon to avoid date shifting issues
        const [year, month, day] = eventForm.startDate.split('-').map(Number);
        const localDate = new Date(year, month - 1, day, 12, 0, 0);
        startDateTime = localDate.toISOString();
      } else {
        // Parse date and time components
        const [year, month, day] = eventForm.startDate.split('-').map(Number);
        const [hours, minutes] = eventForm.startTime.split(':').map(Number);
        const localDate = new Date(year, month - 1, day, hours, minutes, 0);
        startDateTime = localDate.toISOString();
      }

      let endDateTime: string | null = null;
      if (eventForm.endDate) {
        if (eventForm.allDay || !eventForm.endTime) {
          const [year, month, day] = eventForm.endDate.split('-').map(Number);
          const localDate = new Date(year, month - 1, day, 12, 0, 0);
          endDateTime = localDate.toISOString();
        } else {
          const [year, month, day] = eventForm.endDate.split('-').map(Number);
          const [hours, minutes] = eventForm.endTime.split(':').map(Number);
          const localDate = new Date(year, month - 1, day, hours, minutes, 0);
          endDateTime = localDate.toISOString();
        }
      }

      const payload = {
        ...(editingEvent && { id: editingEvent.id }),
        title: eventForm.title,
        description: eventForm.description || null,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: eventForm.allDay,
        eventType: eventForm.eventType,
        location: eventForm.location || null,
        reminderEnabled: eventForm.reminderEnabled,
        reminderMinutes: eventForm.reminderEnabled ? eventForm.reminderMinutes : null,
      };

      const res = await fetch('/api/calendar', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error saving event');
      }

      setShowModal(false);
      setEditingEvent(null);
      setEventForm(emptyEventForm);
      fetchEvents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const res = await fetch(`/api/calendar?id=${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedEvent(null);
        fetchEvents();
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const openAddModal = (date?: Date) => {
    setEditingEvent(null);
    // Format date using local timezone to avoid UTC conversion issues
    const targetDate = date || new Date();
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    setEventForm({ ...emptyEventForm, startDate: dateStr, endDate: dateStr });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    
    // Format date as YYYY-MM-DD using local timezone
    const formatDateLocal = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Format time as HH:MM using local timezone
    const formatTimeLocal = (d: Date) => {
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: formatDateLocal(startDate),
      startTime: event.allDay ? '' : formatTimeLocal(startDate),
      endDate: formatDateLocal(endDate),
      endTime: event.allDay ? '' : formatTimeLocal(endDate),
      allDay: event.allDay,
      eventType: event.eventType,
      location: event.location || '',
      reminderEnabled: event.reminderEnabled,
      reminderMinutes: event.reminderMinutes || 60,
    });
    setError(null);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days for month view
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  // Generate week days for week view
  const weekDays = useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeInfo = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[0];
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const canEdit = userRole === 'owner' || userRole === 'admin';
  const today = new Date();

  if (loading && events.length === 0) {
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
          <CalendarIcon className="w-8 h-8 text-[#6B7B3C]" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#4A5D23]">
              {t('calendar')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('calendarDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() => openAddModal()}
              className="bg-[#6B7B3C] hover:bg-[#5a6a31] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('addEvent')}
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="border-[#6B7B3C]/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={navigatePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                {t('today')}
              </Button>
              <Button variant="outline" size="sm" onClick={navigateNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Month/Week Display */}
            <h2 className="text-lg font-semibold text-[#4A5D23]">
              {viewMode === 'month' 
                ? `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `${weekDays[0].getDate()} - ${weekDays[6].getDate()} ${months[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}`
              }
            </h2>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-white text-[#4A5D23] shadow' : 'text-gray-600 hover:text-[#4A5D23]'
                }`}
              >
                {t('month')}
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-white text-[#4A5D23] shadow' : 'text-gray-600 hover:text-[#4A5D23]'
                }`}
              >
                {t('week')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-[#6B7B3C]/20 overflow-hidden">
        <CardContent className="p-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-[#6B7B3C]/10 border-b">
            {dayNames.map((day, i) => (
              <div key={i} className="py-2 text-center text-sm font-medium text-[#4A5D23]">
                {day}
              </div>
            ))}
          </div>

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7">
              {monthDays.map((date, i) => {
                const dayEvents = date ? getEventsForDay(date) : [];
                const isToday = date?.toDateString() === today.toDateString();
                
                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border-b border-r p-1 ${
                      !date ? 'bg-gray-50' : isToday ? 'bg-[#6B7B3C]/5' : 'hover:bg-gray-50'
                    } ${canEdit && date ? 'cursor-pointer' : ''}`}
                    onClick={() => canEdit && date && openAddModal(date)}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-white bg-[#6B7B3C] w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => {
                            const typeInfo = getEventTypeInfo(event.eventType);
                            return (
                              <div
                                key={event.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                                className={`text-xs p-1 rounded truncate text-white cursor-pointer ${typeInfo.color} hover:opacity-80`}
                              >
                                {!event.allDay && <span className="mr-1">{formatTime(event.startDate)}</span>}
                                {event.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 pl-1">
                              +{dayEvents.length - 3} {language === 'es' ? 'más' : 'more'}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7">
              {weekDays.map((date, i) => {
                const dayEvents = getEventsForDay(date);
                const isToday = date.toDateString() === today.toDateString();
                
                return (
                  <div
                    key={i}
                    className={`min-h-[300px] border-r p-2 ${
                      isToday ? 'bg-[#6B7B3C]/5' : ''
                    } ${canEdit ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    onClick={() => canEdit && openAddModal(date)}
                  >
                    <div className={`text-center mb-2 ${
                      isToday ? 'text-white bg-[#6B7B3C] rounded-lg py-1' : ''
                    }`}>
                      <div className="text-xs text-gray-500">{dayNames[i]}</div>
                      <div className="text-lg font-semibold">{date.getDate()}</div>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map(event => {
                        const typeInfo = getEventTypeInfo(event.eventType);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                            className={`text-xs p-2 rounded text-white cursor-pointer ${typeInfo.color} hover:opacity-80`}
                          >
                            {!event.allDay && (
                              <div className="flex items-center gap-1 mb-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(event.startDate)}
                              </div>
                            )}
                            <div className="font-medium">{event.title}</div>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1 opacity-80">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Type Legend */}
      <div className="flex flex-wrap gap-3">
        {EVENT_TYPES.map(type => (
          <div key={type.value} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded ${type.color}`}></div>
            <span className="text-gray-600">
              {language === 'es' ? type.labelEs : type.labelEn}
            </span>
          </div>
        ))}
      </div>

      {/* Event Detail Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-serif">{selectedEvent.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded ${getEventTypeInfo(selectedEvent.eventType).color}`}></div>
                  <span className="text-sm text-gray-600">
                    {language === 'es' 
                      ? getEventTypeInfo(selectedEvent.eventType).labelEs 
                      : getEventTypeInfo(selectedEvent.eventType).labelEn}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>
                  {new Date(selectedEvent.startDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                  {!selectedEvent.allDay && ` - ${formatTime(selectedEvent.startDate)}`}
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.reminderEnabled && (
                <div className="flex items-center gap-2 text-sm text-[#6B7B3C]">
                  <Bell className="w-4 h-4" />
                  <span>
                    {REMINDER_OPTIONS.find(r => r.value === selectedEvent.reminderMinutes)?.[language === 'es' ? 'labelEs' : 'labelEn'] || `${selectedEvent.reminderMinutes} min`}
                  </span>
                </div>
              )}
              
              {selectedEvent.description && (
                <p className="text-sm text-gray-600 mt-2">{selectedEvent.description}</p>
              )}
              
              {canEdit && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(selectedEvent)}
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    {t('editEvent')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selectedEvent.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif">
                {editingEvent ? t('editEvent') : t('addEvent')}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('title')} *
                  </label>
                  <Input
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('eventType')}
                  </label>
                  <Select
                    value={eventForm.eventType}
                    onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                    options={EVENT_TYPES.map(type => ({
                      value: type.value,
                      label: language === 'es' ? type.labelEs : type.labelEn
                    }))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={eventForm.allDay}
                    onChange={(e) => setEventForm({ ...eventForm, allDay: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="allDay" className="text-sm text-gray-700">
                    {t('allDay')}
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('startDate')} *
                    </label>
                    <Input
                      type="date"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  {!eventForm.allDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('time')}
                      </label>
                      <Input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('endDate')}
                    </label>
                    <Input
                      type="date"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    />
                  </div>
                  {!eventForm.allDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('time')}
                      </label>
                      <Input
                        type="time"
                        value={eventForm.endTime}
                        onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('location')}
                  </label>
                  <Input
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder={language === 'es' ? 'Ej: Templo principal, Salón social...' : 'E.g.: Main temple, Social hall...'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('description')}
                  </label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Reminder */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="reminderEnabled"
                      checked={eventForm.reminderEnabled}
                      onChange={(e) => setEventForm({ ...eventForm, reminderEnabled: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Bell className="w-4 h-4" />
                      {t('enableReminder')}
                    </label>
                  </div>
                  {eventForm.reminderEnabled && (
                    <Select
                      value={eventForm.reminderMinutes.toString()}
                      onChange={(e) => setEventForm({ ...eventForm, reminderMinutes: parseInt(e.target.value) })}
                      options={REMINDER_OPTIONS.map(opt => ({
                        value: opt.value.toString(),
                        label: language === 'es' ? opt.labelEs : opt.labelEn
                      }))}
                    />
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-[#6B7B3C] hover:bg-[#5a6a31]"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                    {t('save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
