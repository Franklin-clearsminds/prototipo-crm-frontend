import { Injectable, signal } from '@angular/core';
import { PhoneLine, PhoneLineStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockPhoneLineService {
  private phoneLinesSignal = signal<PhoneLine[]>([
    {
      id: 'line_1',
      number: '+1 (512) 888-0123',
      areaCode: '512',
      city: 'Austin',
      state: 'TX',
      provider: 'Twilio',
      status: 'assigned',
      assignedAgentId: 'agent_1',
      callsCount: 342,
      messagesCount: 1540,
      spamRiskScore: 12
    },
    {
      id: 'line_2',
      number: '+1 (405) 555-4567',
      areaCode: '405',
      city: 'Oklahoma City',
      state: 'OK',
      provider: 'Twilio',
      status: 'assigned',
      assignedAgentId: 'agent_1',
      callsCount: 198,
      messagesCount: 642,
      spamRiskScore: 28
    },
    {
      id: 'line_3',
      number: '+1 (305) 444-9876',
      areaCode: '305',
      city: 'Miami',
      state: 'FL',
      provider: 'Telnyx',
      status: 'assigned',
      assignedAgentId: 'agent_2',
      callsCount: 512,
      messagesCount: 1290,
      spamRiskScore: 82 // HIGH RISK
    },
    {
      id: 'line_4',
      number: '+1 (213) 777-6543',
      areaCode: '213',
      city: 'Los Angeles',
      state: 'CA',
      provider: 'SignalWire',
      status: 'assigned',
      assignedAgentId: 'agent_3',
      callsCount: 411,
      messagesCount: 980,
      spamRiskScore: 45
    },
    {
      id: 'line_5',
      number: '+1 (312) 666-1212',
      areaCode: '312',
      city: 'Chicago',
      state: 'IL',
      provider: 'Telnyx',
      status: 'assigned',
      assignedAgentId: 'agent_4',
      callsCount: 204,
      messagesCount: 450,
      spamRiskScore: 8
    },
    {
      id: 'line_6',
      number: '+1 (212) 333-4455',
      areaCode: '212',
      city: 'New York',
      state: 'NY',
      provider: 'Twilio',
      status: 'assigned',
      assignedAgentId: 'agent_5',
      callsCount: 142,
      messagesCount: 390,
      spamRiskScore: 19
    },
    {
      id: 'line_7',
      number: '+1 (404) 999-8888',
      areaCode: '404',
      city: 'Atlanta',
      state: 'GA',
      provider: 'Twilio',
      status: 'available',
      callsCount: 0,
      messagesCount: 0,
      spamRiskScore: 3
    },
    {
      id: 'line_8',
      number: '+1 (602) 222-3333',
      areaCode: '602',
      city: 'Phoenix',
      state: 'AZ',
      provider: 'SignalWire',
      status: 'suspended',
      callsCount: 88,
      messagesCount: 120,
      spamRiskScore: 92 // Suspended due to spam block
    }
  ]);

  phoneLines = this.phoneLinesSignal.asReadonly();

  // Proximity routing map
  stateProximityMap: Record<string, string> = {
    'OK': 'TX', // Oklahoma proxies to Texas line
    'IA': 'IL', // Iowa proxies to Illinois line
    'NE': 'IL', // Nebraska proxies to Illinois line
    'NM': 'TX', // New Mexico proxies to Texas line
    'NV': 'CA', // Nevada proxies to California line
    'AZ': 'CA'  // Arizona proxies to California line if Arizona line is suspended
  };

  getPhoneLines() {
    return this.phoneLinesSignal();
  }

  // Get matching line for a client state, applying regional proximity rules
  getBestLineForState(clientState: string): PhoneLine | undefined {
    const lines = this.phoneLinesSignal();
    
    // 1. Check if we have an active line directly in the state
    let match = lines.find(l => l.state === clientState && l.status === 'assigned');
    if (match) return match;

    // 2. Check proximity rule
    const proxyState = this.stateProximityMap[clientState];
    if (proxyState) {
      match = lines.find(l => l.state === proxyState && l.status === 'assigned');
      if (match) return match;
    }

    // 3. Fallback to any active line
    return lines.find(l => l.status === 'assigned');
  }

  addPhoneLine(line: Omit<PhoneLine, 'id' | 'callsCount' | 'messagesCount' | 'spamRiskScore'>) {
    const newLine: PhoneLine = {
      ...line,
      id: `line_${this.phoneLinesSignal().length + 1}`,
      callsCount: 0,
      messagesCount: 0,
      spamRiskScore: Math.floor(Math.random() * 15) // small initial risk score
    };
    this.phoneLinesSignal.update(current => [...current, newLine]);
    return newLine;
  }

  assignLine(id: string, agentId: string | undefined) {
    this.phoneLinesSignal.update(current =>
      current.map(l => {
        if (l.id === id) {
          return {
            ...l,
            assignedAgentId: agentId,
            status: agentId ? 'assigned' as PhoneLineStatus : 'available' as PhoneLineStatus
          };
        }
        return l;
      })
    );
  }

  updateStatus(id: string, status: PhoneLineStatus) {
    this.phoneLinesSignal.update(current =>
      current.map(l => l.id === id ? { ...l, status } : l)
    );
  }

  incrementCalls(id: string) {
    this.phoneLinesSignal.update(current =>
      current.map(l => l.id === id ? { ...l, callsCount: l.callsCount + 1 } : l)
    );
  }

  incrementMessages(id: string) {
    this.phoneLinesSignal.update(current =>
      current.map(l => l.id === id ? { ...l, messagesCount: l.messagesCount + 1 } : l)
    );
  }
}
