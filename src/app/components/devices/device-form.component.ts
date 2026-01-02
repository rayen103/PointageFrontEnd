import { Component, inject, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeviceManagementService } from '../../services/device-management.service';
import { TerminalDto, CreateTerminalRequest, UpdateTerminalRequest } from '../../models/device.models';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-device-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './device-form.component.html'
})
export class DeviceFormComponent {
  private fb = inject(FormBuilder);
  private deviceService = inject(DeviceManagementService);
  private dialogRef = inject(MatDialogRef<DeviceFormComponent>);
  private snackBar = inject(MatSnackBar);

  saving = signal(false);
  form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: TerminalDto | null) {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    this.form = this.fb.group({
      numeroTerminal: [data?.numeroTerminal || '', [Validators.required]],
      adresseIp: [data?.adresseIp || '', [Validators.required, Validators.pattern(ipPattern)]],
      port: [data?.port || 4370, [Validators.required, Validators.min(1), Validators.max(65535)]],
      nomService: [data?.nomService || '', [Validators.required]],
      localisation: [data?.localisation || ''],
      typeAppareil: [data?.typeAppareil || 'ZKTeco'],
      modele: [data?.modele || ''],
      numeroSerie: [data?.numeroSerie || ''],
      remarques: [data?.remarques || '']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.form.valid) {
      return;
    }

    this.saving.set(true);

    if (this.data?.id) {
      const request: UpdateTerminalRequest = {
        id: this.data.id,
        ...this.form.value
      };

      this.deviceService.updateTerminal(request).subscribe({
        next: (terminal: TerminalDto) => {
          this.saving.set(false);
          this.snackBar.open('Terminal mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close(terminal);
        },
        error: (err: Error) => {
          this.saving.set(false);
          this.snackBar.open(`Erreur: ${err.message}`, 'Fermer', { duration: 5000 });
        }
      });
    } else {
      const request: CreateTerminalRequest = this.form.value;

      this.deviceService.createTerminal(request).subscribe({
        next: (terminal: TerminalDto) => {
          this.saving.set(false);
          this.snackBar.open('Terminal créé avec succès', 'Fermer', { duration: 3000 });
          this.dialogRef.close(terminal);
        },
        error: (err: Error) => {
          this.saving.set(false);
          this.snackBar.open(`Erreur: ${err.message}`, 'Fermer', { duration: 5000 });
        }
      });
    }
  }
}
