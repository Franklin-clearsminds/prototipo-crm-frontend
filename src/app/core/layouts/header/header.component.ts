import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockAuthService } from '../../services/auth.service';
import { MockLeadService } from '../../services/lead.service';
import { MockCampaignService } from '../../services/campaign.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  authService = inject(MockAuthService);
  leadService = inject(MockLeadService);
  campaignService = inject(MockCampaignService);
  langService = inject(LanguageService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  @Output() toggleSidebar = new EventEmitter<void>();

  t(key: string): string {
    return this.langService.t(key);
  }

  toggleLang() {
    this.langService.toggleLanguage();
  }

  get currentLang() {
    return this.langService.currentLang();
  }

  showNotifications = signal<boolean>(false);
  showProfileMenu = signal<boolean>(false);
  showLeadModal = signal<boolean>(false);

  leadForm!: FormGroup;
  globalSearch = signal<string>('');

  campaigns = this.campaignService.campaigns;

  states = ['TX', 'OK', 'FL', 'CA', 'IL', 'NY', 'GA', 'AZ', 'NC', 'NV'];

  notifications = signal([
    { id: '1', title: 'Nuevo lead recibido', desc: 'Robert Taylor ingresó desde Facebook Ads.', time: 'Hace 2 min', read: false },
    { id: '2', title: 'Mensaje pendiente', desc: 'SMS recibido de Maria Sanchez.', time: 'Hace 10 min', read: false },
    { id: '3', title: 'Spam alert', desc: 'La línea de Miami tiene riesgo alto de Spam.', time: 'Hace 1 hora', read: true }
  ]);

  constructor() {
    this.initLeadForm();
  }

  get user() {
    return this.authService.currentUser();
  }

  get unreadNotificationsCount() {
    return this.notifications().filter(n => !n.read).length;
  }

  initLeadForm() {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?1?\s*\(?-?\d{3}\)?-?\s*\d{3}-?\s*\d{4}$/)]],
      state: ['', Validators.required],
      age: [35, [Validators.required, Validators.min(18), Validators.max(100)]],
      healthCondition: ['Excelente', Validators.required],
      interest: ['Term Life ($500k)', Validators.required],
      campaignId: ['camp_1', Validators.required],
      notes: ['']
    });
  }

  toggleNotif() {
    this.showNotifications.update(curr => !curr);
    this.showProfileMenu.set(false);
  }

  toggleProfile() {
    this.showProfileMenu.update(curr => !curr);
    this.showNotifications.set(false);
  }

  openLeadModal() {
    this.showLeadModal.set(true);
    this.showProfileMenu.set(false);
    this.showNotifications.set(false);
  }

  closeLeadModal() {
    this.showLeadModal.set(false);
    this.leadForm.reset({
      age: 35,
      healthCondition: 'Excelente',
      interest: 'Term Life ($500k)',
      campaignId: 'camp_1'
    });
  }

  submitLead() {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      return;
    }

    const formVal = this.leadForm.value;
    this.leadService.createLead({
      name: formVal.name,
      phone: formVal.phone,
      state: formVal.state,
      age: formVal.age,
      healthCondition: formVal.healthCondition,
      interest: formVal.interest,
      campaignId: formVal.campaignId,
      status: 'new',
      notes: formVal.notes
    });

    this.closeLeadModal();
    // Redirect to leads list to see new lead
    this.router.navigate(['/leads']);
  }

  markAllRead() {
    this.notifications.update(notifs => notifs.map(n => ({ ...n, read: true })));
  }

  onSearchSubmit() {
    const term = this.globalSearch().trim();
    if (term) {
      this.router.navigate(['/leads'], { queryParams: { q: term } });
    }
  }

  logout() {
    this.authService.logout();
  }
}
