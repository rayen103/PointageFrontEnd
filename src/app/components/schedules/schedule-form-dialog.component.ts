import { Component, Inject, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  ScheduleManagementService,
  HoraireDto,
  HoraireCreateRequest
} from '../../services/schedule-management.service';

export interface ScheduleFormDialogData {
  mode: 'create' | 'edit';
  schedule?: HoraireDto;
}

@Component({
  selector: 'app-schedule-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSlideToggleModule
  ],
  templateUrl: './schedule-form-dialog.component.html',
  styleUrls: ['./schedule-form-dialog.component.scss']
})
export class ScheduleFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private scheduleService = inject(ScheduleManagementService);

  dialogRef = inject(MatDialogRef<ScheduleFormDialogComponent>);
  data = inject<ScheduleFormDialogData>(MAT_DIALOG_DATA);

  scheduleForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  dayOptions = [
    { value: 'Lundi', label: 'Lundi' },
    { value: 'Mardi', label: 'Mardi' },
    { value: 'Mercredi', label: 'Mercredi' },
    { value: 'Jeudi', label: 'Jeudi' },
    { value: 'Vendredi', label: 'Vendredi' },
    { value: 'Samedi', label: 'Samedi' },
    { value: 'Dimanche', label: 'Dimanche' }
  ];

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const schedule = this.data.schedule;

    this.scheduleForm = this.fb.group({
      codeHoraire: [schedule?.codeHoraire || '', [Validators.required]],
      libelleJour: [schedule?.libelleJour || '', [Validators.required]],
      debutAmH: [schedule?.debutAmH || 8, [Validators.required, Validators.min(0), Validators.max(23)]],
      debutAmMn: [schedule?.debutAmMn || 0, [Validators.required, Validators.min(0), Validators.max(59)]],
      finAmH: [schedule?.finAmH || 12, [Validators.required, Validators.min(0), Validators.max(23)]],
      finAmMn: [schedule?.finAmMn || 0, [Validators.required, Validators.min(0), Validators.max(59)]],
      debutPmH: [schedule?.debutPmH || 13, [Validators.required, Validators.min(0), Validators.max(23)]],
      debutPmMn: [schedule?.debutPmMn || 0, [Validators.required, Validators.min(0), Validators.max(59)]],
      finPmH: [schedule?.finPmH || 17, [Validators.required, Validators.min(0), Validators.max(23)]],
      finPmMn: [schedule?.finPmMn || 0, [Validators.required, Validators.min(0), Validators.max(59)]]
    });
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.scheduleForm.value;
    const request: HoraireCreateRequest = {
      codeSoc: this.data.schedule?.codeSoc || 'SOC001',
      codeHoraire: formValue.codeHoraire,
      libelleJour: formValue.libelleJour,
      debutAmH: formValue.debutAmH,
      debutAmMn: formValue.debutAmMn,
      finAmH: formValue.finAmH,
      finAmMn: formValue.finAmMn,
      debutPmH: formValue.debutPmH,
      debutPmMn: formValue.debutPmMn,
      finPmH: formValue.finPmH,
      finPmMn: formValue.finPmMn
    };

    if (this.data.mode === 'create') {
      this.scheduleService.createSchedule(request).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.error.set('Erreur lors de la création de l\'horaire');
          this.loading.set(false);
          console.error(err);
        }
      });
    } else {
      this.scheduleService.updateSchedule(
        this.data.schedule!.codeSoc,
        this.data.schedule!.codeHoraire,
        request
      ).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.error.set('Erreur lors de la modification de l\'horaire');
          this.loading.set(false);
          console.error(err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getTitle(): string {
    return this.data.mode === 'create' ? 'Nouvel Horaire' : 'Modifier Horaire';
  }
}
