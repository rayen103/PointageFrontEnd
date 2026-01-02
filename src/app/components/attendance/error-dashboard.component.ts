import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  ErrorProcessingService,
  ErrorDashboard,
  WeeklyAnomaly
} from '../../services/error-processing.service';

@Component({
  selector: 'app-error-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error-dashboard.component.html',
})
export class ErrorDashboardComponent implements OnInit {
  private errorService = inject(ErrorProcessingService);
  private router = inject(Router);

  dashboard = signal<ErrorDashboard | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  codeSociete = signal('DEFAULT');

  // Computed properties
  totalErrors = computed(() => this.dashboard()?.totalOpenErrors || 0);
  criticalPercentage = computed(() => {
    const dash = this.dashboard();
    if (!dash || dash.totalOpenErrors === 0) return 0;
    return Math.round((dash.criticalCount / dash.totalOpenErrors) * 100);
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.errorService.getDashboard(this.codeSociete()).subscribe({
      next: (data) => {
        this.dashboard.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement du tableau de bord: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'high': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getErrorTypeEntries(): [string, number][] {
    const dash = this.dashboard();
    if (!dash || !dash.errorsByType) return [];
    return Object.entries(dash.errorsByType).sort((a, b) => b[1] - a[1]);
  }

  viewAllErrors(): void {
    this.router.navigate(['/pointage/attendance/error-processing']);
  }

  viewWeeklyAnomalies(): void {
    this.router.navigate(['/pointage/reports/weekly-anomalies']);
  }

  viewErrorsByType(errorType: string): void {
    this.router.navigate(['/pointage/attendance/error-processing'], {
      queryParams: { errorType }
    });
  }
}
