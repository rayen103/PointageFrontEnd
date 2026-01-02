import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AttendanceProcessingService,
  ProcessingRequest,
  ProcessingSummaryDto
} from '../../services/attendance-processing.service';

@Component({
  selector: 'app-automatic-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './automatic-adjustment.component.html',
})
export class AutomaticAdjustmentComponent implements OnInit {
  private processingService = inject(AttendanceProcessingService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  summary = signal<ProcessingSummaryDto | null>(null);

  // Form fields
  codeSociete = signal('DEFAULT');
  dateDebut = signal('');
  dateFin = signal('');
  selectedMonth = signal(new Date().getMonth() + 1);
  selectedYear = signal(new Date().getFullYear());
  processType = signal<'date' | 'month'>('date');

  ngOnInit(): void {
    const today = new Date();
    this.dateDebut.set(today.toISOString().split('T')[0]);
    this.dateFin.set(today.toISOString().split('T')[0]);
  }

  runAutoAdjustment(): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    if (this.processType() === 'date') {
      const dateDebut = new Date(this.dateDebut());
      const dateFin = new Date(this.dateFin());
      
      this.processingService.processPeriod(this.codeSociete(), dateDebut, dateFin).subscribe({
        next: (result) => {
          this.summary.set(result);
          this.success.set('Ajustement automatique terminé avec succès');
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erreur lors de l\'ajustement: ' + err.message);
          this.loading.set(false);
        }
      });
    } else {
      this.processingService.processMonth(
        this.codeSociete(), 
        this.selectedMonth(), 
        this.selectedYear()
      ).subscribe({
        next: (result) => {
          this.summary.set(result);
          this.success.set('Ajustement automatique terminé avec succès');
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erreur lors de l\'ajustement: ' + err.message);
          this.loading.set(false);
        }
      });
    }
  }

  viewAuditTrail(): void {
    this.router.navigate(['/pointage/attendance/adjustment-audit']);
  }

  viewProblems(): void {
    this.router.navigate(['/pointage/attendance/adjustment-problems']);
  }
}
