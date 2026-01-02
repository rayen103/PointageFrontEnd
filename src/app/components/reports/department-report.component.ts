import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportingService } from '../../services/reporting.service';
import { DepartmentReportDto } from '../../models/reporting.models';

interface DepartmentStats {
  service: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  delayCount: number;
  presenceRate: number;
  avgHours: number;
  trend: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-department-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './department-report.component.html',
})
export class DepartmentReportComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private reportingService = inject(ReportingService);

  filterForm: FormGroup;
  departments = signal<DepartmentStats[]>([]);
  loading = signal(false);

  // Computed signals for template
  totalDepartments = computed(() => this.departments().length);
  totalEmployees = computed(() =>
    this.departments().reduce((sum, dept) => sum + dept.totalEmployees, 0)
  );
  avgPresenceRate = computed(() => {
    const depts = this.departments();
    if (depts.length === 0) return 0;
    const avg = depts.reduce((sum, dept) => sum + dept.presenceRate, 0) / depts.length;
    return Math.round(avg);
  });
  bestDepartment = computed(() => {
    const depts = this.departments();
    if (depts.length === 0) return '-';
    const best = depts.reduce((prev, current) =>
      current.presenceRate > prev.presenceRate ? current : prev
    );
    return best.service;
  });

  constructor() {
    this.filterForm = this.fb.group({});
    const mockData: DepartmentStats[] = [];
    this.departments.set(mockData);
  }

  generateReport(): void {
    this.loading.set(true);
    // TODO: Implement report generation logic
    setTimeout(() => {
      this.loading.set(false);
      this.snackBar.open('Rapport généré avec succès', 'Fermer', { duration: 2000 });
    }, 1000);
  }

  getRateClass(rate: number): string {
    if (rate >= 95) return 'excellent';
    if (rate >= 90) return 'good';
    if (rate >= 80) return 'average';
    return 'poor';
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
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
