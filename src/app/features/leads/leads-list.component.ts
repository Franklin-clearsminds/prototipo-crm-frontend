import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MockLeadService } from '../../core/services/lead.service';
import { MockAgentService } from '../../core/services/agent.service';
import { MockCallService } from '../../core/services/call.service';
import { MockMessageService } from '../../core/services/message.service';
import { MockCampaignService } from '../../core/services/campaign.service';
import { MockReportService } from '../../core/services/report.service';
import { LanguageService } from '../../core/services/language.service';
import { Lead, LeadStatus, Agent } from '../../core/models';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.scss']
})
export class LeadsListComponent implements OnInit {
  leadService = inject(MockLeadService);
  agentService = inject(MockAgentService);
  callService = inject(MockCallService);
  messageService = inject(MockMessageService);
  campaignService = inject(MockCampaignService);
  reportService = inject(MockReportService);
  langService = inject(LanguageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  t(key: string): string {
    return this.langService.t(key);
  }

  // Automatic assignment state
  showAutoAssignModal = signal<boolean>(false);
  autoAssignAgents = signal<{ agent: Agent; checked: boolean; quantity: number }[]>([]);
  autoAssignMode = signal<'balanced' | 'quantity'>('balanced');
  targetLeadsForAssign = signal<Lead[]>([]);

  // Loading skeleton state
  isLoading = signal<boolean>(true);

  // Search & Filter state
  searchTerm = signal<string>('');
  filterStatus = signal<string>('');
  filterAgent = signal<string>('');
  filterState = signal<string>('');
  filterCampaign = signal<string>('');
  filterInterest = signal<string>('');
  filterUncontacted = signal<boolean>(false);

  // Sorting
  sortBy = signal<string>('date'); // 'name' | 'date'
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = 7;

  // Selected leads for bulk action
  selectedLeadIds = signal<string[]>([]);
  showBulkAssignModal = signal<boolean>(false);
  bulkSelectedAgentId = signal<string>('');

  // Selected lead for detail sidebar drawer
  selectedLeadForDrawer = signal<Lead | null>(null);

  // Note text inside detail drawer
  newDrawerNote = signal<string>('');

  // SMS chat message inside drawer
  newDrawerSms = signal<string>('');

  // Dropdown list feeds
  agentsList = computed(() => this.agentService.agents());
  campaignsList = computed(() => this.campaignService.campaigns());
  states = ['TX', 'OK', 'FL', 'CA', 'IL', 'NY', 'GA', 'AZ', 'NC', 'NV'];
  interests = ['Term Life ($500k)', 'Term Life ($1M)', 'Term Life ($250k)', 'Whole Life ($250k)', 'Whole Life ($100k)', 'Final Expense ($25k)', 'Final Expense ($15k)'];

  statusList: { value: LeadStatus; label: string }[] = [
    { value: 'new', label: 'Nuevo' },
    { value: 'assigned', label: 'Asignado' },
    { value: 'contacted', label: 'Contactado' },
    { value: 'no_answer', label: 'Sin respuesta' },
    { value: 'follow_up', label: 'En seguimiento' },
    { value: 'appointment', label: 'Cita agendada' },
    { value: 'sold', label: 'Venta realizada' },
    { value: 'discarded', label: 'Descartado' }
  ];

  ngOnInit() {
    // Read route query parameters (for global search redirects)
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm.set(params['q']);
      }
    });

    // Simulate skeleton loading
    setTimeout(() => {
      this.isLoading.set(false);
    }, 600);
  }

  // Live filtering and sorting list computed on other Signals!
  filteredLeads = computed(() => {
    let list = this.leadService.getLeads();

    // Search query check (name or phone)
    const query = this.searchTerm().trim().toLowerCase();
    if (query) {
      list = list.filter(l => 
        l.name.toLowerCase().includes(query) || 
        l.phone.includes(query)
      );
    }

    // Dropdowns filters
    if (this.filterStatus()) {
      list = list.filter(l => l.status === this.filterStatus());
    }
    if (this.filterAgent()) {
      list = list.filter(l => l.assignedAgentId === this.filterAgent());
    }
    if (this.filterState()) {
      list = list.filter(l => l.state === this.filterState());
    }
    if (this.filterCampaign()) {
      list = list.filter(l => l.campaignId === this.filterCampaign());
    }
    if (this.filterInterest()) {
      list = list.filter(l => l.interest.includes(this.filterInterest()));
    }
    if (this.filterUncontacted()) {
      // leads with no contact logs
      list = list.filter(l => !l.lastContactedAt);
    }

    // Sort
    list = [...list].sort((a, b) => {
      let comparison = 0;
      if (this.sortBy() === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });

    return list;
  });

  // Paginated sublist based on filter outputs
  paginatedLeads = computed(() => {
    const list = this.filteredLeads();
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredLeads().length / this.pageSize) || 1;
  });

  setSort(by: string) {
    if (this.sortBy() === by) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(by);
      this.sortDirection.set('desc');
    }
    this.currentPage.set(1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Search resets
  resetFilters() {
    this.searchTerm.set('');
    this.filterStatus.set('');
    this.filterAgent.set('');
    this.filterState.set('');
    this.filterCampaign.set('');
    this.filterInterest.set('');
    this.filterUncontacted.set(false);
    this.currentPage.set(1);
    this.selectedLeadIds.set([]);
  }

  // Row selection checkbox triggers
  toggleSelectLead(leadId: string) {
    this.selectedLeadIds.update(current => 
      current.includes(leadId) 
        ? current.filter(id => id !== leadId)
        : [...current, leadId]
    );
  }

  toggleSelectAll() {
    const ids = this.paginatedLeads().map(l => l.id);
    const allSelected = ids.every(id => this.selectedLeadIds().includes(id));
    
    if (allSelected) {
      // Remove all visible page ids
      this.selectedLeadIds.update(current => current.filter(id => !ids.includes(id)));
    } else {
      // Add all missing visible page ids
      this.selectedLeadIds.update(current => {
        const added = ids.filter(id => !current.includes(id));
        return [...current, ...added];
      });
    }
  }

  isLeadSelected(leadId: string): boolean {
    return this.selectedLeadIds().includes(leadId);
  }

  isAllPageSelected(): boolean {
    const ids = this.paginatedLeads().map(l => l.id);
    if (ids.length === 0) return false;
    return ids.every(id => this.selectedLeadIds().includes(id));
  }

  // Lead quick actions triggers
  startLeadCall(lead: Lead) {
    this.callService.startCall(lead);
  }

  changeStatus(leadId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.leadService.updateLeadStatus(leadId, select.value as LeadStatus);
  }

  assignAgentSingle(leadId: string, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.leadService.assignAgentToLead(leadId, select.value || undefined);
  }

  discardLead(leadId: string) {
    this.leadService.updateLeadStatus(leadId, 'discarded');
  }

  // Bulk actions triggers
  openBulkAssign() {
    if (this.selectedLeadIds().length === 0) return;
    this.showBulkAssignModal.set(true);
  }

  closeBulkAssign() {
    this.showBulkAssignModal.set(false);
    this.bulkSelectedAgentId.set('');
  }

  submitBulkAssign() {
    if (!this.bulkSelectedAgentId()) return;
    this.leadService.assignAgentBulk(this.selectedLeadIds(), this.bulkSelectedAgentId());
    this.selectedLeadIds.set([]);
    this.closeBulkAssign();
  }

  openAutoAssign() {
    const list = this.agentService.getAgents().map(agent => ({
      agent,
      checked: true,
      quantity: 1
    }));
    this.autoAssignAgents.set(list);

    let targetList: Lead[] = [];
    if (this.selectedLeadIds().length > 0) {
      targetList = this.leadService.getLeads().filter(l => this.selectedLeadIds().includes(l.id));
    } else {
      targetList = this.leadService.getLeads().filter(l => l.status === 'new');
    }
    this.targetLeadsForAssign.set(targetList);

    this.showAutoAssignModal.set(true);
  }

  closeAutoAssign() {
    this.showAutoAssignModal.set(false);
  }

  toggleAutoAssignAgent(agentId: string) {
    this.autoAssignAgents.update(list =>
      list.map(a => a.agent.id === agentId ? { ...a, checked: !a.checked } : a)
    );
  }

  setAutoAssignQuantity(agentId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const qty = parseInt(input.value) || 1;
    this.autoAssignAgents.update(list =>
      list.map(a => a.agent.id === agentId ? { ...a, quantity: qty } : a)
    );
  }

  submitAutoAssign() {
    const leadsToAssign = this.targetLeadsForAssign();

    if (leadsToAssign.length === 0) {
      alert('No hay leads para distribuir. Seleccione leads en la tabla o verifique que existan leads "Nuevos".');
      return;
    }

    const selectedAgents = this.autoAssignAgents().filter(a => a.checked);
    if (selectedAgents.length === 0) {
      alert('Debe seleccionar al menos un agente.');
      return;
    }

    const mode = this.autoAssignMode();

    if (mode === 'balanced') {
      leadsToAssign.forEach((lead, index) => {
        const agentWrap = selectedAgents[index % selectedAgents.length];
        this.leadService.assignAgentToLead(lead.id, agentWrap.agent.id);
      });
      
      this.reportService.logActivity(
        'lead_assigned',
        'Asignación Automática Equilibrada',
        `Se distribuyeron ${leadsToAssign.length} leads equitativamente entre ${selectedAgents.length} agentes.`
      );
    } else {
      let leadIndex = 0;
      selectedAgents.forEach(agentWrap => {
        const qty = agentWrap.quantity;
        for (let i = 0; i < qty && leadIndex < leadsToAssign.length; i++) {
          const lead = leadsToAssign[leadIndex];
          this.leadService.assignAgentToLead(lead.id, agentWrap.agent.id);
          leadIndex++;
        }
      });
      
      this.reportService.logActivity(
        'lead_assigned',
        'Asignación Automática por Cantidad',
        `Se distribuyeron ${leadIndex} leads según las cantidades especificadas entre ${selectedAgents.length} agentes.`
      );
    }

    this.selectedLeadIds.set([]);
    this.closeAutoAssign();
  }

  // Drawer Side panel detail toggle
  openLeadDrawer(lead: Lead) {
    this.selectedLeadForDrawer.set(lead);
    // Auto-create SMS conversation in memory if missing
    this.messageService.createConversationForLead(lead.id, lead.name, lead.phone);
  }

  closeLeadDrawer() {
    this.selectedLeadForDrawer.set(null);
    this.newDrawerNote.set('');
    this.newDrawerSms.set('');
  }

  get activeDrawerConversation() {
    const lead = this.selectedLeadForDrawer();
    if (!lead) return null;
    return this.messageService.getConversationByLeadId(lead.id);
  }

  addDrawerNote() {
    const note = this.newDrawerNote().trim();
    const lead = this.selectedLeadForDrawer();
    if (note && lead) {
      this.leadService.addNote(lead.id, `Nota de agente: ${note}`);
      this.newDrawerNote.set('');
      // update signal layout
      this.selectedLeadForDrawer.set(this.leadService.getLeadById(lead.id) || null);
    }
  }

  sendDrawerSms() {
    const text = this.newDrawerSms().trim();
    const conv = this.activeDrawerConversation;
    if (text && conv) {
      this.messageService.sendMessage(conv.id, text);
      this.newDrawerSms.set('');
      // update state
      setTimeout(() => {
        const lead = this.selectedLeadForDrawer();
        if (lead) {
          this.selectedLeadForDrawer.set(this.leadService.getLeadById(lead.id) || null);
        }
      }, 500);
    }
  }

  getAgentName(agentId?: string): string {
    if (!agentId) return 'Sin asignar';
    const agent = this.agentService.getAgentById(agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Sin asignar';
  }

  getCampaignName(campId: string): string {
    const camp = this.campaignService.getCampaigns().find(c => c.id === campId);
    return camp ? camp.name : 'Campaña general';
  }

  openSmsPage(lead: Lead) {
    // Create conversation and redirect to Messages center
    const convId = this.messageService.createConversationForLead(lead.id, lead.name, lead.phone);
    this.router.navigate(['/messages']);
  }
}
