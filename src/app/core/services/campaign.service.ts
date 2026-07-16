import { Injectable, signal } from '@angular/core';
import { Campaign, Integration } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MockCampaignService {
  private campaignsSignal = signal<Campaign[]>([
    {
      id: 'camp_1',
      name: 'Facebook Lead Ads - Seguros Vida Term',
      source: 'facebook',
      status: 'active',
      leadsGenerated: 342,
      cost: 2560,
      createdAt: '2026-06-01T00:00:00Z'
    },
    {
      id: 'camp_2',
      name: 'Google Search Ads - Florida Life',
      source: 'landing_page',
      status: 'active',
      leadsGenerated: 198,
      cost: 1840,
      createdAt: '2026-06-10T00:00:00Z'
    },
    {
      id: 'camp_3',
      name: 'TikTok Video Ads - Gastos Finales Mayores',
      source: 'tiktok',
      status: 'active',
      leadsGenerated: 112,
      cost: 980,
      createdAt: '2026-06-15T00:00:00Z'
    },
    {
      id: 'camp_4',
      name: 'Instagram Stories - Jóvenes Familias',
      source: 'instagram',
      status: 'paused',
      leadsGenerated: 84,
      cost: 650,
      createdAt: '2026-06-20T00:00:00Z'
    },
    {
      id: 'camp_5',
      name: 'GoHighLevel - Re-engagement Campaign',
      source: 'gohighlevel',
      status: 'active',
      leadsGenerated: 148,
      cost: 0, // Organic
      createdAt: '2026-07-01T00:00:00Z'
    }
  ]);

  private integrationsSignal = signal<Integration[]>([
    {
      id: 'int_fb',
      name: 'Facebook Lead Ads',
      type: 'facebook',
      status: 'connected',
      lastSyncedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      leadsReceivedCount: 426
    },
    {
      id: 'int_ghl',
      name: 'GoHighLevel CRM Sync',
      type: 'gohighlevel',
      status: 'warning', // warning sync lag
      lastSyncedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      leadsReceivedCount: 148,
      recentErrors: ['Salesforce API timeout at 10:42 AM. Check credentials.']
    },
    {
      id: 'int_tiktok',
      name: 'TikTok Lead Generation',
      type: 'tiktok',
      status: 'connected',
      lastSyncedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      leadsReceivedCount: 112
    },
    {
      id: 'int_twilio',
      name: 'Twilio Gateway VoIP & SMS',
      type: 'telephony',
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      leadsReceivedCount: 0
    },
    {
      id: 'int_telnyx',
      name: 'Telnyx Carrier Proximity Route',
      type: 'telephony',
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
      leadsReceivedCount: 0
    },
    {
      id: 'int_insta',
      name: 'Instagram Direct Ads',
      type: 'instagram',
      status: 'unconfigured',
      leadsReceivedCount: 0
    }
  ]);

  campaigns = this.campaignsSignal.asReadonly();
  integrations = this.integrationsSignal.asReadonly();

  getCampaigns() {
    return this.campaignsSignal();
  }

  getIntegrations() {
    return this.integrationsSignal();
  }

  toggleIntegration(id: string) {
    this.integrationsSignal.update(current =>
      current.map(i => {
        if (i.id === id) {
          const nextStatus = i.status === 'connected' ? 'disconnected' as const : 'connected' as const;
          return {
            ...i,
            status: nextStatus,
            lastSyncedAt: nextStatus === 'connected' ? new Date().toISOString() : i.lastSyncedAt
          };
        }
        return i;
      })
    );
  }

  updateIntegrationStatus(id: string, status: Integration['status'], error?: string) {
    this.integrationsSignal.update(current =>
      current.map(i => {
        if (i.id === id) {
          const errors = i.recentErrors || [];
          return {
            ...i,
            status,
            recentErrors: error ? [...errors, error] : i.recentErrors
          };
        }
        return i;
      })
    );
  }

  createCampaign(camp: Omit<Campaign, 'id' | 'leadsGenerated' | 'cost' | 'createdAt'>) {
    const newCamp: Campaign = {
      ...camp,
      id: `camp_${this.campaignsSignal().length + 1}`,
      leadsGenerated: 0,
      cost: 0,
      createdAt: new Date().toISOString()
    };
    this.campaignsSignal.update(current => [...current, newCamp]);
    return newCamp;
  }
}
