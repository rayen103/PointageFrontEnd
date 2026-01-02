import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface OvertimeEmployeeData {
  matricule: string;
  nom: string;
  service: string;
  hs25: number;
  hs50: number;
  hs75: number;
  hs100: number;
  total: number;
  weighted: number;
}

@Component({
  selector: 'app-overtime-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './overtime-report.component.html',
})
export class OvertimeReportComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  filterForm: FormGroup;
  employees = signal<OvertimeEmployeeData[]>([]);
  loading = signal(false);
  totalHs25 = computed(() => this.employees().reduce((sum, e) => sum + e.hs25, 0));
  totalHs50 = computed(() => this.employees().reduce((sum, e) => sum + e.hs50, 0));
  totalHs75 = computed(() => this.employees().reduce((sum, e) => sum + e.hs75, 0));
  totalHs100 = computed(() => this.employees().reduce((sum, e) => sum + e.hs100, 0));
  totalHours = computed(() => this.employees().reduce((sum, e) => sum + e.total, 0));
  totalWeighted = computed(() => this.employees().reduce((sum, e) => sum + e.weighted, 0));

  constructor() {
    this.filterForm = this.fb.group({});
    const mockData: OvertimeEmployeeData[] = [];
    this.employees.set(mockData);
  }

  generateReport(): void {
    this.loading.set(true);
    // TODO: Implement report generation logic
    setTimeout(() => {
      this.loading.set(false);
      this.snackBar.open('Rapport généré avec succès', 'Fermer', { duration: 2000 });
    }, 1000);
  }

  exportPDF(): void {
    this.snackBar.open('Export PDF en cours...', 'Fermer', { duration: 2000 });
  }

  exportExcel(): void {
    this.snackBar.open('Export Excel en cours...', 'Fermer', { duration: 2000 });
  }
}
