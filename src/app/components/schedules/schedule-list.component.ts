import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ScheduleManagementService,
  HoraireDto,
  HoraireSearchRequest
} from '../../services/schedule-management.service';
import { ScheduleFormDialogComponent } from './schedule-form-dialog.component';

interface CalendarDay {
  date: Date;
  schedules: HoraireDto[];
  isWeekend: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss']
})
export class ScheduleListComponent implements OnInit {
  private scheduleService = inject(ScheduleManagementService);
  private dialog = inject(MatDialog);

  // Signals
  schedules = signal<HoraireDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentView = signal<'list' | 'calendar'>('calendar');
  currentMonth = signal(new Date());

  // Computed
  calendarDays = computed(() => {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, monthIndex, i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isToday = date.getTime() === today.getTime();

      days.push({
        date,
        schedules: this.getSchedulesForDate(date),
        isWeekend,
        isToday
      });
    }

    return days;
  });

  weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  getDayName(date: Date): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
  }

  formatTime(hours?: number, minutes?: number): string {
    if (hours === undefined && minutes === undefined) return '-';
    const h = hours || 0;
    const m = minutes || 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  getMorningTime(schedule: HoraireDto): string {
    const start = this.formatTime(schedule.debutAmH, schedule.debutAmMn);
    const end = this.formatTime(schedule.finAmH, schedule.finAmMn);
    return `${start} - ${end}`;
  }

  getAfternoonTime(schedule: HoraireDto): string {
    const start = this.formatTime(schedule.debutPmH, schedule.debutPmMn);
    const end = this.formatTime(schedule.finPmH, schedule.finPmMn);
    return `${start} - ${end}`;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ScheduleFormDialogComponent, {
      width: '700px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSchedules();
      }
    });
  }

  openEditDialog(schedule: HoraireDto): void {
    const dialogRef = this.dialog.open(ScheduleFormDialogComponent, {
      width: '700px',
      data: { mode: 'edit', schedule }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSchedules();
      }
    });
  }

  deleteSchedule(schedule: HoraireDto): void {
    if (confirm(`Supprimer l'horaire ${schedule.codeHoraire}?`)) {
      this.scheduleService.deleteSchedule(
        schedule.codeSoc,
        schedule.codeHoraire
      ).subscribe({
        next: () => {
          this.loadSchedules();
        },
        error: (err) => {
          alert('Erreur lors de la suppression de l\'horaire');
          console.error(err);
        }
      });
    }
  }

  previousMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1));
  }

  nextMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1));
  }

  goToToday(): void {
    this.currentMonth.set(new Date());
  }

  getMonthName(): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const month = this.currentMonth();
    return `${months[month.getMonth()]} ${month.getFullYear()}`;
  }

  setView(view: 'list' | 'calendar'): void {
    this.currentView.set(view);
  }

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.loading.set(true);
    this.error.set(null);
    // Minimal load: fetch all schedules for a default company code
    this.scheduleService.searchSchedules({ codeSoc: 'SOC001' }).subscribe({
      next: (s) => {
        this.schedules.set(s);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Erreur lors du chargement des horaires');
        this.loading.set(false);
      }
    });
  }

  getSchedulesForDate(_date: Date): HoraireDto[] {
    // Without date on HoraireDto, return all schedules for display
    return this.schedules();
  }
}
