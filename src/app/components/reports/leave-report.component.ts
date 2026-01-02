import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface LeaveData {
  matricule: string;
  nom: string;
  service: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  status: 'approuvé' | 'en attente' | 'rejeté';
}

@Component({
  selector: 'app-leave-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './leave-report.component.html',
})
export class LeaveReportComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  filterForm: FormGroup;
  leaves = signal<LeaveData[]>([]);
  loading = signal(false);
  approvedLeaves = computed(() => this.leaves().filter(l => l.status === 'approuvé').length);
  pendingLeaves = computed(() => this.leaves().filter(l => l.status === 'en attente').length);
  rejectedLeaves = computed(() => this.leaves().filter(l => l.status === 'rejeté').length);
  totalLeaves = computed(() => this.leaves().length);

  constructor() {
    this.filterForm = this.fb.group({});
    const mockData: LeaveData[] = [];
    this.leaves.set(mockData);
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
