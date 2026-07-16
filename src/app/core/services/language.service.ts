import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<'es' | 'en'>('es');

  private translations: Record<string, Record<'es' | 'en', string>> = {
    // Sidebar
    'menu.dashboard': { es: 'Dashboard', en: 'Dashboard' },
    'menu.leads': { es: 'Leads', en: 'Leads' },
    'menu.agents': { es: 'Agentes', en: 'Agents' },
    'menu.pipeline': { es: 'Pipeline', en: 'Pipeline' },
    'menu.calls': { es: 'Llamadas', en: 'Calls' },
    'menu.messages': { es: 'Mensajes SMS', en: 'SMS Messages' },
    'menu.phoneLines': { es: 'Líneas Tel', en: 'Phone Lines' },
    'menu.campaigns': { es: 'Campañas', en: 'Campaigns' },
    'menu.reports': { es: 'Reportes', en: 'Reports' },
    'menu.settings': { es: 'Configuración', en: 'Settings' },
    'menu.logout': { es: 'Cerrar sesión', en: 'Logout' },
    
    // Header
    'header.newLead': { es: 'Nuevo Lead', en: 'New Lead' },
    'header.search': { es: 'Buscar leads por nombre o teléfono...', en: 'Search leads by name or phone...' },
    'header.notifications': { es: 'Notificaciones', en: 'Notifications' },
    'header.markRead': { es: 'Marcar leído', en: 'Mark read' },
    'header.profileSettings': { es: 'Configuración de Perfil', en: 'Profile Settings' },
    'header.admin': { es: 'Administrador', en: 'Admin' },
    'header.agent': { es: 'Agente', en: 'Agent' },

    // Modal manual lead
    'modal.title': { es: 'Ingresar Nuevo Lead Manual', en: 'Enter New Manual Lead' },
    'modal.cancel': { es: 'Cancelar', en: 'Cancel' },
    'modal.save': { es: 'Guardar Lead', en: 'Save Lead' },
    'modal.name': { es: 'Nombre Completo *', en: 'Full Name *' },
    'modal.phone': { es: 'Teléfono (EE. UU.) *', en: 'Phone (US) *' },
    'modal.state': { es: 'Estado de Residencia *', en: 'State of Residence *' },
    'modal.age': { es: 'Edad (Años) *', en: 'Age (Years) *' },
    'modal.interest': { es: 'Producto de Interés', en: 'Product of Interest' },
    'modal.health': { es: 'Condición de Salud', en: 'Health Condition' },
    'modal.campaign': { es: 'Campaña de Origen *', en: 'Source Campaign *' },
    'modal.notes': { es: 'Notas Iniciales', en: 'Initial Notes' },

    // Dashboard Page
    'dash.title': { es: 'Panel de Control de Leads', en: 'Leads Dashboard' },
    'dash.subtitle': { es: 'Monitoreo de leads calificados, llamadas en cola y conversión de ventas.', en: 'Monitoring qualified leads, call queues, and sales conversions.' },
    'dash.card.leads': { es: 'Leads de Hoy', en: 'Leads Today' },
    'dash.card.contacted': { es: 'Contactados', en: 'Contacted' },
    'dash.card.appointments': { es: 'Citas Hoy', en: 'Appointments Today' },
    'dash.card.sales': { es: 'Ventas del Mes', en: 'Sales of the Month' },
    'dash.card.totalLeads': { es: 'Leads en Base', en: 'Leads in Database' },
    'dash.card.dialLimit': { es: 'Límite Marcación', en: 'Dial Limit' },
    'dash.card.conversion': { es: 'Tasa de Conversión', en: 'Conversion Rate' },
    'dash.card.activeLines': { es: 'Líneas SIP Activas', en: 'Active SIP Lines' },
    'dash.alerts': { es: 'Alertas Críticas', en: 'Critical Alerts' },
    'dash.activity': { es: 'Actividad Reciente', en: 'Recent Activity' },
    'dash.chart1': { es: 'Ingreso Diario de Leads', en: 'Daily Leads Inflow' },
    'dash.chart2': { es: 'Distribución por Etapas', en: 'Distribution by Stage' },

    // Leads Page
    'leads.title': { es: 'Administrador de Leads', en: 'Leads Manager' },
    'leads.cleanFilters': { es: 'Limpiar filtros', en: 'Clear filters' },
    'leads.autoAssign': { es: 'Asignación Automática', en: 'Auto Assignment' },
    'leads.filter.search': { es: 'Buscar por nombre o teléfono...', en: 'Search by name or phone...' },
    'leads.filter.status': { es: 'Todos los estados', en: 'All statuses' },
    'leads.filter.agent': { es: 'Todos los agentes', en: 'All agents' },
    'leads.filter.state': { es: 'Todos los estados EE.UU.', en: 'All US states' },
    'leads.filter.campaign': { es: 'Todas las campañas', en: 'All campaigns' },
    'leads.filter.interest': { es: 'Todos los productos', en: 'All products' },

    // Leads Table Columns
    'leads.col.name': { es: 'Nombre', en: 'Name' },
    'leads.col.phone': { es: 'Teléfono', en: 'Phone' },
    'leads.col.state': { es: 'Estado Res.', en: 'Res. State' },
    'leads.col.age': { es: 'Edad', en: 'Age' },
    'leads.col.interest': { es: 'Interés', en: 'Interest' },
    'leads.col.status': { es: 'Estado Lead', en: 'Lead Status' },
    'leads.col.agent': { es: 'Agente Asignado', en: 'Assigned Agent' },
    'leads.col.created': { es: 'Fecha Ingreso', en: 'Date Received' },
    'leads.col.noContact': { es: 'Sin Contacto', en: 'No Contact' },
    'leads.col.actions': { es: 'Acciones', en: 'Actions' },

    'pipe.title': { es: 'Embudo de Ventas (Kanban)', en: 'Sales Funnel (Kanban)' },
    'pipe.subtitle': { es: 'Arrastra y suelta leads para actualizar su etapa del pipeline en tiempo real.', en: 'Drag and drop leads to update their pipeline stage in real time.' },
    'pipe.col.assigned': { es: 'Nuevos Asignados', en: 'New Assigned' },
    'pipe.col.contacted': { es: 'Contactados', en: 'Contacted' },
    'pipe.col.no_answer': { es: 'Sin respuesta', en: 'No Answer' },
    'pipe.col.follow_up': { es: 'En seguimiento', en: 'Follow Up' },
    'pipe.col.appointment': { es: 'Cita agendada', en: 'Appointment Scheduled' },
    'pipe.col.sold': { es: 'Venta realizada', en: 'Sold' },
    'pipe.col.discarded': { es: 'Descartados', en: 'Discarded' },

    // Agents Page
    'agents.title': { es: 'Agentes Comerciales', en: 'Commercial Agents' },
    'agents.subtitle': { es: 'Gestión de personal de ventas, territorios de seguros asignados y KPIs.', en: 'Sales staff management, assigned insurance territories, and KPIs.' },
    'agents.register': { es: 'Registrar Agente', en: 'Register Agent' },

    // Agents Table Columns
    'agents.col.profile': { es: 'Agente', en: 'Agent' },
    'agents.col.email': { es: 'Correo', en: 'Email' },
    'agents.col.status': { es: 'Estado', en: 'Status' },
    'agents.col.leads': { es: 'Leads', en: 'Leads' },
    'agents.col.contacted': { es: 'Contactados', en: 'Contacted' },
    'agents.col.appointments': { es: 'Citas', en: 'Appointments' },
    'agents.col.sales': { es: 'Ventas', en: 'Sales' },
    'agents.col.states': { es: 'Estados Asignados', en: 'Assigned States' },
    'agents.col.lines': { es: 'Líneas Telefónicas', en: 'Phone Lines' },
    'agents.col.actions': { es: 'Ficha', en: 'Profile' },

    // Phone Lines Page
    'lines.title': { es: 'Administración de Líneas Telefónicas', en: 'SIP Phone Lines Management' },
    'lines.subtitle': { es: 'Gestión de prefijos telefónicos locales (Local Presence) y reputación de Carriers.', en: 'Local phone prefixes management (Local Presence) and Carrier reputation.' },
    'lines.buy': { es: 'Comprar Número Regional', en: 'Buy Regional Number' },

    // Phone Lines Table Columns
    'lines.col.number': { es: 'Número', en: 'Number' },
    'lines.col.city': { es: 'Ubicación', en: 'Location' },
    'lines.col.provider': { es: 'Proveedor', en: 'Provider' },
    'lines.col.status': { es: 'Estado', en: 'Status' },
    'lines.col.agent': { es: 'Agente Responsable', en: 'Responsible Agent' },
    'lines.col.calls': { es: 'Llamadas', en: 'Calls' },
    'lines.col.sms': { es: 'SMS', en: 'SMS' },
    'lines.col.spam': { es: 'Spam Risk Score', en: 'Spam Risk Score' },

    // Calls Page
    'calls.title': { es: 'Historial de Llamadas', en: 'Calls Log & History' },
    'calls.subtitle': { es: 'Bitácora general de llamadas salientes, entrantes y resultados de contacto.', en: 'General log of outbound, inbound calls and contact outcomes.' },

    // Calls Table Columns
    'calls.col.lead': { es: 'Prospecto / Lead', en: 'Lead' },
    'calls.col.phone': { es: 'Teléfono', en: 'Phone' },
    'calls.col.location': { es: 'Dirección', en: 'Location' },
    'calls.col.agent': { es: 'Agente', en: 'Agent' },
    'calls.col.duration': { es: 'Duración', en: 'Duration' },
    'calls.col.outcome': { es: 'Resultado', en: 'Outcome' },
    'calls.col.notes': { es: 'Comentarios del Agente', en: 'Agent Comments' },
    'calls.col.date': { es: 'Fecha y Hora', en: 'Date & Time' },

    // Campaigns Page
    'camp.title': { es: 'Campañas e Integraciones', en: 'Campaigns & Integrations' },
    'camp.subtitle': { es: 'Enlace de pasarelas de comunicación, CRM externos y fuentes de Meta Ads.', en: 'Connecting communication gateways, external CRMs, and Meta Ads sources.' },

    // Reports Page
    'rep.title': { es: 'Indicadores y Reportes de Rendimiento', en: 'Performance Indicators & Reports' },
    'rep.subtitle': { es: 'Estadísticas agregadas de conversión comercial y efectividad de campañas.', en: 'Aggregated sales conversion statistics and campaign effectiveness.' },

    // Settings Page
    'set.title': { es: 'Configuraciones del Sistema', en: 'System Settings' },
    'set.subtitle': { es: 'Perfiles de la empresa, reglas de distribución round-robin y plantillas SMS.', en: 'Company profiles, round-robin distribution rules, and SMS templates.' }
  };

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'es' ? 'en' : 'es');
  }

  setLanguage(lang: 'es' | 'en') {
    this.currentLang.set(lang);
  }

  t(key: string): string {
    const item = this.translations[key];
    if (!item) return key;
    return item[this.currentLang()];
  }
}
