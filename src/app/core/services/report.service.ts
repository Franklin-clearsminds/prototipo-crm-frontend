import { Injectable, signal, computed } from '@angular/core';
import { MockLeadService } from './lead.service';
import { MockAgentService } from './agent.service';
import { MockPhoneLineService } from './phone-line.service';
import { MockCampaignService } from './campaign.service';
import { ActivityLog, DashboardMetrics } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockReportService {
  // Activity Feed Logger Signal
  private activitiesSignal = signal<ActivityLog[]>([
    {
      id: 'act_1',
      type: 'lead_received',
      title: 'Nuevo Lead Recibido',
      description: 'Robert T. ingresó vía Web Ad en Texas.',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2m ago
    },
    {
      id: 'act_2',
      type: 'call_completed',
      title: 'Llamada Realizada',
      description: 'Sarah Jenkins habló con Maria Sanchez (OK).',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15m ago
    },
    {
      id: 'act_3',
      type: 'sale_registered',
      title: 'Venta Registrada',
      description: 'Póliza Term Life ($1.2M) cerrada para Michael Brown por Sarah J.',
      createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString() // 42m ago
    },
    {
      id: 'act_4',
      type: 'sms_sent',
      title: 'Campaña SMS Automatizada',
      description: 'Mensaje "Drip 01" enviado a 14 leads calificados.',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1h ago
    },
    {
      id: 'act_5',
      type: 'appointment_scheduled',
      title: 'Cita Agendada',
      description: 'Elizabeth Wilson agendó reunión virtual para firmar solicitud.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ]);

  activities = this.activitiesSignal.asReadonly();

  constructor(
    private leadService: MockLeadService,
    private agentService: MockAgentService,
    private phoneLineService: MockPhoneLineService,
    private campaignService: MockCampaignService
  ) {}

  // Compute live dashboard metrics from current states of other services!
  metrics = computed<DashboardMetrics>(() => {
    const leads = this.leadService.getLeads();
    const agents = this.agentService.getAgents();
    const lines = this.phoneLineService.getPhoneLines();

    const newLeads = leads.filter(l => l.status === 'new').length;
    const assignedLeads = leads.filter(l => l.status === 'assigned').length;
    const contactedLeads = leads.filter(l => l.status === 'contacted').length;
    const followUpLeads = leads.filter(l => l.status === 'follow_up').length;
    const appointments = leads.filter(l => l.status === 'appointment').length;
    const sales = leads.filter(l => l.status === 'sold').length;

    const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'busy').length;
    const activeLines = lines.filter(l => l.status === 'assigned' || l.status === 'in_use').length;

    return {
      newLeadsCount: newLeads,
      assignedLeadsCount: assignedLeads,
      contactedLeadsCount: contactedLeads,
      followUpLeadsCount: followUpLeads,
      appointmentsCount: appointments,
      salesCount: sales,
      activeAgentsCount: activeAgents,
      activePhoneLinesCount: activeLines,
      // Fake variation percentages for visual aesthetics
      leadsNewPercentage: 12,
      leadsAssignedPercentage: 0, // stable
      leadsContactedPercentage: 5.4,
      leadsFollowUpPercentage: -2,
      appointmentsPercentage: 18,
      salesPercentage: 14,
      activeAgentsCountPercentage: 0,
      activePhoneLinesCountPercentage: 0
    };
  });

  // Dynamic alerts list computed on current data states
  alerts = computed(() => {
    const leads = this.leadService.getLeads();
    const lines = this.phoneLineService.getPhoneLines();
    const integrations = this.campaignService.getIntegrations();

    const alertList: { type: 'spam' | 'offline' | 'uncontacted' | 'unassigned'; message: string; subtext: string }[] = [];

    // 1. Check for spam risk lines
    const spamLine = lines.find(l => l.spamRiskScore > 75);
    if (spamLine) {
      alertList.push({
        type: 'spam',
        message: 'Spam Risk Detected',
        subtext: `Line ${spamLine.number} has been flagged for high carrier spam score (${spamLine.spamRiskScore}%).`
      });
    }

    // 2. Check for offline integrations
    const offlineInt = integrations.find(i => i.status === 'warning' || i.status === 'error');
    if (offlineInt) {
      alertList.push({
        type: 'offline',
        message: 'Integration Issue',
        subtext: `${offlineInt.name} reported sync lag or error. ${offlineInt.recentErrors?.[0] || 'Check setup.'}`
      });
    }

    // 3. Uncontacted leads alert
    const uncontactedCount = leads.filter(l => l.status === 'assigned' && l.noContactDays > 2).length;
    if (uncontactedCount > 0) {
      alertList.push({
        type: 'uncontacted',
        message: 'Uncontacted Leads Alert',
        subtext: `${uncontactedCount} assigned leads have not been contacted for more than 48 hours.`
      });
    }

    return alertList;
  });

  logActivity(type: ActivityLog['type'], title: string, description: string) {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      type,
      title,
      description,
      createdAt: new Date().toISOString()
    };
    this.activitiesSignal.update(current => [newLog, ...current]);
  }
}
