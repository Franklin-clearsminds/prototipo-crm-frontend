import { Component, AfterViewInit, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockReportService } from '../../core/services/report.service';
import { MockLeadService } from '../../core/services/lead.service';
import { LanguageService } from '../../core/services/language.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements AfterViewInit {
  reportService = inject(MockReportService);
  leadService = inject(MockLeadService);
  langService = inject(LanguageService);

  t(key: string): string {
    return this.langService.t(key);
  }

  @ViewChild('leadsChartCanvas') leadsChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas') statusChartCanvas!: ElementRef<HTMLCanvasElement>;

  leadsChart?: Chart;
  statusChart?: Chart;

  // Selected date range state
  dateRange = signal<string>('7days');
  showSuccessToast = signal<boolean>(false);
  toastMessage = signal<string>('');

  get metrics() {
    return this.reportService.metrics();
  }

  get activities() {
    return this.reportService.activities();
  }

  get alerts() {
    return this.reportService.alerts();
  }

  ngAfterViewInit() {
    this.renderCharts();
  }

  setDateRange(range: string) {
    this.dateRange.set(range);
    this.renderCharts();
  }

  renderCharts() {
    // Destroy existing chart instances if rendering again
    if (this.leadsChart) this.leadsChart.destroy();
    if (this.statusChart) this.statusChart.destroy();

    const leadsCtx = this.leadsChartCanvas.nativeElement.getContext('2d');
    const statusCtx = this.statusChartCanvas.nativeElement.getContext('2d');

    if (leadsCtx) {
      // Create gradients for cards
      const primaryGradient = leadsCtx.createLinearGradient(0, 0, 0, 300);
      primaryGradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
      primaryGradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

      // Chart 1: Leads por día (dynamic based on filter)
      const labels = this.dateRange() === '7days' 
        ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
        : ['S1', 'S2', 'S3', 'S4'];
      const data = this.dateRange() === '7days'
        ? [120, 160, 210, 245, 185, 140, 194]
        : [540, 680, 720, 890];

      this.leadsChart = new Chart(leadsCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Leads Recibidos',
            data,
            borderColor: '#2563eb',
            borderWidth: 2,
            backgroundColor: primaryGradient,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { grid: { display: true }, ticks: { precision: 0 } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    if (statusCtx) {
      // Chart 2: Leads por estado (Doughnut)
      const leads = this.leadService.getLeads();
      const statusCounts = {
        new: leads.filter(l => l.status === 'new').length,
        assigned: leads.filter(l => l.status === 'assigned').length,
        contacted: leads.filter(l => l.status === 'contacted').length + leads.filter(l => l.status === 'follow_up').length,
        appointment: leads.filter(l => l.status === 'appointment').length,
        sold: leads.filter(l => l.status === 'sold').length,
        discarded: leads.filter(l => l.status === 'discarded').length + leads.filter(l => l.status === 'no_answer').length
      };

      this.statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Nuevos', 'Asignados', 'Contactados', 'Citas', 'Ventas', 'Descartados'],
          datasets: [{
            data: [
              statusCounts.new,
              statusCounts.assigned,
              statusCounts.contacted,
              statusCounts.appointment,
              statusCounts.sold,
              statusCounts.discarded
            ],
            backgroundColor: [
              '#3b82f6', // blue
              '#10b981', // green
              '#8b5cf6', // purple
              '#f59e0b', // orange
              '#10b981', // dark green
              '#64748b'  // gray
            ],
            borderWidth: 1,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  triggerExport() {
    this.toastMessage.set('Reporte consolidado exportado a Excel correctamente.');
    this.showSuccessToast.set(true);
    setTimeout(() => this.showSuccessToast.set(false), 3000);
  }
}
