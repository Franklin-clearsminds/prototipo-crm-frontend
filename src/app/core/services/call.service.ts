import { Injectable, signal, computed } from '@angular/core';
import { Lead, CallRecord } from '../models';
import { MockLeadService } from './lead.service';
import { MockPhoneLineService } from './phone-line.service';

@Injectable({
  providedIn: 'root'
})
export class MockCallService {
  private activeCallSignal = signal<{
    lead: Lead;
    phoneNumber: string;
    lineId: string;
    lineName: string;
    isMuted: boolean;
    isConnected: boolean;
    durationSeconds: number;
    timerInterval?: any;
  } | null>(null);

  private callHistorySignal = signal<CallRecord[]>([
    {
      id: 'call_1',
      leadId: 'lead_2',
      leadName: 'Maria Sanchez',
      agentId: 'agent_1',
      agentName: 'Sarah Jenkins',
      phoneNumber: '+1 (405) 555-0211',
      direction: 'outgoing',
      durationSeconds: 145,
      status: 'completed',
      outcome: 'Contestó',
      notes: 'Interesada en póliza de vida familiar. Solicita cotización formal por correo.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30m ago
    },
    {
      id: 'call_2',
      leadId: 'lead_3',
      leadName: 'John Doe',
      agentId: 'agent_1',
      agentName: 'Sarah Jenkins',
      phoneNumber: '+1 (305) 555-0322',
      direction: 'outgoing',
      durationSeconds: 0,
      status: 'no_answer',
      outcome: 'No contestó',
      notes: 'Llamada enviada a buzón de voz. Se enviará seguimiento por SMS.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2h ago
    },
    {
      id: 'call_3',
      leadId: 'lead_4',
      leadName: 'Linda Johnson',
      agentId: 'agent_3',
      agentName: 'Elena Rodriguez',
      phoneNumber: '+1 (213) 555-0433',
      direction: 'outgoing',
      durationSeconds: 312,
      status: 'completed',
      outcome: 'Cita agendada',
      notes: 'Cita programada para el lunes a las 10:00 AM para revisión de cobertura médica.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5h ago
    },
    {
      id: 'call_4',
      leadId: 'lead_5',
      leadName: 'James Wilson',
      agentId: 'agent_2',
      agentName: 'Michael Chen',
      phoneNumber: '+1 (312) 555-0544',
      direction: 'outgoing',
      durationSeconds: 45,
      status: 'completed',
      outcome: 'No interesado',
      notes: 'Menciona que ya renovó con otra compañía y no desea cambiar de proveedor.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    }
  ]);
  private dialTimeout?: any;

  activeCall = this.activeCallSignal.asReadonly();
  callHistory = this.callHistorySignal.asReadonly();
  isDialerOpen = computed(() => this.activeCallSignal() !== null);

  // Selector state
  showLineSelector = signal<boolean>(false);
  pendingLead = signal<Lead | null>(null);

  constructor(
    private leadService: MockLeadService,
    private phoneLineService: MockPhoneLineService
  ) {}

  startCall(lead: Lead) {
    this.pendingLead.set(lead);
    this.showLineSelector.set(true);
  }

  cancelSelection() {
    this.showLineSelector.set(false);
    this.pendingLead.set(null);
  }

  executeCall(lead: Lead, lineId: string, lineNumber: string) {
    this.showLineSelector.set(false);
    this.pendingLead.set(null);

    if (this.activeCallSignal()) {
      this.endCall();
    }

    // Increment call count for physical line
    this.phoneLineService.incrementCalls(lineId);

    const callInfo = {
      lead,
      phoneNumber: lead.phone,
      lineId,
      lineName: lineNumber,
      isMuted: false,
      isConnected: false,
      durationSeconds: 0
    };

    this.activeCallSignal.set(callInfo);

    // Simulate ringtone for 2.5 seconds, then auto-connect
    this.dialTimeout = setTimeout(() => {
      const active = this.activeCallSignal();
      if (active && !active.isConnected) {
        this.connectCall();
      }
    }, 2500);
  }

  private connectCall() {
    const active = this.activeCallSignal();
    if (!active) return;

    const updated = {
      ...active,
      isConnected: true,
      timerInterval: setInterval(() => {
        const curr = this.activeCallSignal();
        if (curr) {
          this.activeCallSignal.set({
            ...curr,
            durationSeconds: curr.durationSeconds + 1
          });
        }
      }, 1000)
    };

    this.activeCallSignal.set(updated);
  }

  toggleMute() {
    const active = this.activeCallSignal();
    if (!active) return;
    this.activeCallSignal.set({ ...active, isMuted: !active.isMuted });
  }

  endCall() {
    const active = this.activeCallSignal();
    if (!active) return;

    if (this.dialTimeout) {
      clearTimeout(this.dialTimeout);
      this.dialTimeout = undefined;
    }

    if (active.timerInterval) {
      clearInterval(active.timerInterval);
    }

    this.activeCallSignal.set({
      ...active,
      timerInterval: undefined
    });
  }

  submitCallOutcome(outcome: string, notes: string) {
    const active = this.activeCallSignal();
    if (!active) return;

    // Clear interval if not already done
    if (active.timerInterval) {
      clearInterval(active.timerInterval);
    }

    const duration = active.durationSeconds;
    const newRecord: CallRecord = {
      id: `call_${Date.now()}`,
      leadId: active.lead.id,
      leadName: active.lead.name,
      agentId: 'agent_1', // Logged in agent
      agentName: 'Sarah Jenkins',
      phoneNumber: active.phoneNumber,
      direction: 'outgoing',
      durationSeconds: duration,
      status: duration > 0 ? 'completed' : 'no_answer',
      outcome,
      notes,
      createdAt: new Date().toISOString()
    };

    // Save history
    this.callHistorySignal.update(curr => [newRecord, ...curr]);

    // Append history to lead's timeline
    let timelineMessage = `Llamada saliente realizada (${duration}s). Resultado: ${outcome}.`;
    if (notes) {
      timelineMessage += ` Nota: ${notes}`;
    }
    this.leadService.addNote(active.lead.id, timelineMessage);

    // Map outcomes to status updates
    if (outcome === 'Contestó' || outcome === 'Devolver llamada') {
      this.leadService.updateLeadStatus(active.lead.id, 'contacted');
    } else if (outcome === 'No contestó') {
      this.leadService.updateLeadStatus(active.lead.id, 'no_answer');
    } else if (outcome === 'Cita agendada') {
      this.leadService.updateLeadStatus(active.lead.id, 'appointment');
    } else if (outcome === 'Venta realizada') {
      this.leadService.updateLeadStatus(active.lead.id, 'sold');
    } else if (outcome === 'No interesado' || outcome === 'Número incorrecto') {
      this.leadService.updateLeadStatus(active.lead.id, 'discarded');
    }

    // Reset dialer
    this.activeCallSignal.set(null);
  }

  cancelCall() {
    const active = this.activeCallSignal();
    if (this.dialTimeout) {
      clearTimeout(this.dialTimeout);
      this.dialTimeout = undefined;
    }
    if (active && active.timerInterval) {
      clearInterval(active.timerInterval);
    }
    this.activeCallSignal.set(null);
  }
}
