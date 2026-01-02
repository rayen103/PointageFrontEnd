import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ReferenceDataService,
  AbsenceMotiveDto,
  CreateAbsenceMotiveRequest
} from '../../services/reference-data.service';

interface NewMotiveForm {
  codeMotif: string;
  designMotif: string;
  abrev: string;
}

@Component({
  selector: 'app-motive-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './motive-management.component.html',
})
export class MotiveManagementComponent {
  private refDataService = inject(ReferenceDataService);

  motives = signal<AbsenceMotiveDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  
  codeSociete = signal('DEFAULT');
  motiveType = signal<'absence' | 'delay' | 'authorization'>('absence');
  
  // Form for new motive
  showForm = signal(false);
  newMotive = signal<NewMotiveForm>({
    codeMotif: '',
    designMotif: '',
    abrev: ''
  });

  loadMotives(): void {
    this.loading.set(true);
    this.error.set(null);
    
    // Load absence motives (can be extended for delay and authorization)
    this.refDataService.getAllAbsenceMotives(this.codeSociete()).subscribe({
      next: (data: AbsenceMotiveDto[]) => {
        this.motives.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Une erreur est survenue';
        this.error.set('Erreur: ' + message);
        this.loading.set(false);
      }
    });
  }

  createMotive(): void {
    const motive = this.newMotive();
    if (!motive.codeMotif || !motive.designMotif) {
      this.error.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const request: CreateAbsenceMotiveRequest = {
      codeSoc: this.codeSociete(),
      codeMotif: motive.codeMotif,
      designMotif: motive.designMotif,
      abrev: motive.abrev
    };

    this.refDataService.createAbsenceMotive(request).subscribe({
      next: () => {
        this.success.set('Motif créé avec succès');
        this.showForm.set(false);
        this.newMotive.set({ codeMotif: '', designMotif: '', abrev: '' });
        this.loadMotives();
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Une erreur est survenue';
        this.error.set('Erreur: ' + message);
      }
    });
  }

  deleteMotive(code: string): void {
    if (confirm('Confirmer la suppression?')) {
      this.refDataService.deleteAbsenceMotive(this.codeSociete(), code).subscribe({
        next: () => {
          this.success.set('Motif supprimé');
          this.loadMotives();
        },
        error: (err) => {
          this.error.set('Erreur: ' + err.message);
        }
      });
    }
  }

  updateNewMotive<K extends keyof NewMotiveForm>(field: K, value: NewMotiveForm[K]): void {
    this.newMotive.update(m => ({ ...m, [field]: value }));
  }
}
