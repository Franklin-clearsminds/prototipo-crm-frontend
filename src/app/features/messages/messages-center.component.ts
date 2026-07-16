import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockMessageService } from '../../core/services/message.service';
import { MockLeadService } from '../../core/services/lead.service';
import { MockCallService } from '../../core/services/call.service';
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

  sendSms() {
    const text = this.newSmsText().trim();
    const active = this.activeConversation();
    if (text && active) {
      this.messageService.sendMessage(active.id, text);
      this.newSmsText.set('');
    }
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
