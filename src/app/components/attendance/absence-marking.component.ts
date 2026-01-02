import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Absence {
  id: number;
  date: Date;
  matricule: string;
  type: string;
  justification: string;
}

@Component({
  selector: 'app-absence-marking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './absence-marking.component.html'
})
export class AbsenceMarkingComponent {
  matricule = '';
  absenceDate: Date = new Date();
  absenceType = 'maladie';
  justification = '';
  showNotification = signal(false);
  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  absences = signal<Absence[]>([
    { id: 1, date: new Date('2024-01-15'), matricule: 'EMP001', type: 'Maladie', justification: 'Grippe' },
    { id: 2, date: new Date('2024-01-16'), matricule: 'EMP002', type: 'Congé', justification: 'Congé annuel' }
  ]);

  markAbsence(): void {
    if (!this.matricule || !this.absenceDate) {
      this.showMessage('Veuillez remplir tous les champs', 'error');
      return;
    }

    const newAbsence: Absence = {
      id: Date.now(),
      date: this.absenceDate,
      matricule: this.matricule,
      type: this.absenceType,
      justification: this.justification
    };

    this.absences.update(list => [newAbsence, ...list]);
    this.showMessage('Absence marquée avec succès', 'success');
    
    this.matricule = '';
    this.justification = '';
  }

  deleteAbsence(absence: Absence): void {
    this.absences.update(list => list.filter(a => a.id !== absence.id));
    this.showMessage('Absence supprimée', 'success');
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    this.showNotification.set(true);
    setTimeout(() => this.showNotification.set(false), 3000);
  }
}
