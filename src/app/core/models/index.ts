export type UserRole = 'admin' | 'agent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type LeadStatus =
  | 'new'
  | 'assigned'
  | 'contacted'
  | 'no_answer'
  | 'follow_up'
  | 'appointment'
  | 'sold'
  | 'discarded';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  state: string; // US State (e.g. TX, OK, FL)
  age: number;
  healthCondition: string;
  interest: string; // Product interest (e.g., Term Life, Whole Life)
  status: LeadStatus;
  campaignId: string;
  assignedAgentId?: string;
  createdAt: string;
  lastContactedAt?: string;
  noContactDays: number;
  notes?: string[];
}

export type AgentStatus = 'active' | 'inactive' | 'busy';

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: AgentStatus;
  timezone: string;
  assignedStates: string[];
  permissions: string[];
  assignedPhoneLines: string[]; // List of numbers
  leadsCount: number;
  contactedCount: number;
  appointmentsCount: number;
  salesCount: number;
  lastActiveAt: string;
  avatarUrl?: string;
}

export type PhoneLineStatus =
  | 'available'
  | 'assigned'
  | 'in_use'
  | 'suspended'
  | 'spam_risk'
  | 'blocked';

export interface PhoneLine {
  id: string;
  number: string;
  areaCode: string;
  city: string;
  state: string;
  provider: string;
  status: PhoneLineStatus;
  assignedAgentId?: string;
  callsCount: number;
  messagesCount: number;
  spamRiskScore: number; // 0 to 100
}

export interface CallRecord {
  id: string;
  leadId: string;
  leadName: string;
  agentId: string;
  agentName: string;
  phoneNumber: string;
  direction: 'incoming' | 'outgoing';
  durationSeconds: number;
  status: 'completed' | 'no_answer' | 'busy' | 'failed';
  outcome: string; // Outcome selection (e.g. "Contestó", "No contestó", "No interesado", "Venta realizada")
  notes?: string;
  createdAt: string;
}

export interface SmsMessage {
  id: string;
  sender: 'lead' | 'agent' | 'system';
  text: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'failed' | 'read';
}

export interface SmsConversation {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  agentId: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: SmsMessage[];
  optedOut?: boolean; // True if they requested to stop receiving messages
}

export interface Campaign {
  id: string;
  name: string;
  source: 'facebook' | 'instagram' | 'tiktok' | 'landing_page' | 'gohighlevel';
  status: 'active' | 'paused' | 'archived';
  leadsGenerated: number;
  cost: number;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'facebook' | 'instagram' | 'tiktok' | 'landing_page' | 'gohighlevel' | 'telephony' | 'sms';
  status: 'connected' | 'disconnected' | 'warning' | 'error' | 'unconfigured';
  lastSyncedAt?: string;
  leadsReceivedCount: number;
  recentErrors?: string[];
}

export interface DashboardMetrics {
  newLeadsCount: number;
  assignedLeadsCount: number;
  contactedLeadsCount: number;
  followUpLeadsCount: number;
  appointmentsCount: number;
  salesCount: number;
  activeAgentsCount: number;
  activePhoneLinesCount: number;
  leadsNewPercentage: number;
  leadsAssignedPercentage: number;
  leadsContactedPercentage: number;
  leadsFollowUpPercentage: number;
  appointmentsPercentage: number;
  salesPercentage: number;
}

export interface ActivityLog {
  id: string;
  type: 'lead_received' | 'lead_assigned' | 'call_completed' | 'sms_sent' | 'appointment_scheduled' | 'sale_registered';
  title: string;
  description: string;
  createdAt: string;
  agentName?: string;
  leadName?: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'message' | 'system';
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}
