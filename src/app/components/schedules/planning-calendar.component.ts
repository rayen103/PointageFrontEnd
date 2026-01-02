import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ScheduleManagementService,
  PlaningDto,
  PlaningSearchRequest
} from '../../services/schedule-management.service';

interface CalendarDay {
  date: Date;
  planning: PlaningDto | null;
  isWeekend: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-planning-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './planning-calendar.component.html'
})
export class PlanningCalendarComponent implements OnInit {
  private scheduleService = inject(ScheduleManagementService);

  plannings = signal<PlaningDto[]>([]);
  loading = signal(false);
  currentMonth = signal(new Date());
  selectedMatricule = 'EMP001';

  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

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

      const planning = this.plannings().find(p => {
        const planningDate = new Date(p.dateRepos!);
        return planningDate.getDate() === i &&
               planningDate.getMonth() === monthIndex &&
               planningDate.getFullYear() === year;
      });

      days.push({
        date,
        planning: planning || null,
        isWeekend,
        isToday
      });
    }

    return days;
  });

  ngOnInit(): void {
    this.loadPlanning();
  }

  loadPlanning(): void {
    this.loading.set(true);

    const month = this.currentMonth();
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const request: PlaningSearchRequest = {
      codeSoc: 'SOC001',
      matricule: this.selectedMatricule,
      dateDebut: startDate,
      dateFin: endDate
    };

    this.scheduleService.searchPlannings(request).subscribe({
      next: (plannings) => {
        this.plannings.set(plannings);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading planning:', err);
        this.loading.set(false);
      }
    });
  }

  previousMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1));
    this.loadPlanning();
  }

  nextMonth(): void {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1));
    this.loadPlanning();
  }

  getMonthName(): string {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const month = this.currentMonth();
    return `${months[month.getMonth()]} ${month.getFullYear()}`;
  }
}
