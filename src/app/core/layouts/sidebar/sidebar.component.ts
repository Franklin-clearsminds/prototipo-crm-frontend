import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MockAuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

interface NavItem {
  translationKey: string;
  route: string;
  icon: string; // SVG inner path
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  authService = inject(MockAuthService);
  langService = inject(LanguageService);
  
  isCollapsed = signal<boolean>(false);
  isMobileOpen = signal<boolean>(false);

  // SVG Icon definitions for menu links (Lucide replicas)
  icons: Record<string, string> = {
    dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    leads: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    agents: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    pipeline: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    calls: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    sms: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    phoneLines: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    campaigns: '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    reports: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M12 17v-4"/><path d="M6 17v-2"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
  };

  menuItems: NavItem[] = [
    { translationKey: 'menu.dashboard', route: '/dashboard', icon: 'dashboard' },
    { translationKey: 'menu.leads', route: '/leads', icon: 'leads' },
    { translationKey: 'menu.agents', route: '/agents', icon: 'agents', adminOnly: true },
    { translationKey: 'menu.pipeline', route: '/pipeline', icon: 'pipeline' },
    { translationKey: 'menu.calls', route: '/calls', icon: 'calls' },
    { translationKey: 'menu.messages', route: '/messages', icon: 'sms' },
    { translationKey: 'menu.phoneLines', route: '/phone-lines', icon: 'phoneLines' },
    { translationKey: 'menu.campaigns', route: '/campaigns', icon: 'campaigns', adminOnly: true },
    { translationKey: 'menu.reports', route: '/reports', icon: 'reports', adminOnly: true },
    { translationKey: 'menu.settings', route: '/settings', icon: 'settings', adminOnly: true }
  ];

  t(key: string): string {
    return this.langService.t(key);
  }

  toggleCollapse() {
    this.isCollapsed.update(curr => !curr);
  }

  toggleMobile() {
    this.isMobileOpen.update(curr => !curr);
  }

  logout() {
    this.authService.logout();
  }

  hasAccess(item: NavItem): boolean {
    if (!item.adminOnly) return true;
    return this.authService.isAdmin();
  }
}
