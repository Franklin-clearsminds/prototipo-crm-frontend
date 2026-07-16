import { Injectable, signal, computed } from '@angular/core';
import { Lead, LeadStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockLeadService {
  private leadsSignal = signal<Lead[]>([
    {
      id: 'lead_1',
      name: 'Robert Taylor',
      phone: '+1 (512) 555-0199',
      state: 'TX',
      age: 45,
      healthCondition: 'Excelente, no fumador',
      interest: 'Term Life ($500k)',
      status: 'new',
      campaignId: 'camp_1',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
      noContactDays: 0,
      notes: ['Lead ingresado desde campaña de anuncios en Facebook.']
    },
    {
      id: 'lead_2',
      name: 'Maria Sanchez',
      phone: '+1 (405) 555-0211',
      state: 'OK',
      age: 38,
      healthCondition: 'Diabetes controlada tipo 2',
      interest: 'Whole Life ($250k)',
      status: 'assigned',
      campaignId: 'camp_2',
      assignedAgentId: 'agent_1',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      noContactDays: 0,
      notes: ['Asignado automáticamente a Sarah Jenkins por regla de cercanía (OK -> TX).']
    },
    {
      id: 'lead_3',
      name: 'John Doe',
      phone: '+1 (305) 555-0322',
      state: 'FL',
      age: 52,
      healthCondition: 'Fumador, presión alta',
      interest: 'Term Life ($1M)',
      status: 'contacted',
      campaignId: 'camp_1',
      assignedAgentId: 'agent_2',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      noContactDays: 0,
      notes: ['Interesado en cotización de 1 millón. Programó llamada para mañana.']
    },
    {
      id: 'lead_4',
      name: 'Linda Johnson',
      phone: '+1 (213) 555-0433',
      state: 'CA',
      age: 61,
      healthCondition: 'Buena salud general',
      interest: 'Final Expense ($25k)',
      status: 'no_answer',
      campaignId: 'camp_3',
      assignedAgentId: 'agent_3',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      noContactDays: 0,
      notes: ['Llamada realizada. Envió a buzón de voz. Se dejó mensaje SMS predefinido.']
    },
    {
      id: 'lead_5',
      name: 'William Davis',
      phone: '+1 (312) 555-0544',
      state: 'IL',
      age: 29,
      healthCondition: 'Excelente deportista',
      interest: 'Term Life ($750k)',
      status: 'follow_up',
      campaignId: 'camp_4',
      assignedAgentId: 'agent_4',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      noContactDays: 1,
      notes: ['Solicitó cotización por correo electrónico. Programar seguimiento en 2 días.']
    },
    {
      id: 'lead_6',
      name: 'Elizabeth Wilson',
      phone: '+1 (212) 555-0655',
      state: 'NY',
      age: 50,
      healthCondition: 'Sobrepeso leve',
      interest: 'Whole Life ($100k)',
      status: 'appointment',
      campaignId: 'camp_5',
      assignedAgentId: 'agent_5',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      noContactDays: 0,
      notes: ['Cita agendada para el lunes a las 10:00 AM EST para firmar solicitud.']
    },
    {
      id: 'lead_7',
      name: 'Michael Brown',
      phone: '+1 (512) 555-0766',
      state: 'TX',
      age: 48,
      healthCondition: 'Historial cardíaco familiar',
      interest: 'Term Life ($250k)',
      status: 'sold',
      campaignId: 'camp_1',
      assignedAgentId: 'agent_1',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      noContactDays: 0,
      notes: ['Póliza vendida y emitida. Comisión registrada.']
    },
    {
      id: 'lead_8',
      name: 'James Miller',
      phone: '+1 (404) 555-0877',
      state: 'GA',
      age: 55,
      healthCondition: 'Excelente',
      interest: 'Term Life ($500k)',
      status: 'discarded',
      campaignId: 'camp_2',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      noContactDays: 10,
      notes: ['Lead descartado. Fuera de cobertura o número no existe.']
    },
    {
      id: 'lead_9',
      name: 'Patricia Garcia',
      phone: '+1 (512) 555-0988',
      state: 'TX',
      age: 41,
      healthCondition: 'Asma leve',
      interest: 'Term Life ($300k)',
      status: 'new',
      campaignId: 'camp_1',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      noContactDays: 0
    },
    {
      id: 'lead_10',
      name: 'David Martinez',
      phone: '+1 (305) 555-1099',
      state: 'FL',
      age: 33,
      healthCondition: 'Ninguna',
      interest: 'Whole Life ($150k)',
      status: 'assigned',
      campaignId: 'camp_2',
      assignedAgentId: 'agent_2',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      noContactDays: 0
    },
    {
      id: 'lead_11',
      name: 'Barbara Robinson',
      phone: '+1 (213) 555-1211',
      state: 'CA',
      age: 67,
      healthCondition: 'Artritis, presión regulada',
      interest: 'Final Expense ($15k)',
      status: 'no_answer',
      campaignId: 'camp_3',
      assignedAgentId: 'agent_3',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      noContactDays: 2
    },
    {
      id: 'lead_12',
      name: 'Charles Clark',
      phone: '+1 (312) 555-1322',
      state: 'IL',
      age: 47,
      healthCondition: 'Saludable',
      interest: 'Term Life ($500k)',
      status: 'follow_up',
      campaignId: 'camp_4',
      assignedAgentId: 'agent_4',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      noContactDays: 3
    },
    {
      id: 'lead_13',
      name: 'Jennifer Rodriguez',
      phone: '+1 (212) 555-1433',
      state: 'NY',
      age: 35,
      healthCondition: 'Embarazo mes 4',
      interest: 'Whole Life ($500k)',
      status: 'appointment',
      campaignId: 'camp_5',
      assignedAgentId: 'agent_5',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      noContactDays: 1
    },
    {
      id: 'lead_14',
      name: 'Thomas Lewis',
      phone: '+1 (512) 555-1544',
      state: 'TX',
      age: 50,
      healthCondition: 'Fumador leve',
      interest: 'Term Life ($200k)',
      status: 'sold',
      campaignId: 'camp_1',
      assignedAgentId: 'agent_1',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      lastContactedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      noContactDays: 0
    },
    {
      id: 'lead_15',
      name: 'Sarah Lee',
      phone: '+1 (405) 555-1655',
      state: 'OK',
      age: 28,
      healthCondition: 'Ninguna',
      interest: 'Term Life ($1M)',
      status: 'new',
      campaignId: 'camp_2',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
      noContactDays: 0
    }
  ]);

  leads = this.leadsSignal.asReadonly();

  getLeads() {
    return this.leadsSignal();
  }

  getLeadById(id: string): Lead | undefined {
    return this.leadsSignal().find(l => l.id === id);
  }

  createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'noContactDays' | 'notes'> & { notes?: string }) {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${this.leadsSignal().length + 1}`,
      createdAt: new Date().toISOString(),
      noContactDays: 0,
      notes: leadData.notes ? [leadData.notes] : []
    };

    this.leadsSignal.update(current => [newLead, ...current]);
    return newLead;
  }

  updateLeadStatus(id: string, status: LeadStatus) {
    this.leadsSignal.update(current =>
      current.map(l => {
        if (l.id === id) {
          const notes = l.notes || [];
          const updatedNotes = [...notes, `Estado cambiado a ${status} el ${new Date().toLocaleDateString()}`];
          return {
            ...l,
            status,
            lastContactedAt: new Date().toISOString(),
            noContactDays: 0,
            notes: updatedNotes
          };
        }
        return l;
      })
    );
  }

  assignAgentToLead(leadId: string, agentId: string | undefined) {
    this.leadsSignal.update(current =>
      current.map(l => {
        if (l.id === leadId) {
          const notes = l.notes || [];
          const updatedNotes = [...notes, agentId ? `Asignado a agente ID: ${agentId}` : 'Se quitó la asignación de agente'];
          return {
            ...l,
            assignedAgentId: agentId,
            status: agentId ? 'assigned' as LeadStatus : 'new' as LeadStatus,
            notes: updatedNotes
          };
        }
        return l;
      })
    );
  }

  assignAgentBulk(leadIds: string[], agentId: string) {
    this.leadsSignal.update(current =>
      current.map(l => {
        if (leadIds.includes(l.id)) {
          const notes = l.notes || [];
          const updatedNotes = [...notes, `Asignado de forma masiva al agente ID: ${agentId}`];
          return {
            ...l,
            assignedAgentId: agentId,
            status: 'assigned' as LeadStatus,
            notes: updatedNotes
          };
        }
        return l;
      })
    );
  }

  addNote(leadId: string, note: string) {
    this.leadsSignal.update(current =>
      current.map(l => {
        if (l.id === leadId) {
          const notes = l.notes || [];
          return {
            ...l,
            notes: [...notes, note]
          };
        }
        return l;
      })
    );
  }
}
