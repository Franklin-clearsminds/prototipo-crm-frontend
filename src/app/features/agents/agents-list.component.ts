import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MockAgentService } from '../../core/services/agent.service';
import { MockPhoneLineService } from '../../core/services/phone-line.service';
import { LanguageService } from '../../core/services/language.service';
import { Agent, AgentStatus } from '../../core/models';

@Component({
  selector: 'app-agents-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agents-list.component.html',
  styleUrls: ['./agents-list.component.scss']
})
export class AgentsListComponent {
  agentService = inject(MockAgentService);
  phoneLineService = inject(MockPhoneLineService);
  langService = inject(LanguageService);
  private fb = inject(FormBuilder);

  t(key: string): string {
    return this.langService.t(key);
  }

  showCreateDrawer = signal<boolean>(false);
  agentForm!: FormGroup;

  agents = this.agentService.agents;
  phoneLines = this.phoneLineService.phoneLines;

  timezones = ['EST (New York)', 'CST (Chicago)', 'MST (Denver)', 'PST (Los Angeles)'];
  states = ['TX', 'OK', 'FL', 'CA', 'IL', 'NY', 'GA', 'AZ', 'NC', 'NV'];

  constructor() {
    this.initAgentForm();
  }

  initAgentForm() {
    this.agentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      status: ['active', Validators.required],
      timezone: ['CST (Chicago)', Validators.required],
      assignedStates: [[], Validators.required],
      assignedPhoneLines: [[]]
    });
  }

  openDrawer() {
    this.showCreateDrawer.set(true);
  }

  closeDrawer() {
    this.showCreateDrawer.set(false);
    this.agentForm.reset({
      status: 'active',
      timezone: 'CST (Chicago)',
      assignedStates: [],
      assignedPhoneLines: []
    });
  }

  submitAgent() {
    if (this.agentForm.invalid) {
      this.agentForm.markAllAsTouched();
      return;
    }

    const val = this.agentForm.value;
    
    // Create agent in service
    const created = this.agentService.createAgent({
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      phone: val.phone,
      status: val.status as AgentStatus,
      timezone: val.timezone,
      assignedStates: val.assignedStates,
      permissions: ['read_leads', 'call_leads', 'sms_leads'],
      assignedPhoneLines: val.assignedPhoneLines
    });

    // Assign physical line to this agent if selected
    if (val.assignedPhoneLines && val.assignedPhoneLines.length > 0) {
      const line = this.phoneLineService.getPhoneLines().find(l => l.number === val.assignedPhoneLines[0]);
      if (line) {
        this.phoneLineService.assignLine(line.id, created.id);
      }
    }

    this.closeDrawer();
  }

  toggleStateSelection(state: string) {
    const current = this.agentForm.get('assignedStates')?.value as string[] || [];
    const next = current.includes(state)
      ? current.filter(s => s !== state)
      : [...current, state];
    this.agentForm.get('assignedStates')?.setValue(next);
  }

  toggleLineSelection(number: string) {
    const current = this.agentForm.get('assignedPhoneLines')?.value as string[] || [];
    const next = current.includes(number)
      ? current.filter(n => n !== number)
      : [number]; // only support single line assignment in this visual setup
    this.agentForm.get('assignedPhoneLines')?.setValue(next);
  }

  isStateSelected(state: string): boolean {
    const current = this.agentForm.get('assignedStates')?.value as string[] || [];
    return current.includes(state);
  }

  isLineSelected(number: string): boolean {
    const current = this.agentForm.get('assignedPhoneLines')?.value as string[] || [];
    return current.includes(number);
  }
}
