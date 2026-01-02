import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AttendanceProcessingService,
  DailyRecordDto
} from '../../services/attendance-processing.service';

@Component({
  selector: 'app-attendance-daily',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
  ],
  templateUrl: './attendance-daily.component.html',
})
export class AttendanceDailyComponent implements OnInit {
  private attendanceService = inject(AttendanceProcessingService);

  records = signal<DailyRecordDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedDate = new Date();

  // Computed properties
  completeCount = computed(() => this.records().filter(r => r.heureEntree && r.heureSortie).length);
  validatedCount = computed(() => this.records().filter(r => r.validated).length);
  pendingCount = computed(() => this.records().filter(r => !r.validated).length);

  ngOnInit(): void {
    this.loadAttendance();
  }

  loadAttendance(): void {
    this.loading.set(true);
    this.error.set(null);
    // Simulated data
    this.records.set([]);
    this.loading.set(false);
  }

  formatTime(time: Date | undefined): string {
    if (!time) return '-';
    if (time instanceof Date) {
      return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return '-';
  }

  getStatusChip(record: DailyRecordDto): { label: string; color: string } {
    if (!record.heureEntree) return { label: 'Absent', color: 'warn' };
    if (record.validated) return { label: 'Validé', color: 'primary' };
    return { label: 'En Attente', color: 'accent' };
  }

  validateRecord(record: DailyRecordDto): void {
    const records = this.records();
    const index = records.indexOf(record);
    if (index > -1) {
      records[index].validated = true;
      this.records.set([...records]);
    }
  }
}
