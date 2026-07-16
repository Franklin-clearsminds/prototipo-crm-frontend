import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockCallService } from '../../core/services/call.service';
import { MockPhoneLineService } from '../../core/services/phone-line.service';
import { Lead } from '../../core/models';

@Component({
  selector: 'app-call-center',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './call-center.component.html',
  styleUrls: ['./call-center.component.scss']
})
export class CallCenterComponent implements OnInit, OnDestroy {
  callService = inject(MockCallService);
  phoneLineService = inject(MockPhoneLineService);
  private fb = inject(FormBuilder);

  outcomeForm!: FormGroup;
  showKeypad = signal<boolean>(false);
  keypadDigits = signal<string>('');

  getPhoneLines() {
    return this.phoneLineService.phoneLines().filter(l => l.status === 'assigned');
  }

  getRecommendationReason(line: any, leadState: string): string {
    if (line.state === leadState) {
      return 'Mismo Estado (Match Perfecto)';
    }
    const proxyState = this.phoneLineService.stateProximityMap[leadState];
    if (proxyState && line.state === proxyState) {
      return `Proximidad Regional (Cercano a ${leadState})`;
    }
    return '';
  }

  selectLineAndCall(line: any) {
    const lead = this.callService.pendingLead();
    if (lead) {
      this.callService.executeCall(lead, line.id, line.number);
    }
  }

  cancelSelection() {
    this.callService.cancelSelection();
  }

  outcomes = [
    'Contestó',
    'No contestó',
    'Número incorrecto',
    'Devolver llamada',
    'Cita agendada',
    'No interesado',
    'Venta realizada'
  ];

  ngOnInit() {
    this.outcomeForm = this.fb.group({
      outcome: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnDestroy() {
    // Clean up call
    this.callService.cancelCall();
  }

  get activeCall() {
    return this.callService.activeCall();
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  pressKey(digit: string) {
    this.keypadDigits.update(curr => curr + digit);
  }

  clearDigits() {
    this.keypadDigits.set('');
  }

  toggleMute() {
    this.callService.toggleMute();
  }

  endCall() {
    this.callService.endCall();
  }

  submitOutcome() {
    if (this.outcomeForm.invalid) return;
    const { outcome, notes } = this.outcomeForm.value;
    this.callService.submitCallOutcome(outcome, notes);
    this.outcomeForm.reset();
    this.clearDigits();
    this.showKeypad.set(false);
  }

  cancelCall() {
    this.callService.cancelCall();
    this.outcomeForm.reset();
    this.clearDigits();
    this.showKeypad.set(false);
  }
}
