import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  AttendanceProcessingService,
  ProcessingSummaryDto
} from '../../services/attendance-processing.service';

@Component({
  selector: 'app-batch-processing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './batch-processing.component.html',
})
export class BatchProcessingComponent implements OnInit {
  private attendanceService = inject(AttendanceProcessingService);

  loading = signal(false);
  summary = signal<ProcessingSummaryDto | null>(null);

  processingType = 'date';
  selectedDate = new Date();
  startDate = new Date();
  endDate = new Date();
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

  ngOnInit(): void {}

  processAttendance(): void {
    this.loading.set(true);
    this.summary.set(null);

    let obs: Observable<ProcessingSummaryDto>;

    if (this.processingType === 'date') {
      obs = this.attendanceService.processDate('SOC001', this.selectedDate);
    } else if (this.processingType === 'period') {
      obs = this.attendanceService.processPeriod('SOC001', this.startDate, this.endDate);
    } else {
      obs = this.attendanceService.processMonth('SOC001', this.selectedMonth, this.selectedYear);
    }

    obs.subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: (err) => {
        alert('Erreur lors du traitement');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}
