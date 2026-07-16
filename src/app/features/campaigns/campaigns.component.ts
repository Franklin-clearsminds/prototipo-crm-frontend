import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockCampaignService } from '../../core/services/campaign.service';
import { LanguageService } from '../../core/services/language.service';
import { Integration } from '../../core/models';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss']
})
export class CampaignsComponent {
  campaignService = inject(MockCampaignService);
  langService = inject(LanguageService);

  t(key: string): string {
    return this.langService.t(key);
  }

  integrations = this.campaignService.integrations;
  campaigns = this.campaignService.campaigns;

  toggleConnection(intId: string) {
    this.campaignService.toggleIntegration(intId);
  }

  configureIntegration(integration: Integration) {
    alert(`Abriendo modal de configuración OAuth para API de ${integration.name}...`);
  }
}
