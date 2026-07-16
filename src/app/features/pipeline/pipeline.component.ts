import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockLeadService } from '../../core/services/lead.service';
import { MockAgentService } from '../../core/services/agent.service';
import { MockCampaignService } from '../../core/services/campaign.service';
import { MockCallService } from '../../core/services/call.service';
import { LanguageService } from '../../core/services/language.service';
import { Lead, LeadStatus } from '../../core/models';

interface Column {
  id: LeadStatus;
  title: string;
  class: string;
}

@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss']
})
export class PipelineComponent {
  leadService = inject(MockLeadService);
  agentService = inject(MockAgentService);
  campaignService = inject(MockCampaignService);
  callService = inject(MockCallService);
  langService = inject(LanguageService);

  t(key: string): string {
    return this.langService.t(key);
  }
  private router = inject(Router);

  // Kanban filters
  filterAgent = signal<string>('');
  filterCampaign = signal<string>('');

  agentsList = computed(() => this.agentService.agents());
  campaignsList = computed(() => this.campaignService.campaigns());

  columns: Column[] = [
    { id: 'assigned', title: 'Nuevos Asignados', class: 'col-assigned' },
    { id: 'contacted', title: 'Contactados', class: 'col-contacted' },
    { id: 'no_answer', title: 'Sin respuesta', class: 'col-no-answer' },
    { id: 'follow_up', title: 'En seguimiento', class: 'col-follow-up' },
    { id: 'appointment', title: 'Cita agendada', class: 'col-appointment' },
    { id: 'sold', title: 'Venta realizada', class: 'col-sold' },
    { id: 'discarded', title: 'Descartados', class: 'col-discarded' }
  ];

  // Computes lists grouped by columns, applying filters
  kanbanData = computed(() => {
    const leads = this.leadService.getLeads();
    const agentFilter = this.filterAgent();
    const campaignFilter = this.filterCampaign();

    // Filter leads
    let filtered = leads;
    if (agentFilter) {
      filtered = filtered.filter(l => l.assignedAgentId === agentFilter);
    }
    if (campaignFilter) {
      filtered = filtered.filter(l => l.campaignId === campaignFilter);
    }

    // Group by status column
    const groups: Record<LeadStatus, Lead[]> = {
      new: [],
      assigned: [],
      contacted: [],
      no_answer: [],
      follow_up: [],
      appointment: [],
      sold: [],
      discarded: []
    };

    filtered.forEach(lead => {
      if (lead.status === 'new' || lead.status === 'assigned') {
        groups['assigned'].push(lead);
      } else if (groups[lead.status]) {
        groups[lead.status].push(lead);
      }
    });

    return groups;
  });

  // HTML5 Drag and Drop Handlers
  onDragStart(event: DragEvent, leadId: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', leadId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetStatus: LeadStatus) {
    event.preventDefault();
    if (event.dataTransfer) {
      const leadId = event.dataTransfer.getData('text/plain');
      if (leadId) {
        this.leadService.updateLeadStatus(leadId, targetStatus);
      }
    }
  }

  getAgentName(agentId?: string): string {
    if (!agentId) return 'Sin asignar';
    const agent = this.agentService.getAgentById(agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Sin asignar';
  }

  startCall(lead: Lead, event: Event) {
    event.stopPropagation(); // prevent card click redirect
    this.callService.startCall(lead);
  }

  openLeadDetail(leadId: string) {
    this.router.navigate(['/leads', leadId]);
  }
}
