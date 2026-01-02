import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportingService } from '../../services/reporting.service';

@Component({
  selector: 'app-presence-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './presence-report.component.html'
})
export class PresenceReportComponent {
  private reportService = inject(ReportingService);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  reportData = signal<any[]>([]);
  stats = signal({ totalPresent: 0, totalAbsent: 0, totalDelays: 0, presenceRate: 0 });
  hasData = signal(false);

  startDate: Date = new Date(new Date().setDate(1));
  endDate: Date = new Date();
  selectedService = 'all';
  reportType = 'monthly';

  generateReport(): void {
    this.loading.set(true);
    const mockData: any[] = [];

    setTimeout(() => {
      this.reportData.set(mockData);
      this.stats.set({
        totalPresent: mockData.length > 0 ? mockData.reduce((sum: number, r: any) => sum + r.joursPresent, 0) : 0,
        totalAbsent: mockData.length > 0 ? mockData.reduce((sum: number, r: any) => sum + r.joursAbsent, 0) : 0,
        totalDelays: mockData.length > 0 ? mockData.reduce((sum: number, r: any) => sum + r.retards, 0) : 0,
        presenceRate: 0
      });
      this.hasData.set(true);
      this.loading.set(false);
      this.snackBar.open('Rapport généré avec succès', 'Fermer', { duration: 3000 });
    }, 1500);
  }

  exportReport(): void {
    this.snackBar.open('Export du rapport en cours...', 'Fermer', { duration: 2000 });
    setTimeout(() => {
      this.snackBar.open('Rapport exporté avec succès (rapport_presence.xlsx)', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  getTauxClass(taux: number): string {
    if (taux >= 95) return 'taux-good';
    if (taux >= 85) return 'taux-medium';
    return 'taux-bad';
  }
}
