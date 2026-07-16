import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockAgentService } from '../../core/services/agent.service';
import { MockLeadService } from '../../core/services/lead.service';
import { Agent, Lead } from '../../core/models';

@Component({
  selector: 'app-agent-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-detail.component.html',
  styleUrls: ['./agent-detail.component.scss']
})
export class AgentDetailComponent implements OnInit {
  agentService = inject(MockAgentService);
  leadService = inject(MockLeadService);

  @Input() id!: string;

  agent = signal<Agent | null>(null);

  ngOnInit() {
    this.loadAgent();
  }

  loadAgent() {
    const found = this.agentService.getAgentById(this.id);
    if (found) {
      this.agent.set(found);
    } else {
      this.agent.set(null);
    }
  }

  // Compute live list of leads assigned to this specific agent!
  assignedLeads = computed<Lead[]>(() => {
    const activeAgent = this.agent();
    if (!activeAgent) return [];
    return this.leadService.getLeads().filter(l => l.assignedAgentId === activeAgent.id);
  });

  // Performance computations
  conversionRate = computed<number>(() => {
    const activeAgent = this.agent();
    if (!activeAgent || activeAgent.leadsCount === 0) return 0;
    return Math.round((activeAgent.salesCount / activeAgent.leadsCount) * 100);
  });

  avgResponseTime = computed<string>(() => {
    const activeAgent = this.agent();
    if (!activeAgent) return 'N/A';
    // Mock response speed based on agent name length
    const speed = (activeAgent.firstName.length * 1.5) + 2;
    return `${speed} min`;
  });
}
