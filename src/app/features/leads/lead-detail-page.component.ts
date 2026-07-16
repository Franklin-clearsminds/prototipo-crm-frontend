import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockLeadService } from '../../core/services/lead.service';
import { MockAgentService } from '../../core/services/agent.service';
import { MockCallService } from '../../core/services/call.service';
import { MockMessageService } from '../../core/services/message.service';
import { Lead, LeadStatus, SmsConversation } from '../../core/models';

@Component({
  selector: 'app-lead-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lead-detail-page.component.html',
  styleUrls: ['./lead-detail-page.component.scss']
})
export class LeadDetailPageComponent implements OnInit {
  leadService = inject(MockLeadService);
  agentService = inject(MockAgentService);
  callService = inject(MockCallService);
  messageService = inject(MockMessageService);
  private router = inject(Router);

  // Bound from router param /leads/:id
  @Input() id!: string;

  lead = signal<Lead | null>(null);
  newNote = signal<string>('');
  newSms = signal<string>('');
  selectedSmsTemplate = signal<string>('');

  agentsList = computed(() => this.agentService.agents());
  templates = this.messageService.smsTemplates;

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
    this.loadLead();
  }

  loadLead() {
    const found = this.leadService.getLeadById(this.id);
    if (found) {
      this.lead.set(found);
      // Auto-create SMS conversation in memory if missing
      this.messageService.createConversationForLead(found.id, found.name, found.phone);
    } else {
      this.lead.set(null);
    }
  }

  get conversation(): SmsConversation | undefined {
    const l = this.lead();
    if (!l) return undefined;
    return this.messageService.getConversationByLeadId(l.id);
  }

  // Action methods
  startCall() {
    const l = this.lead();
    if (l) this.callService.startCall(l);
  }

  changeStatus(event: Event) {
    const l = this.lead();
    if (!l) return;
    const select = event.target as HTMLSelectElement;
    this.leadService.updateLeadStatus(l.id, select.value as LeadStatus);
    this.loadLead(); // refresh
  }

  assignAgent(event: Event) {
    const l = this.lead();
    if (!l) return;
    const select = event.target as HTMLSelectElement;
    this.leadService.assignAgentToLead(l.id, select.value || undefined);
    this.loadLead();
  }

  addNote() {
    const text = this.newNote().trim();
    const l = this.lead();
    if (text && l) {
      this.leadService.addNote(l.id, `Nota interna de agente: ${text}`);
      this.newNote.set('');
      this.loadLead();
    }
  }

  sendSms() {
    const text = this.newSms().trim();
    const conv = this.conversation;
    if (text && conv) {
      this.messageService.sendMessage(conv.id, text);
      this.newSms.set('');
      this.selectedSmsTemplate.set('');
      // refresh UI
      setTimeout(() => this.loadLead(), 500);
    }
  }

  applyTemplate(event: Event) {
    const select = event.target as HTMLSelectElement;
    const templateText = select.value;
    const l = this.lead();
    if (templateText && l) {
      const parsedText = templateText.replace('[Nombre]', l.name);
      this.newSms.set(parsedText);
    } else {
      this.newSms.set('');
    }
  }

  optOut() {
    const conv = this.conversation;
    if (conv) {
      this.messageService.optOut(conv.id);
      this.loadLead();
    }
  }

  getAgentName(agentId?: string): string {
    if (!agentId) return 'Sin asignar';
    const agent = this.agentService.getAgentById(agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Sin asignar';
  }
}
