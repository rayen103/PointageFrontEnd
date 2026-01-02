import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceManagementService } from '../../services/device-management.service';
import { TerminalDto, EmployeeEnrollmentDto } from '../../models/device.models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-enrollment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './employee-enrollment.component.html',
})
export class EmployeeEnrollmentComponent {
  private deviceService = inject(DeviceManagementService);
  private snackBar = inject(MatSnackBar);

  terminals = signal<TerminalDto[]>([]);
  enrollments = signal<EmployeeEnrollmentDto[]>([]);
  filteredEnrollments = signal<EmployeeEnrollmentDto[]>([]);
  stats = signal({ total: 0, enrolled: 0, notEnrolled: 0 });

  selectedTerminalId: number | null = null;
  searchTerm = '';
  statusFilter: 'all' | 'enrolled' | 'not-enrolled' = 'all';

  ngOnInit(): void {
    this.enrollments.set([]);
    this.applyFilters();
    this.updateStats();
  }

  private applyFilters(): void {
    let filtered = this.enrollments();

    if (this.selectedTerminalId) {
      filtered = filtered.filter(e => e.terminalId === this.selectedTerminalId);
    }

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.matricule.toLowerCase().includes(search) ||
        e.nom.toLowerCase().includes(search) ||
        e.prenom.toLowerCase().includes(search)
      );
    }

    if (this.statusFilter === 'enrolled') {
      filtered = filtered.filter(e => e.enrolled);
    } else if (this.statusFilter === 'not-enrolled') {
      filtered = filtered.filter(e => !e.enrolled);
    }

    this.filteredEnrollments.set(filtered);
  }

  private updateStats(): void {
    const enrollments = this.enrollments();
    this.stats.set({
      total: enrollments.length,
      enrolled: enrollments.filter(e => e.enrolled).length,
      notEnrolled: enrollments.filter(e => !e.enrolled).length
    });
  }

  onTerminalChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getTerminalName(terminalId: number | null): string {
    if (!terminalId) return 'Non assigné';
    const terminal = this.terminals().find(t => t.id === terminalId);
    return terminal ? `${terminal.numeroTerminal} - ${terminal.nomService}` : 'Inconnu';
  }

  enrollEmployee(enrollment: EmployeeEnrollmentDto): void {
    this.snackBar.open(`Enrôlement de ${enrollment.prenom} ${enrollment.nom} en cours...`, 'Fermer', { duration: 2000 });
    setTimeout(() => {
      enrollment.enrolled = true;
      enrollment.enrolledDate = new Date();
      this.updateStats();
      this.snackBar.open('Employé enrôlé avec succès', 'Fermer', { duration: 3000 });
    }, 1500);
  }

  updateEnrollment(enrollment: EmployeeEnrollmentDto): void {
    this.snackBar.open('Mise à jour de l\'enrôlement...', 'Fermer', { duration: 2000 });
    setTimeout(() => {
      this.snackBar.open('Enrôlement mis à jour', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  unenrollEmployee(enrollment: EmployeeEnrollmentDto): void {
    this.snackBar.open('Retrait de l\'enrôlement...', 'Fermer', { duration: 2000 });
    setTimeout(() => {
      enrollment.enrolled = false;
      enrollment.enrolledDate = undefined;
      this.updateStats();
      this.snackBar.open('Employé retiré du terminal', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  enrollAllUnEnrolled(): void {
    const unenrolled = this.enrollments().filter(e => !e.enrolled);
    this.snackBar.open(`Enrôlement de ${unenrolled.length} employés...`, 'Fermer', { duration: 2000 });
    setTimeout(() => {
      unenrolled.forEach(e => {
        e.enrolled = true;
        e.enrolledDate = new Date();
      });
      this.updateStats();
      this.applyFilters();
      this.snackBar.open('Tous les employés ont été enrôlés', 'Fermer', { duration: 3000 });
    }, 2000);
  }

  syncAllEnrollments(): void {
    this.snackBar.open('Synchronisation de tous les enrôlements...', 'Fermer', { duration: 2000 });
    setTimeout(() => {
      this.snackBar.open('Synchronisation terminée avec succès', 'Fermer', { duration: 3000 });
    }, 3000);
  }
}
