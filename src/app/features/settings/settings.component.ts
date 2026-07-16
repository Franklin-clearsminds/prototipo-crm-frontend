import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockCampaignService } from '../../core/services/campaign.service';
import { MockMessageService } from '../../core/services/message.service';
import { MockAuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  campaignService = inject(MockCampaignService);
  messageService = inject(MockMessageService);
  authService = inject(MockAuthService);
  langService = inject(LanguageService);

  t(key: string): string {
    return this.langService.t(key);
  }

  // Active tab state
  activeTab = signal<string>('profile'); // Default to profile tab since user requested profile settings!

  // Profile settings state
  profileName = signal<string>('');
  profileEmail = signal<string>('');
  profilePassword = signal<string>('••••••••');

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileName.set(user.name);
      this.profileEmail.set(user.email);
    }
  }

  // General settings state
  companyName = signal<string>('InsureFlow Life Agency');
  companyEmail = signal<string>('ops@insureflow.com');
  officeTimezone = signal<string>('CST (Chicago)');
  dialLimit = signal<number>(5); // max dials per lead

  // Lead assignment rules state
  routingStrategy = signal<string>('round_robin'); // 'round_robin' | 'territory'
  excludeWeekend = signal<boolean>(true);
  minAgeLimit = signal<number>(18);

  // Templates
  templates = this.messageService.smsTemplates;
  newTemplateName = signal<string>('');
  newTemplateText = signal<string>('');

  showToast = signal<boolean>(false);
  toastMsg = signal<string>('');

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  saveProfile() {
    const name = this.profileName().trim();
    const email = this.profileEmail().trim();
    if (name && email) {
      this.authService.updateProfile(name, email);
      this.triggerToast('Perfil personal actualizado con éxito.');
    } else {
      this.triggerToast('Error: El nombre y el correo no pueden estar vacíos.');
    }
  }

  saveGeneral() {
    this.triggerToast('Configuración general de la empresa actualizada con éxito.');
  }

  saveRouting() {
    this.triggerToast('Reglas de enrutamiento y asignación de territorio actualizadas.');
  }

  addTemplate() {
    const name = this.newTemplateName().trim();
    const text = this.newTemplateText().trim();
    if (name && text) {
      this.messageService.smsTemplates.push({ name, text });
      this.newTemplateName.set('');
      this.newTemplateText.set('');
      this.triggerToast('Nueva plantilla SMS predefinida añadida.');
    }
  }

  deleteTemplate(index: number) {
    this.messageService.smsTemplates.splice(index, 1);
    this.triggerToast('Plantilla SMS eliminada.');
  }

  triggerToast(msg: string) {
    this.toastMsg.set(msg);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
