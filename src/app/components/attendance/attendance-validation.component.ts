import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AttendanceProcessingService,
  DailyRecordDto
} from '../../services/attendance-processing.service';

@Component({
  selector: 'app-attendance-validation',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './attendance-validation.component.html'
})
export class AttendanceValidationComponent implements OnInit {
  private attendanceService = inject(AttendanceProcessingService);
  private snackBar = inject(MatSnackBar);

  records = signal<DailyRecordDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  pendingRecords = computed(() => this.records().filter(r => !r.validated));
  validatedRecords = computed(() => this.records().filter(r => r.validated && r.complete));
  incompleteRecords = computed(() => this.records().filter(r => !r.complete));

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading.set(true);
    this.error.set(null);
    // TODO: Load records from service
    this.loading.set(false);
  }

  validateAll(): void {
    const pending = this.pendingRecords();
    if (pending.length === 0) {
      this.snackBar.open('Aucun enregistrement à valider', 'Fermer', { duration: 2000 });
      return;
    }
    this.snackBar.open(`${pending.length} enregistrements validés`, 'Fermer', { duration: 2000 });
  }

  validateRecord(record: DailyRecordDto): void {
    this.snackBar.open('Enregistrement validé', 'Fermer', { duration: 2000 });
  }

  invalidateRecord(record: DailyRecordDto): void {
    this.snackBar.open('Enregistrement invalidé', 'Fermer', { duration: 2000 });
  }

  getStatusLabel(record: DailyRecordDto): string {
    if (record.validated) return 'Validé';
    if (record.complete) return 'Complet';
    return 'Incomplet';
  }

  formatDate(date: any): string {
    if (!date) return '-';
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('fr-FR');
    }
    return date.toLocaleDateString('fr-FR');
  }

  formatTime(time: any): string {
    if (!time) return '-';
    if (typeof time === 'string') {
      return time.substring(0, 5);
    }
    return time.toString().substring(0, 5);
  }
}
