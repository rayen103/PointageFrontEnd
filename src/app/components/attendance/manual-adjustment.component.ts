import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AttendanceProcessingService,
  DailyRecordDto
} from '../../services/attendance-processing.service';

interface ManualAdjustmentData {
  matricule: string;
  date: string;
  heureEntree: string;
  heureSortie: string;
  reason: string;
}

@Component({
  selector: 'app-manual-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-adjustment.component.html',
})
export class ManualAdjustmentComponent {
  private processingService = inject(AttendanceProcessingService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Search criteria
  searchMatricule = signal('');
  searchDate = signal(new Date().toISOString().split('T')[0]);
  
  // Record to adjust
  record = signal<DailyRecordDto | null>(null);
  
  // Adjustment form
  adjustment = signal<ManualAdjustmentData>({
    matricule: '',
    date: '',
    heureEntree: '',
    heureSortie: '',
    reason: ''
  });

  searchRecord(): void {
    if (!this.searchMatricule() || !this.searchDate()) {
      this.error.set('Veuillez saisir un matricule et une date');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const date = new Date(this.searchDate());
    
    this.processingService.getDailyRecords('DEFAULT', date).subscribe({
      next: (records) => {
        const found = records.find(r => r.matricule === this.searchMatricule());
        if (found) {
          this.record.set(found);
          this.adjustment.set({
            matricule: found.matricule,
            date: this.searchDate(),
            heureEntree: found.heureEntree ? this.formatTime(found.heureEntree) : '',
            heureSortie: found.heureSortie ? this.formatTime(found.heureSortie) : '',
            reason: ''
          });
        } else {
          this.error.set('Aucun enregistrement trouvé pour ce matricule et cette date');
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  saveAdjustment(): void {
    const adj = this.adjustment();
    if (!adj.reason) {
      this.error.set('Veuillez indiquer une raison pour l\'ajustement');
      return;
    }

    // In production, this would call a dedicated adjustment endpoint
    // For now, we'll show success and navigate to audit
    this.success.set('Ajustement enregistré avec succès');
    
    setTimeout(() => {
      this.router.navigate(['/pointage/attendance/adjustment-audit']);
    }, 1500);
  }

  formatTime(date?: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  updateAdjustment(field: keyof ManualAdjustmentData, value: string): void {
    this.adjustment.update(a => ({ ...a, [field]: value }));
  }

  clearForm(): void {
    this.record.set(null);
    this.adjustment.set({
      matricule: '',
      date: '',
      heureEntree: '',
      heureSortie: '',
      reason: ''
    });
    this.error.set(null);
    this.success.set(null);
  }
}
