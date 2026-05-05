export type Language = 'es' | 'en';

export const translations = {
  es: {
    // App Branding
    appName: 'Pastoral History',
    appTagline: 'A Pastoral Care & Spiritual Accompaniment System',
    appDescription: 'Sistema de Cuidado Pastoral y Acompañamiento Espiritual',
    
    // Auth
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    fullName: 'Nombre completo',
    forgotPassword: '¿Olvidaste tu contraseña?',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    loginError: 'Credenciales incorrectas',
    signupSuccess: 'Cuenta creada exitosamente',
    
    // Navigation
    dashboard: 'Panel Principal',
    members: 'Miembros',
    settings: 'Configuración',
    profile: 'Perfil',
    notifications: 'Notificaciones',
    
    // Dashboard
    welcomeBack: 'Bienvenido de nuevo',
    pendingFollowUps: 'Seguimientos Pendientes',
    overdueFollowUps: 'Seguimientos Vencidos',
    inactiveMembers: 'Miembros sin contacto reciente',
    sensitiveCases: 'Casos Sensibles',
    observationCases: 'Bajo Observación',
    noAlerts: 'No hay alertas pendientes',
    daysWithoutContact: 'días sin contacto',
    viewAll: 'Ver todos',
    
    // Members
    addMember: 'Agregar Miembro',
    editMember: 'Editar Miembro',
    memberDetails: 'Detalles del Miembro',
    firstName: 'Nombre',
    lastName: 'Apellido',
    phone: 'Teléfono',
    address: 'Dirección',
    birthDate: 'Fecha de nacimiento',
    generalNotes: 'Notas generales',
    markSensitive: 'Requiere cuidado especial',
    markObservation: 'En acompañamiento cercano',
    searchMembers: 'Buscar miembros...',
    noMembersFound: 'No se encontraron miembros',
    confirmDelete: '¿Estás seguro de eliminar este miembro?',
    deleteWarning: 'Esta acción no se puede deshacer',
    
    // Personal and family context
    personalContext: 'Contexto personal y familiar',
    personalContextSubtitle: 'Información opcional para un mejor acompañamiento',
    maritalStatus: 'Estado civil',
    employmentStatus: 'Situación laboral',
    occupation: 'Ocupación',
    hasChildren: 'Hijos',
    previousChurch: 'Procedencia eclesiástica',
    countryOfOrigin: 'País de origen',
    
    // Marital status options
    marital_: 'Sin especificar',
    marital_single: 'Soltero/a',
    marital_married: 'Casado/a',
    marital_widowed: 'Viudo/a',
    marital_divorced: 'Divorciado/a',
    marital_separated: 'Separado/a',
    marital_other: 'Otra situación',
    
    // Employment status options
    employment_: 'Sin especificar',
    employment_employed: 'Empleado/a',
    employment_self_employed: 'Independiente',
    employment_retired: 'Jubilado/a',
    employment_student: 'Estudiante',
    employment_homemaker: 'Hogar',
    employment_seeking: 'Buscando empleo',
    employment_other: 'Otra situación',
    
    // Spiritual History
    spiritualHistory: 'Historia Espiritual',
    conversionDate: 'Fecha de conversión',
    baptismDate: 'Fecha de bautismo',
    spiritualState: 'Estado espiritual',
    growthStage: 'Etapa de crecimiento',
    spiritualGifts: 'Dones espirituales identificados',
    growthAreas: 'Áreas de crecimiento espiritual',
    confidentialObs: 'Observaciones pastorales confidenciales',
    
    // Spiritual states
    state_new_believer: 'Nuevo creyente',
    state_active: 'Activo',
    state_in_process: 'En proceso',
    state_in_crisis: 'En crisis',
    state_restoration: 'En restauración',
    
    // Growth stages
    stage_: 'Sin definir (discernimiento pastoral)',
    stage_initial: 'Inicial',
    stage_development: 'Desarrollo',
    stage_leadership: 'Liderazgo',
    stage_accompaniment: 'Acompañamiento',
    
    // Accompaniment
    accompanimentRegistry: 'Registro de Acompañamiento',
    newAccompaniment: 'Nuevo Registro',
    editAccompaniment: 'Editar Registro',
    encounterDate: 'Fecha del encuentro',
    encounterType: 'Tipo de encuentro',
    mainReason: 'Motivo principal',
    pastoralObservations: 'Observaciones pastorales',
    agreedCommitments: 'Compromisos acordados',
    nextSteps: 'Próximos pasos',
    suggestedFollowUp: 'Fecha sugerida de seguimiento',
    markCompleted: 'Marcar como completado',
    noRecords: 'No hay registros de acompañamiento',
    
    // Encounter types
    type_visit: 'Visita',
    type_counseling: 'Consejería',
    type_call: 'Llamada',
    type_hospital: 'Hospital',
    type_prayer: 'Oración',
    type_other: 'Otro',
    
    // Settings
    languagePreference: 'Idioma de la interfaz',
    notificationSettings: 'Configuración de notificaciones',
    inactiveThreshold: 'Umbral de inactividad (días)',
    enableEmailNotifications: 'Habilitar notificaciones por correo',
    saveChanges: 'Guardar cambios',
    changesSaved: 'Cambios guardados exitosamente',
    
    // Discipleship Pipeline
    discipleship: 'Discipulado',
    discipleshipPipeline: 'Pipeline de Discipulado',
    discipleshipStatus: 'Estado de discipulado',
    currentLesson: 'Lección actual',
    lessonsCompleted: 'Lecciones completadas',
    mentorAssigned: 'Mentor asignado',
    consolidationStage: 'Etapa de consolidación',
    baptismCohort: 'Cohorte de Bautismo',
    baptismCohortPlaceholder: 'Ej: Campaña Primavera 2026',
    activeStudents: 'Estudiantes Activos',
    preparingBaptism: 'Preparándose para Bautismo',
    baptismsThisYear: 'Bautismos Este Año',
    consolidationsCompleted: 'Consolidaciones Completadas',
    retentionRate: 'Tasa de Retención 90 Días',
    pendingEvaluations: 'Evaluaciones Pendientes',
    evaluatedThisYear: 'Evaluados Este Año',
    confirmIntegration: 'Confirmar Integración',
    integrationConfirmed: 'Integración Confirmada',
    retained: 'Retenido',
    notRetained: 'No Retenido',
    pending: 'Pendiente',
    noDataYet: 'Sin datos aún',
    importStudents: 'Importar Estudiantes',
    importCSV: 'Importar CSV',
    downloadTemplate: 'Descargar Plantilla',
    moveToColumn: 'Mover a',
    addStudent: 'Agregar Estudiante',
    addToColumn: 'Agregar a',
    studentName: 'Nombre del estudiante',
    studentAdded: 'Estudiante agregado exitosamente',
    deleteStudent: 'Eliminar estudiante',
    confirmDeleteStudent: '¿Estás seguro de eliminar este estudiante?',
    studentDeleted: 'Estudiante eliminado',
    noStudentsInColumn: 'No hay personas en esta columna',
    
    // Discipleship status options
    status_NONE: 'Sin estado',
    status_INTEREST: 'Interés',
    status_STUDYING: 'Estudiando',
    status_PREPARING: 'Preparándose',
    status_BAPTIZED: 'Bautizado',
    
    // Consolidation stage options
    consolidation_NONE: 'Sin consolidación',
    consolidation_30_DAYS: '30 Días',
    consolidation_60_DAYS: '60 Días',
    consolidation_90_DAYS: '90 Días',
    consolidation_COMPLETED: 'Completada',
    
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    back: 'Volver',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    required: 'Campo requerido',
    optional: 'Opcional',
    today: 'Hoy',
    yesterday: 'Ayer',
    daysAgo: 'hace {days} días',
  },
  en: {
    // App Branding
    appName: 'Pastoral History',
    appTagline: 'A Pastoral Care & Spiritual Accompaniment System',
    appDescription: 'A Pastoral Care & Spiritual Accompaniment System',
    
    // Auth
    login: 'Sign In',
    signup: 'Sign Up',
    logout: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    fullName: 'Full name',
    forgotPassword: 'Forgot your password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loginError: 'Invalid credentials',
    signupSuccess: 'Account created successfully',
    
    // Navigation
    dashboard: 'Dashboard',
    members: 'Members',
    settings: 'Settings',
    profile: 'Profile',
    notifications: 'Notifications',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    pendingFollowUps: 'Pending Follow-ups',
    overdueFollowUps: 'Overdue Follow-ups',
    inactiveMembers: 'Members without recent contact',
    sensitiveCases: 'Sensitive Cases',
    observationCases: 'Under Observation',
    noAlerts: 'No pending alerts',
    daysWithoutContact: 'days without contact',
    viewAll: 'View all',
    
    // Members
    addMember: 'Add Member',
    editMember: 'Edit Member',
    memberDetails: 'Member Details',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    address: 'Address',
    birthDate: 'Birth date',
    generalNotes: 'General notes',
    markSensitive: 'Requires special care',
    markObservation: 'In close accompaniment',
    searchMembers: 'Search members...',
    noMembersFound: 'No members found',
    confirmDelete: 'Are you sure you want to delete this member?',
    deleteWarning: 'This action cannot be undone',
    
    // Personal and family context
    personalContext: 'Personal and family context',
    personalContextSubtitle: 'Optional information for better accompaniment',
    maritalStatus: 'Marital status',
    employmentStatus: 'Employment status',
    occupation: 'Occupation',
    hasChildren: 'Children',
    previousChurch: 'Previous church background',
    countryOfOrigin: 'Country of origin',
    
    // Marital status options
    marital_: 'Not specified',
    marital_single: 'Single',
    marital_married: 'Married',
    marital_widowed: 'Widowed',
    marital_divorced: 'Divorced',
    marital_separated: 'Separated',
    marital_other: 'Other situation',
    
    // Employment status options
    employment_: 'Not specified',
    employment_employed: 'Employed',
    employment_self_employed: 'Self-employed',
    employment_retired: 'Retired',
    employment_student: 'Student',
    employment_homemaker: 'Homemaker',
    employment_seeking: 'Job seeking',
    employment_other: 'Other situation',
    
    // Spiritual History
    spiritualHistory: 'Spiritual History',
    conversionDate: 'Conversion date',
    baptismDate: 'Baptism date',
    spiritualState: 'Spiritual state',
    growthStage: 'Growth stage',
    spiritualGifts: 'Identified spiritual gifts',
    growthAreas: 'Spiritual growth areas',
    confidentialObs: 'Confidential pastoral observations',
    
    // Spiritual states
    state_new_believer: 'New believer',
    state_active: 'Active',
    state_in_process: 'In process',
    state_in_crisis: 'In crisis',
    state_restoration: 'In restoration',
    
    // Growth stages
    stage_: 'Not defined (pastoral discernment)',
    stage_initial: 'Initial',
    stage_development: 'Development',
    stage_leadership: 'Leadership',
    stage_accompaniment: 'Accompaniment',
    
    // Accompaniment
    accompanimentRegistry: 'Accompaniment Registry',
    newAccompaniment: 'New Record',
    editAccompaniment: 'Edit Record',
    encounterDate: 'Encounter date',
    encounterType: 'Encounter type',
    mainReason: 'Main reason',
    pastoralObservations: 'Pastoral observations',
    agreedCommitments: 'Agreed commitments',
    nextSteps: 'Next steps',
    suggestedFollowUp: 'Suggested follow-up date',
    markCompleted: 'Mark as completed',
    noRecords: 'No accompaniment records',
    
    // Encounter types
    type_visit: 'Visit',
    type_counseling: 'Counseling',
    type_call: 'Phone call',
    type_hospital: 'Hospital',
    type_prayer: 'Prayer',
    type_other: 'Other',
    
    // Settings
    languagePreference: 'Interface language',
    notificationSettings: 'Notification settings',
    inactiveThreshold: 'Inactivity threshold (days)',
    enableEmailNotifications: 'Enable email notifications',
    saveChanges: 'Save changes',
    changesSaved: 'Changes saved successfully',
    
    // Discipleship Pipeline
    discipleship: 'Discipleship',
    discipleshipPipeline: 'Discipleship Pipeline',
    discipleshipStatus: 'Discipleship status',
    currentLesson: 'Current lesson',
    lessonsCompleted: 'Lessons completed',
    mentorAssigned: 'Assigned mentor',
    consolidationStage: 'Consolidation stage',
    baptismCohort: 'Baptism Cohort',
    baptismCohortPlaceholder: 'E.g., Spring 2026 Campaign',
    activeStudents: 'Active Students',
    preparingBaptism: 'Preparing for Baptism',
    baptismsThisYear: 'Baptisms This Year',
    consolidationsCompleted: 'Consolidations Completed',
    retentionRate: '90-Day Retention Rate',
    pendingEvaluations: 'Pending Evaluations',
    evaluatedThisYear: 'Evaluated This Year',
    confirmIntegration: 'Confirm Integration',
    integrationConfirmed: 'Integration Confirmed',
    retained: 'Retained',
    notRetained: 'Not Retained',
    pending: 'Pending',
    noDataYet: 'No data yet',
    importStudents: 'Import Students',
    importCSV: 'Import CSV',
    downloadTemplate: 'Download Template',
    moveToColumn: 'Move to',
    addStudent: 'Add Student',
    addToColumn: 'Add to',
    studentName: 'Student name',
    studentAdded: 'Student added successfully',
    deleteStudent: 'Delete student',
    confirmDeleteStudent: 'Are you sure you want to delete this student?',
    studentDeleted: 'Student deleted',
    noStudentsInColumn: 'No people in this column',
    
    // Discipleship status options
    status_NONE: 'No status',
    status_INTEREST: 'Interest',
    status_STUDYING: 'Studying',
    status_PREPARING: 'Preparing',
    status_BAPTIZED: 'Baptized',
    
    // Consolidation stage options
    consolidation_NONE: 'No consolidation',
    consolidation_30_DAYS: '30 Days',
    consolidation_60_DAYS: '60 Days',
    consolidation_90_DAYS: '90 Days',
    consolidation_COMPLETED: 'Completed',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    required: 'Required field',
    optional: 'Optional',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{days} days ago',
  }
};

export function t(key: keyof typeof translations.es, lang: Language = 'es', params?: Record<string, string | number>): string {
  const value = translations[lang]?.[key] ?? translations.es[key] ?? key;
  if (params) {
    return Object.entries(params).reduce((acc, [k, v]) => acc.replace(`{${k}}`, String(v)), value);
  }
  return value;
}

export const spiritualStates = ['new_believer', 'active', 'in_process', 'in_crisis', 'restoration'] as const;
export const growthStages = ['', 'initial', 'development', 'leadership', 'accompaniment'] as const; // Empty option first for optional field
export const encounterTypes = ['visit', 'counseling', 'call', 'hospital', 'prayer', 'other'] as const;
export const maritalStatuses = ['', 'single', 'married', 'widowed', 'divorced', 'separated', 'other'] as const;
export const employmentStatuses = ['', 'employed', 'self_employed', 'retired', 'student', 'homemaker', 'seeking', 'other'] as const;