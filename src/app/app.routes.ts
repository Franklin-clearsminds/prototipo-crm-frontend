import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./core/layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'leads',
        loadComponent: () => import('./features/leads/leads-list.component').then(m => m.LeadsListComponent)
      },
      {
        path: 'leads/:id',
        loadComponent: () => import('./features/leads/lead-detail-page.component').then(m => m.LeadDetailPageComponent)
      },
      {
        path: 'pipeline',
        loadComponent: () => import('./features/pipeline/pipeline.component').then(m => m.PipelineComponent)
      },
      {
        path: 'agents',
        loadComponent: () => import('./features/agents/agents-list.component').then(m => m.AgentsListComponent)
      },
      {
        path: 'agents/:id',
        loadComponent: () => import('./features/agents/agent-detail.component').then(m => m.AgentDetailComponent)
      },
      {
        path: 'phone-lines',
        loadComponent: () => import('./features/phone-lines/phone-lines.component').then(m => m.PhoneLinesComponent)
      },
      {
        path: 'calls',
        loadComponent: () => import('./features/calls/calls-log.component').then(m => m.CallsLogComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages/messages-center.component').then(m => m.MessagesCenterComponent)
      },
      {
        path: 'campaigns',
        loadComponent: () => import('./features/campaigns/campaigns.component').then(m => m.CampaignsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
