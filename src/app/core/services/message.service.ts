import { Injectable, signal } from '@angular/core';
import { SmsConversation, SmsMessage } from '../models';
import { MockPhoneLineService } from './phone-line.service';
import { MockLeadService } from './lead.service';

@Injectable({
  providedIn: 'root'
})
export class MockMessageService {
  private conversationsSignal = signal<SmsConversation[]>([
    {
      id: 'conv_1',
      leadId: 'lead_2',
      leadName: 'Maria Sanchez',
      leadPhone: '+1 (405) 555-0211',
      agentId: 'agent_1',
      lastMessageText: 'Sí, estaré disponible a las 4pm hoy.',
      lastMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10m ago
      unreadCount: 1,
      messages: [
        {
          id: 'msg_1_1',
          sender: 'agent',
          text: 'Hola Maria, le habla Sarah Jenkins de InsureFlow. ¿Le gustaría cotizar su póliza de vida hoy?',
          createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          status: 'delivered'
        },
        {
          id: 'msg_1_2',
          sender: 'lead',
          text: 'Hola, sí me interesa. ¿Me pueden llamar más tarde?',
          createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          status: 'read'
        },
        {
          id: 'msg_1_3',
          sender: 'agent',
          text: 'Excelente, ¿le queda bien a las 4:00 PM CST?',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'delivered'
        },
        {
          id: 'msg_1_4',
          sender: 'lead',
          text: 'Sí, estaré disponible a las 4pm hoy.',
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          status: 'delivered'
        }
      ]
    },
    {
      id: 'conv_2',
      leadId: 'lead_3',
      leadName: 'John Doe',
      leadPhone: '+1 (305) 555-0322',
      agentId: 'agent_2',
      lastMessageText: 'Gracias por la cotización, la revisaré.',
      lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0,
      messages: [
        {
          id: 'msg_2_1',
          sender: 'agent',
          text: 'Sr. Doe, le adjunto el enlace con la propuesta comercial.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'read'
        },
        {
          id: 'msg_2_2',
          sender: 'lead',
          text: 'Gracias por la cotización, la revisaré.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          status: 'read'
        }
      ]
    },
    {
      id: 'conv_3',
      leadId: 'lead_4',
      leadName: 'Linda Johnson',
      leadPhone: '+1 (213) 555-0433',
      agentId: 'agent_3',
      lastMessageText: 'Hola, sigo interesada en la póliza.',
      lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      unreadCount: 0,
      optedOut: false,
      messages: [
        {
          id: 'msg_3_1',
          sender: 'agent',
          text: 'Hola Linda, intentamos llamarle pero no tuvimos éxito. ¿Cuándo prefiere que le contactemos?',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'delivered'
        },
        {
          id: 'msg_3_2',
          sender: 'lead',
          text: 'Hola, sigo interesada en la póliza.',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'read'
        }
      ]
    }
  ]);

  conversations = this.conversationsSignal.asReadonly();

  // Standard SMS templates list
  smsTemplates = [
    { name: 'Primer contacto (Interesado)', text: 'Hola [Nombre], gracias por tu interés en InsureFlow. ¿Cuándo tendrías 5 minutos para una breve asesoría de tu seguro de vida?' },
    { name: 'Intento de llamada fallida', text: 'Hola [Nombre], intenté llamarte recién para tu cotización pero no coincidimos. ¿Te queda bien que hablemos en una hora?' },
    { name: 'Confirmación de cita', text: 'Hola [Nombre], confirmo nuestra cita para tu asesoría de seguro de vida programada para el [Fecha] a las [Hora].' },
    { name: 'Seguimiento de propuesta', text: 'Hola [Nombre], te envié la cotización a tu correo. Quedo a la espera de tus comentarios para proceder con la firma.' }
  ];

  constructor(
    private phoneLineService: MockPhoneLineService,
    private leadService: MockLeadService
  ) {}

