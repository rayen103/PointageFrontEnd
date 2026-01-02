import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { OvertimeTierDto, OvertimeTierCreateRequest } from '../../services/overtime-tier.service';

export interface OvertimeTierFormDialogData {
    codeSoc: string;
    overtimeTier?: OvertimeTierDto;
    isEdit: boolean;
}

@Component({
    selector: 'app-overtime-tier-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule
    ],
    template: `
        <h2 mat-dialog-title>{{ data.isEdit ? 'Modifier le Palier' : 'Nouveau Palier' }}</h2>
        <mat-dialog-content>
            <form #tierForm="ngForm" class="tier-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Code Société</mat-label>
                    <input matInput [(ngModel)]="formData.codeSoc" name="codeSoc" required [disabled]="data.isEdit">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Code Palier</mat-label>
                    <input matInput [(ngModel)]="formData.codePalier" name="codePalier" required [disabled]="data.isEdit" maxlength="10">
                    <mat-hint>Ex: P01, P02, HS25</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Désignation</mat-label>
                    <input matInput [(ngModel)]="formData.desigPalier" name="desigPalier" maxlength="100">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Type de Palier</mat-label>
                    <mat-select [(ngModel)]="formData.typePalier" name="typePalier">
                        <mat-option value="">Non défini</mat-option>
                        <mat-option value="HS">Heures Supplémentaires</mat-option>
                        <mat-option value="HC">Heures Complémentaires</mat-option>
                        <mat-option value="HN">Heures de Nuit</mat-option>
                    </mat-select>
                </mat-form-field>

                <div class="form-row">
                    <mat-form-field appearance="outline">
                        <mat-label>Valeur (heures)</mat-label>
                        <input matInput type="number" [(ngModel)]="formData.valeur" name="valeur" min="0" step="0.5">
                        <mat-hint>Seuil en heures</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Taux</mat-label>
                        <input matInput type="number" [(ngModel)]="formData.taux" name="taux" min="0" max="5" step="0.25">
                        <mat-hint>Ex: 1.25, 1.5, 2</mat-hint>
                    </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Ordre d'application</mat-label>
                    <input matInput type="number" [(ngModel)]="formData.ordre" name="ordre" min="0">
                    <mat-hint>Ordre croissant pour l'application des paliers</mat-hint>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Annuler</button>
            <button mat-raised-button color="primary" [disabled]="!tierForm.valid" (click)="onSave()">
                {{ data.isEdit ? 'Modifier' : 'Créer' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .tier-form {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 400px;
            padding-top: 8px;
        }

        .full-width {
            width: 100%;
        }

        .form-row {
            display: flex;
            gap: 16px;

            mat-form-field {
                flex: 1;
            }
        }

        mat-dialog-content {
            max-height: 70vh;
        }
    `]
})
export class OvertimeTierFormDialogComponent {
    formData: OvertimeTierCreateRequest;

    constructor(
        public dialogRef: MatDialogRef<OvertimeTierFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: OvertimeTierFormDialogData
    ) {
        if (data.overtimeTier) {
            this.formData = {
                codeSoc: data.overtimeTier.codeSoc,
                codePalier: data.overtimeTier.codePalier,
                desigPalier: data.overtimeTier.desigPalier,
                typePalier: data.overtimeTier.typePalier,
                valeur: data.overtimeTier.valeur,
                ordre: data.overtimeTier.ordre,
                taux: data.overtimeTier.taux
            };
        } else {
            this.formData = {
                codeSoc: data.codeSoc,
                codePalier: '',
                desigPalier: '',
                typePalier: 'HS',
                valeur: 0,
                ordre: 0,
                taux: 1.25
            };
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        this.dialogRef.close(this.formData);
    }
}
