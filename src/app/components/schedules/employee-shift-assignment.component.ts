import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ScheduleManagementService,
  ShiftDto,
  ShiftAssignRequest,
  ShiftSearchRequest
} from '../../services/schedule-management.service';

@Component({
  selector: 'app-employee-shift-assignment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './employee-shift-assignment.component.html'
})
export class EmployeeShiftAssignmentComponent implements OnInit {
  private scheduleService = inject(ScheduleManagementService);

  shifts = signal<ShiftDto[]>([]);
  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  matricule = '';
  selectedShift = '';
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  ngOnInit(): void {
    this.loadShifts();
  }

  loadShifts(): void {
    const request: ShiftSearchRequest = {
      codeSoc: 'SOC001'
    };

    this.scheduleService.searchShifts(request).subscribe({
      next: (shifts) => {
        this.shifts.set(shifts);
      },
      error: (err) => {
        console.error('Error loading shifts:', err);
      }
    });
  }

  assignShift(): void {
    this.success.set(false);
    this.error.set(null);

    if (!this.matricule || !this.selectedShift) {
      this.error.set('Veuillez remplir tous les champs requis');
      return;
    }

    this.loading.set(true);

    const request: ShiftAssignRequest = {
      codeSoc: 'SOC001',
      codeShift: this.selectedShift,
      matricule: this.matricule,
      dateDebut: this.dateDebut || undefined,
      dateFin: this.dateFin || undefined
    };

    this.scheduleService.assignShiftToEmployee(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.resetForm();
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Erreur lors de l\'affectation du shift');
        console.error(err);
      }
    });
  }

  resetForm(): void {
    this.matricule = '';
    this.selectedShift = '';
    this.dateDebut = null;
    this.dateFin = null;
  }
}