  getConversations() {
    return this.conversationsSignal();
  }

  getConversationById(id: string): SmsConversation | undefined {
    return this.conversationsSignal().find(c => c.id === id);
  }

  getConversationByLeadId(leadId: string): SmsConversation | undefined {
    return this.conversationsSignal().find(c => c.leadId === leadId);
  }

  sendMessage(conversationId: string, text: string, sender: 'agent' | 'system' = 'agent') {
    const lines = this.phoneLineService.getPhoneLines();
    const assignedLine = lines.find(l => l.assignedAgentId === 'agent_1') || lines[0]; // mock active agent line
    
    // Increment message count on physical line
    if (assignedLine) {
      this.phoneLineService.incrementMessages(assignedLine.id);
    }

    const newMessage: SmsMessage = {
      id: `msg_${Date.now()}`,
      sender,
      text,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    this.conversationsSignal.update(conversations =>
      conversations.map(c => {
        if (c.id === conversationId) {
          // If opted out, prevent sending
          if (c.optedOut) return c;

          // Push new message and trigger delivery simulation
          setTimeout(() => {
            this.simulateDelivery(c.id, newMessage.id);
          }, 1500);

          return {
            ...c,
            lastMessageText: text,
            lastMessageAt: newMessage.createdAt,
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );

    // Append history to lead notes
    const conv = this.getConversationById(conversationId);
    if (conv) {
      this.leadService.addNote(conv.leadId, `SMS Enviado: "${text}"`);
    }
  }

  private simulateDelivery(conversationId: string, messageId: string) {
    this.conversationsSignal.update(conversations =>
      conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === messageId ? { ...m, status: 'delivered' as const } : m
            )
          };
        }
        return c;
      })
    );

    // Simulate lead response after 4 seconds
    setTimeout(() => {
      this.simulateIncomingResponse(conversationId);
    }, 4000);
  }

  private simulateIncomingResponse(conversationId: string) {
    const conv = this.getConversationById(conversationId);
    if (!conv || conv.optedOut) return;

    // 25% chance of receiving a simulated reply for interactive feel
    const randomReply = Math.random() > 0.6;
    if (!randomReply) return;

    const replies = [
      'Entendido, muchas gracias.',
      'Me parece bien. Agendemos.',
      '¿Cuánto cuesta mensualmente la póliza de $500k?',
      '¿Qué requisitos médicos solicitan?',
      'Por favor llámame ahora.'
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    const incomingMessage: SmsMessage = {
      id: `msg_incoming_${Date.now()}`,
      sender: 'lead',
      text: replyText,
      createdAt: new Date().toISOString(),
      status: 'read'
    };

    this.conversationsSignal.update(conversations =>
      conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessageText: replyText,
            lastMessageAt: incomingMessage.createdAt,
            unreadCount: c.unreadCount + 1,
            messages: [...c.messages, incomingMessage]
          };
        }
        return c;
      })
    );

    this.leadService.addNote(conv.leadId, `SMS Recibido: "${replyText}"`);
  }

  markAsRead(conversationId: string) {
    this.conversationsSignal.update(conversations =>
      conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            unreadCount: 0
          };
        }
        return c;
      })
    );
  }

  createConversationForLead(leadId: string, leadName: string, leadPhone: string): string {
    const existing = this.getConversationByLeadId(leadId);
    if (existing) return existing.id;

    const newId = `conv_${Date.now()}`;
    const newConv: SmsConversation = {
      id: newId,
      leadId,
      leadName,
      leadPhone,
      agentId: 'agent_1',
      lastMessageText: 'Conversación iniciada.',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      messages: []
    };

    this.conversationsSignal.update(current => [...current, newConv]);
    return newId;
  }

  optOut(conversationId: string) {
    this.conversationsSignal.update(conversations =>
      conversations.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            optedOut: true
          };
        }
        return c;
      })
    );
  }
}
