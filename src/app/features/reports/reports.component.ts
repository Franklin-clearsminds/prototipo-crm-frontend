import { Component, AfterViewInit, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockReportService } from '../../core/services/report.service';
import { LanguageService } from '../../core/services/language.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements AfterViewInit {
  reportService = inject(MockReportService);
  langService = inject(LanguageService);

  t(key: string): string {
    return this.langService.t(key);
  }

  @ViewChild('conversionChartCanvas') conversionChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('campaignChartCanvas') campaignChartCanvas!: ElementRef<HTMLCanvasElement>;

  conversionChart?: Chart;
  campaignChart?: Chart;

  showToast = signal<boolean>(false);
  toastMsg = signal<string>('');

  get metrics() {
    return this.reportService.metrics();
  }

  ngAfterViewInit() {
    this.renderReportsCharts();
  }

  renderReportsCharts() {
    const convCtx = this.conversionChartCanvas.nativeElement.getContext('2d');
    const campCtx = this.campaignChartCanvas.nativeElement.getContext('2d');

    if (convCtx) {
      this.conversionChart = new Chart(convCtx, {
        type: 'bar',
        data: {
          labels: ['Nuevos', 'Asignados', 'Contactados', 'En Seguimiento', 'Citas', 'Ventas'],
          datasets: [{
            label: 'Leads en etapa',
            data: [15, 12, 9, 7, 5, 3],
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { display: true }, ticks: { precision: 0 } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    if (campCtx) {
      this.campaignChart = new Chart(campCtx, {
        type: 'doughnut',
        data: {
          labels: ['Facebook Ads', 'Google Search', 'TikTok Video', 'Instagram Direct', 'GoHighLevel organic'],
          datasets: [{
            data: [342, 198, 112, 84, 148],
            backgroundColor: ['#1877f2', '#0284c7', '#010101', '#e1306c', '#ff6b35'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  exportFile(type: 'pdf' | 'excel') {
    this.toastMsg.set(
      type === 'pdf' 
        ? 'Compilando informe ejecutivo PDF... Archivo descargado en carpeta de Descargas.' 
        : 'Generando hoja de cálculo XLS... Leads descargados con éxito.'
    );
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
