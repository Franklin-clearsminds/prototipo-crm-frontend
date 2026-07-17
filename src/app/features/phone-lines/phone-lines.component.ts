import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockPhoneLineService } from '../../core/services/phone-line.service';
import { MockAgentService } from '../../core/services/agent.service';
import { MockAuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { PhoneLine, PhoneLineStatus } from '../../core/models';

@Component({
  selector: 'app-phone-lines',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './phone-lines.component.html',
  styleUrls: ['./phone-lines.component.scss']
})
export class PhoneLinesComponent {
  phoneLineService = inject(MockPhoneLineService);
  agentService = inject(MockAgentService);
  authService = inject(MockAuthService);
  langService = inject(LanguageService);
  private fb = inject(FormBuilder);

  t(key: string): string {
    return this.langService.t(key);
  }

  lines = this.phoneLineService.phoneLines;
  agents = this.agentService.agents;

  showAddModal = signal<boolean>(false);
  showAssignModal = signal<boolean>(false);

  selectedLine = signal<PhoneLine | null>(null);
  assignForm!: FormGroup;
  lineForm!: FormGroup;

  showSuccessToast = signal<boolean>(false);
  toastMessage = signal<string>('');

  providers = ['Twilio', 'Telnyx', 'SignalWire', 'Bandwidth'];
  states = ['TX', 'OK', 'FL', 'CA', 'IL', 'NY', 'GA', 'AZ', 'NC', 'NV'];

  // Proximity grids definition for UI display
  proximityRules = [
    { state: 'Oklahoma (OK)', proxyState: 'Texas (TX)', desc: 'Utiliza líneas locales de Texas para llamadas regionales.' },
    { state: 'Iowa (IA)', proxyState: 'Illinois (IL)', desc: 'Utiliza líneas locales de Chicago (IL) para llamadas del Medio Oeste.' },
    { state: 'Nebraska (NE)', proxyState: 'Illinois (IL)', desc: 'Enruta tráfico a través de troncales de Illinois.' },
    { state: 'Nevada (NV)', proxyState: 'California (CA)', desc: 'Utiliza prefijos de Los Ángeles (CA) para cobertura regional.' }
  ];

  constructor() {
    this.initForms();
  }

  initForms() {
    this.lineForm = this.fb.group({
      number: ['', [Validators.required, Validators.pattern(/^\+1\s*\(\d{3}\)\s*\d{3}-\d{4}$/)]],
      areaCode: ['', [Validators.required, Validators.maxLength(3)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      provider: ['Twilio', Validators.required]
    });

    this.assignForm = this.fb.group({
      agentId: ['']
    });
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.lineForm.reset({
      provider: 'Twilio'
    });
  }

  submitLine() {
    if (this.lineForm.invalid) {
      this.lineForm.markAllAsTouched();
      return;
    }

    const val = this.lineForm.value;
    this.phoneLineService.addPhoneLine({
      number: val.number,
      areaCode: val.areaCode,
      city: val.city,
      state: val.state,
      provider: val.provider,
      status: 'available'
    });

    this.closeAddModal();
    this.triggerToast('Nueva línea regional registrada con éxito.');
  }

  openAssignModal(line: PhoneLine) {
    this.selectedLine.set(line);
    this.assignForm.patchValue({
      agentId: line.assignedAgentId || ''
    });
    this.showAssignModal.set(true);
  }

  closeAssignModal() {
    this.showAssignModal.set(false);
    this.selectedLine.set(null);
    this.assignForm.reset();
  }

  submitAssign() {
    const line = this.selectedLine();
    if (!line) return;
    
    const { agentId } = this.assignForm.value;
    this.phoneLineService.assignLine(line.id, agentId || undefined);
    
    this.closeAssignModal();
    this.triggerToast(agentId ? 'Línea asignada al agente comercial.' : 'Se liberó el número de la asignación.');
  }

  toggleSuspension(line: PhoneLine) {
    const targetStatus: PhoneLineStatus = line.status === 'suspended' ? 'available' : 'suspended';
    this.phoneLineService.updateStatus(line.id, targetStatus);
    this.triggerToast(targetStatus === 'suspended' ? 'Línea telefónica suspendida temporalmente.' : 'Línea telefónica reactivada.');
  }

  testCall(line: PhoneLine) {
    this.triggerToast(`Prueba de llamada saliente iniciada desde ${line.number}... Conexión SIP OK.`);
  }

  getAgentName(agentId?: string): string {
    if (!agentId) return 'Sin asignar';
    const agent = this.agentService.getAgentById(agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Sin asignar';
  }

  triggerToast(msg: string) {
    this.toastMessage.set(msg);
    this.showSuccessToast.set(true);
    setTimeout(() => this.showSuccessToast.set(false), 3000);
  }
}
