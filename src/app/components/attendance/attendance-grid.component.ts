import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AttendanceProcessingService,
  PresenceGridDto,
  EmployeePresenceDto
} from '../../services/attendance-processing.service';

@Component({
  selector: 'app-attendance-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: './attendance-grid.component.html',
})
export class AttendanceGridComponent implements OnInit {
  private attendanceService = inject(AttendanceProcessingService);

  grid = signal<PresenceGridDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' }, { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  ngOnInit(): void {
    this.loadGrid();
  }

  loadGrid(): void {
    this.loading.set(true);
    this.error.set(null);

    this.attendanceService.getPresenceGrid(
      'SOC001',
      this.selectedMonth,
      this.selectedYear
    ).subscribe({
      next: (grid) => {
        this.grid.set(grid);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement de la grille');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  daysInMonth(): number[] {
    const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }

  isWeekend(day: number): boolean {
    const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  getStatusSymbol(emp: EmployeePresenceDto, day: number): string {
    const dayData = emp.days.find(d => d.jour === day);
    return dayData?.statut || '-';
  }

  getStatusClass(emp: EmployeePresenceDto, day: number): string {
    const symbol = this.getStatusSymbol(emp, day);
    switch (symbol) {
      case 'P': return 'status present';
      case 'A': return 'status absent';
      case 'C': return 'status leave';
      case 'M': return 'status sick';
      default: return 'status empty';
    }
  }

  getTooltip(emp: EmployeePresenceDto, day: number): string {
    const dayData = emp.days.find(d => d.jour === day);
    if (!dayData) return 'Aucune donnée';

    const status = dayData.statut === 'P' ? 'Présent' :
                   dayData.statut === 'A' ? 'Absent' :
                   dayData.statut === 'C' ? 'Congé' :
                   dayData.statut === 'M' ? 'Maladie' : 'Inconnu';

    return `${emp.nom} ${emp.prenom} - ${day}/${this.selectedMonth}: ${status}`;
  }
}
