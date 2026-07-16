import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockMessageService } from '../../core/services/message.service';
import { MockLeadService } from '../../core/services/lead.service';
import { MockCallService } from '../../core/services/call.service';
import { MockPhoneLineService } from '../../core/services/phone-line.service';
import { LanguageService } from '../../core/services/language.service';
import { SmsConversation, Lead } from '../../core/models';

@Component({
  selector: 'app-messages-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-center.component.html',
  styleUrls: ['./messages-center.component.scss']
})
export class MessagesCenterComponent implements OnInit {
  messageService = inject(MockMessageService);
  leadService = inject(MockLeadService);
  callService = inject(MockCallService);
  phoneLineService = inject(MockPhoneLineService);
  langService = inject(LanguageService);

  t(key: string): string {
    return this.langService.t(key);
  }

  // Left column active search & filter states
  searchTerm = signal<string>('');
  onlyUnread = signal<boolean>(false);
  selectedConvId = signal<string | null>(null);

  // Text inputs
  newSmsText = signal<string>('');
  newNoteText = signal<string>('');

  // SMS Line selector modal state
  showSmsLineSelector = signal<boolean>(false);
  pendingSmsText = signal<string>('');

  conversations = this.messageService.conversations;
  templates = this.messageService.smsTemplates;

  ngOnInit() {
    // Select first conversation by default if available
    const list = this.conversations();
    if (list.length > 0) {
      this.selectConversation(list[0].id);
    }
  }

  // Filtered conversations list computed on other signals!
  filteredConversations = computed(() => {
    let list = this.conversations();
    
    const query = this.searchTerm().trim().toLowerCase();
    if (query) {
      list = list.filter(c => 
        c.leadName.toLowerCase().includes(query) || 
        c.leadPhone.includes(query)
      );
    }

    if (this.onlyUnread()) {
      list = list.filter(c => c.unreadCount > 0);
    }

    return list;
  });

  // Current active conversation
  activeConversation = computed(() => {
    const activeId = this.selectedConvId();
    if (!activeId) return null;
    return this.messageService.getConversationById(activeId) || null;
  });

  selectConversation(id: string) {
    this.selectedConvId.set(id);
    this.messageService.markAsRead(id);
  }

  // Check if this is the first agent message in the conversation
  isFirstMessage(): boolean {
    const conv = this.activeConversation();
    if (!conv) return false;
    return !conv.messages.some(m => m.sender === 'agent');
  }

  sendSms() {
    const text = this.newSmsText().trim();
    const active = this.activeConversation();
    if (!text || !active) return;

    // If it's the first outgoing message, show line selector first
    if (this.isFirstMessage()) {
      this.pendingSmsText.set(text);
      this.showSmsLineSelector.set(true);
      return;
    }

    // Otherwise send directly with the existing assigned line
    this.messageService.sendMessage(active.id, text);
    this.newSmsText.set('');
  }

  // Called when a line is selected from the modal
  selectLineAndSend(line: any) {
    const text = this.pendingSmsText().trim();
    const active = this.activeConversation();
    if (!text || !active) return;

    this.messageService.sendMessage(active.id, text, 'agent', line.id);
    this.newSmsText.set('');
    this.pendingSmsText.set('');
    this.showSmsLineSelector.set(false);
  }

  cancelSmsLineSelection() {
    this.showSmsLineSelector.set(false);
    this.pendingSmsText.set('');
  }

  getPhoneLines() {
    return this.phoneLineService.phoneLines().filter(l => l.status === 'assigned');
  }

  getLeadState(): string {
    const conv = this.activeConversation();
    if (!conv) return '';
    const lead = this.leadService.getLeadById(conv.leadId);
    return lead?.state || '';
  }

  getRecommendationReason(line: any, leadState: string): string {
    if (!leadState) return '';
    if (line.state === leadState) {
      return 'Mismo Estado (Match Perfecto)';
    }
    const proxyState = this.phoneLineService.stateProximityMap[leadState];
    if (proxyState && line.state === proxyState) {
      return `Proximidad Regional (Cercano a ${leadState})`;
    }
    return '';
  }

  applyTemplate(event: Event) {
    const select = event.target as HTMLSelectElement;
    const templateText = select.value;
    const active = this.activeConversation();
    if (templateText && active) {
      const parsed = templateText.replace('[Nombre]', active.leadName);
      this.newSmsText.set(parsed);
    } else {
      this.newSmsText.set('');
    }
  }

  triggerCall() {
    const active = this.activeConversation();
    if (!active) return;
    const lead = this.leadService.getLeadById(active.leadId);
    if (lead) {
      this.callService.startCall(lead);
    }
  }

  addInternalNote() {
    const text = this.newNoteText().trim();
    const active = this.activeConversation();
    if (text && active) {
      this.leadService.addNote(active.leadId, `Nota registrada vía Chat SMS: ${text}`);
      this.newNoteText.set('');
      // Show simulated feedback
      alert('Nota interna guardada en el expediente del lead.');
    }
  }

  optOut() {
    const active = this.activeConversation();
    if (active) {
      this.messageService.optOut(active.id);
    }
  }
}
