import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ErrorProcessingService,
  WeeklyAnomaly
} from '../../services/error-processing.service';

@Component({
  selector: 'app-weekly-anomalies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weekly-anomalies.component.html',
})
export class WeeklyAnomaliesComponent implements OnInit {
  private errorService = inject(ErrorProcessingService);

  weeklyData = signal<WeeklyAnomaly | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  codeSociete = signal('DEFAULT');
  weekStart = signal(this.getMonday(new Date()).toISOString().split('T')[0]);

  ngOnInit(): void {
    this.loadWeeklyAnomalies();
  }

  loadWeeklyAnomalies(): void {
    this.loading.set(true);
    this.error.set(null);

    this.errorService.getWeeklyAnomaly(this.codeSociete(), this.weekStart()).subscribe({
      next: (data) => {
        this.weeklyData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  getErrorTypeEntries(): [string, number][] {
    const data = this.weeklyData();
    if (!data || !data.errorsByType) return [];
    return Object.entries(data.errorsByType).sort((a, b) => b[1] - a[1]);
  }

  previousWeek(): void {
    const current = new Date(this.weekStart());
    current.setDate(current.getDate() - 7);
    this.weekStart.set(current.toISOString().split('T')[0]);
    this.loadWeeklyAnomalies();
  }

  nextWeek(): void {
    const current = new Date(this.weekStart());
    current.setDate(current.getDate() + 7);
    this.weekStart.set(current.toISOString().split('T')[0]);
    this.loadWeeklyAnomalies();
  }
}
