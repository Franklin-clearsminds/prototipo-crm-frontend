import { Injectable, signal } from '@angular/core';
import { Agent } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockAgentService {
  private agentsSignal = signal<Agent[]>([
    {
      id: 'agent_1',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@insureflow.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      timezone: 'CST (Chicago)',
      assignedStates: ['TX', 'OK', 'AR'],
      permissions: ['read_leads', 'call_leads', 'sms_leads'],
      assignedPhoneLines: ['+1 (512) 888-0123', '+1 (405) 555-4567'],
      leadsCount: 142,
      contactedCount: 131,
      appointmentsCount: 38,
      salesCount: 22,
      lastActiveAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'agent_2',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@insureflow.com',
      phone: '+1 (555) 345-6789',
      status: 'active',
      timezone: 'EST (New York)',
      assignedStates: ['FL', 'GA', 'NC'],
      permissions: ['read_leads', 'call_leads', 'sms_leads'],
      assignedPhoneLines: ['+1 (305) 444-9876'],
      leadsCount: 118,
      contactedCount: 99,
      appointmentsCount: 25,
      salesCount: 15,
      lastActiveAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'agent_3',
      firstName: 'Elena',
      lastName: 'Rodriguez',
      email: 'elena.r@insureflow.com',
      phone: '+1 (555) 456-7890',
      status: 'active',
      timezone: 'PST (Los Angeles)',
      assignedStates: ['CA', 'AZ', 'NV'],
      permissions: ['read_leads', 'call_leads', 'sms_leads'],
      assignedPhoneLines: ['+1 (213) 777-6543'],
      leadsCount: 165,
      contactedCount: 117,
      appointmentsCount: 31,
      salesCount: 18,
      lastActiveAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'agent_4',
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@insureflow.com',
      phone: '+1 (555) 567-8901',
      status: 'inactive',
      timezone: 'CST (Chicago)',
      assignedStates: ['IL', 'IN', 'WI'],
      permissions: ['read_leads', 'call_leads'],
      assignedPhoneLines: ['+1 (312) 666-1212'],
      leadsCount: 90,
      contactedCount: 70,
      appointmentsCount: 12,
      salesCount: 8,
      lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'agent_5',
      firstName: 'Sophia',
      lastName: 'Taylor',
      email: 'sophia.taylor@insureflow.com',
      phone: '+1 (555) 678-9012',
      status: 'busy',
      timezone: 'EST (New York)',
      assignedStates: ['NY', 'PA', 'NJ'],
      permissions: ['read_leads', 'call_leads', 'sms_leads'],
      assignedPhoneLines: ['+1 (212) 333-4455'],
      leadsCount: 130,
      contactedCount: 112,
      appointmentsCount: 22,
      salesCount: 10,
      lastActiveAt: new Date().toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  agents = this.agentsSignal.asReadonly();

  getAgents() {
    return this.agentsSignal();
  }

  getAgentById(id: string): Agent | undefined {
    return this.agentsSignal().find(a => a.id === id);
  }

  createAgent(agentData: Omit<Agent, 'id' | 'leadsCount' | 'contactedCount' | 'appointmentsCount' | 'salesCount' | 'lastActiveAt' | 'avatarUrl'>) {
    const newAgent: Agent = {
      ...agentData,
      id: `agent_${this.agentsSignal().length + 1}`,
      leadsCount: 0,
      contactedCount: 0,
      appointmentsCount: 0,
      salesCount: 0,
      lastActiveAt: new Date().toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
    };

    this.agentsSignal.update(current => [newAgent, ...current]);
    return newAgent;
  }

  updateAgentStatus(id: string, status: Agent['status']) {
    this.agentsSignal.update(current =>
      current.map(a => a.id === id ? { ...a, status, lastActiveAt: new Date().toISOString() } : a)
    );
  }
}
