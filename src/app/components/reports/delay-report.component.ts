import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface DelayData {
  matricule: string;
  nom: string;
  service: string;
  count: number;
  totalMinutes: number;
  avgMinutes: number;
  trend: 'improving' | 'worsening' | 'stable';
}

@Component({
  selector: 'app-delay-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './delay-report.component.html',
})
export class DelayReportComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  filterForm: FormGroup;
  delays = signal<DelayData[]>([]);
  loading = signal(false);

  // Computed signals for template
  totalDelays = computed(() =>
    this.delays().reduce((sum, delay) => sum + delay.count, 0)
  );
  avgDuration = computed(() => {
    const delays = this.delays();
    if (delays.length === 0) return 0;
    const avg = delays.reduce((sum, delay) => sum + delay.avgMinutes, 0) / delays.length;
    return Math.round(avg);
  });
  affectedEmployees = computed(() => this.delays().length);

  constructor() {
    this.filterForm = this.fb.group({});
    const mockData: DelayData[] = [];
    this.delays.set(mockData);
  }

  generateReport(): void {
    this.loading.set(true);
    // TODO: Implement report generation logic
    setTimeout(() => {
      this.loading.set(false);
      this.snackBar.open('Rapport généré avec succès', 'Fermer', { duration: 2000 });
    }, 1000);
  }

  getCountClass(count: number): string {
    if (count <= 2) return 'low';
    if (count <= 4) return 'medium';
    return 'high';
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving': return 'trending_down';
      case 'worsening': return 'trending_up';
      default: return 'trending_flat';
    }
  }

  exportPDF(): void {
    this.snackBar.open('Export PDF en cours...', 'Fermer', { duration: 2000 });
  }

  exportExcel(): void {
    this.snackBar.open('Export Excel en cours...', 'Fermer', { duration: 2000 });
  }
}
