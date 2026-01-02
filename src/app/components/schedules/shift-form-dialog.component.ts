import { Component, Inject, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ScheduleManagementService,
  ShiftDto,
  ShiftCreateRequest
} from '../../services/schedule-management.service';

export interface ShiftFormDialogData {
  mode: 'create' | 'edit';
  shift?: ShiftDto;
}

@Component({
  selector: 'app-shift-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './shift-form-dialog.component.html'
})
export class ShiftFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private scheduleService = inject(ScheduleManagementService);

  dialogRef = inject(MatDialogRef<ShiftFormDialogComponent>);
  data = inject<ShiftFormDialogData>(MAT_DIALOG_DATA);

  shiftForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const shift = this.data.shift;

    this.shiftForm = this.fb.group({
      codeShift: [shift?.codeShift || '', [Validators.required]],
      designationShift: [shift?.designationShift || '', [Validators.required]],
      nbrHeureMois: [shift?.nbrHeureMois || null],
      nbrJourMois: [shift?.nbrJourMois || null]
    });
  }

  onSubmit(): void {
    if (this.shiftForm.invalid) {
      this.shiftForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.shiftForm.value;
    const request: ShiftCreateRequest = {
      codeSoc: this.data.shift?.codeSoc || 'SOC001',
      codeShift: formValue.codeShift,
      designationShift: formValue.designationShift,
      nbrHeureMois: formValue.nbrHeureMois,
      nbrJourMois: formValue.nbrJourMois
    };

    if (this.data.mode === 'create') {
      this.scheduleService.createShift(request).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.error.set('Erreur lors de la création du shift');
          this.loading.set(false);
          console.error(err);
        }
      });
    } else {
      this.scheduleService.updateShift(
        this.data.shift!.codeSoc,
        this.data.shift!.codeShift,
        request
      ).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.error.set('Erreur lors de la modification du shift');
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
    return this.data.mode === 'create' ? 'Nouveau Shift' : 'Modifier Shift';
  }
}
