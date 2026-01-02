import { Component, Inject, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  ScheduleManagementService,
  EquipeDto,
  EquipeCreateRequest
} from '../../services/schedule-management.service';

export interface TeamFormDialogData {
  mode: 'create' | 'edit';
  team?: EquipeDto;
}

@Component({
  selector: 'app-team-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './team-form-dialog.component.html'
})
export class TeamFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private scheduleService = inject(ScheduleManagementService);

  dialogRef = inject(MatDialogRef<TeamFormDialogComponent>);
  data = inject<TeamFormDialogData>(MAT_DIALOG_DATA);

  teamForm!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const team = this.data.team;

    this.teamForm = this.fb.group({
      codeEq: [team?.codeEq || '', [Validators.required]],
      desigEq: [team?.desigEq || '', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request: EquipeCreateRequest = {
      codeSoc: this.data.team?.codeSoc || 'SOC001',
      codeEq: this.teamForm.value.codeEq,
      desigEq: this.teamForm.value.desigEq
    };

    if (this.data.mode === 'create') {
      this.scheduleService.createTeam(request).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.error.set('Erreur lors de la création de l\'équipe');
          this.loading.set(false);
          console.error(err);
        }
      });
    } else {
      this.scheduleService.updateTeam(
        this.data.team!.codeSoc,
        this.data.team!.codeEq,
        request
      ).subscribe({
        next: () => {
          this.loading.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.error.set('Erreur lors de la modification de l\'équipe');
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
    return this.data.mode === 'create' ? 'Nouvelle Équipe' : 'Modifier Équipe';
  }
}
