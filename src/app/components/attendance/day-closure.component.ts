import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  DayClosureService,
  DayClosure,
  DayClosureRequest,
  DayReopenRequest
} from '../../services/day-closure.service';

@Component({
  selector: 'app-day-closure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
  ],
  templateUrl: './day-closure.component.html',
})
export class DayClosureComponent implements OnInit {
  private dayClosureService = inject(DayClosureService);

  closureStatus = signal<DayClosure | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Form data
  codeSociete = signal('DEFAULT');
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  closureComments = signal('');
  reopenReason = signal('');
  closedBy = signal('Admin'); // This should come from auth service

  ngOnInit(): void {
    this.checkStatus();
  }

  checkStatus(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dayClosureService.getStatus(this.codeSociete(), this.selectedDate()).subscribe({
      next: (status) => {
        this.closureStatus.set(status);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors de la vérification du statut: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  validateClosure(): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.dayClosureService.validateClosure(this.codeSociete(), this.selectedDate()).subscribe({
      next: (validation) => {
        this.closureStatus.set(validation);
        this.loading.set(false);
        
        if (validation.validationErrors.length > 0) {
          this.error.set(`${validation.validationErrors.length} erreur(s) de validation détectée(s)`);
        } else {
          this.success.set('Validation réussie. Prêt pour la clôture.');
        }
      },
      error: (err) => {
        this.error.set('Erreur lors de la validation: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  closeDay(): void {
    if (!this.closureStatus() || this.closureStatus()!.validationErrors.length > 0) {
      this.error.set('Veuillez d\'abord valider la journée sans erreurs');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const request: DayClosureRequest = {
      codeSociete: this.codeSociete(),
      date: this.selectedDate(),
      closedBy: this.closedBy(),
      comments: this.closureComments() || undefined
    };

    this.dayClosureService.closeDay(request).subscribe({
      next: (result) => {
        this.closureStatus.set(result);
        this.loading.set(false);
        this.success.set('Journée clôturée avec succès');
        this.closureComments.set('');
      },
      error: (err) => {
        this.error.set('Erreur lors de la clôture: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  reopenDay(): void {
    if (!this.reopenReason()) {
      this.error.set('Veuillez indiquer une raison pour la réouverture');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const request: DayReopenRequest = {
      codeSociete: this.codeSociete(),
      date: this.selectedDate(),
      reopenedBy: this.closedBy(),
      reason: this.reopenReason()
    };

    this.dayClosureService.reopenDay(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Journée rouverte avec succès');
        this.reopenReason.set('');
        this.checkStatus(); // Refresh status
      },
      error: (err) => {
        this.error.set('Erreur lors de la réouverture: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  onDateChange(): void {
    this.error.set(null);
    this.success.set(null);
    this.closureComments.set('');
    this.reopenReason.set('');
    this.checkStatus();
  }

  getStatusColor(): string {
    const status = this.closureStatus();
    if (!status) return 'gray';
    return status.isClosed ? 'red' : 'green';
  }

  getStatusLabel(): string {
    const status = this.closureStatus();
    if (!status) return 'Inconnu';
    return status.isClosed ? 'Clôturée' : 'Ouverte';
  }

  canClose(): boolean {
    const status = this.closureStatus();
    return !!(status && !status.isClosed && status.validationErrors.length === 0);
  }

  canReopen(): boolean {
    const status = this.closureStatus();
    return !!(status && status.isClosed);
  }
}
