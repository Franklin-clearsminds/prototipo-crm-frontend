import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockCallService } from '../../core/services/call.service';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-calls-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calls-log.component.html',
  styleUrls: ['./calls-log.component.scss']
})
export class CallsLogComponent {
  callService = inject(MockCallService);
  langService = inject(LanguageService);

  t(key: string): string {
    return this.langService.t(key);
  }

  history = this.callService.callHistory;

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}
