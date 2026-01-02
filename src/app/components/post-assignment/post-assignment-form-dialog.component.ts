import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PostAssignmentDto, PostAssignmentCreateRequest } from '../../services/post-assignment.service';

export interface PostAssignmentFormDialogData {
    codeSoc: string;
    assignment?: PostAssignmentDto;
    isEdit: boolean;
}

@Component({
    selector: 'app-post-assignment-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    template: `
        <h2 mat-dialog-title>{{ data.isEdit ? 'Modifier l\'Affectation' : 'Nouvelle Affectation' }}</h2>
        <mat-dialog-content>
            <form #assignmentForm="ngForm" class="assignment-form">
                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Code Société</mat-label>
                    <input matInput [(ngModel)]="formData.codeSoc" name="codeSoc" required [disabled]="data.isEdit">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Matricule Employé</mat-label>
                    <input matInput [(ngModel)]="formData.matricule" name="matricule" required [disabled]="data.isEdit" maxlength="20">
                    <mat-hint>Matricule de l'employé à affecter</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Code Poste</mat-label>
                    <input matInput [(ngModel)]="formData.codePoste" name="codePoste" required [disabled]="data.isEdit" maxlength="20">
                    <mat-hint>Code du poste de travail</mat-hint>
                </mat-form-field>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Annuler</button>
            <button mat-raised-button color="primary" [disabled]="!assignmentForm.valid" (click)="onSave()">
                {{ data.isEdit ? 'Modifier' : 'Créer' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .assignment-form {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 350px;
            padding-top: 8px;
        }

        .full-width {
            width: 100%;
        }

        mat-dialog-content {
            max-height: 70vh;
        }
    `]
})
export class PostAssignmentFormDialogComponent {
    formData: PostAssignmentCreateRequest;

    constructor(
        public dialogRef: MatDialogRef<PostAssignmentFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PostAssignmentFormDialogData
    ) {
        if (data.assignment) {
            this.formData = {
                codeSoc: data.assignment.codeSoc,
                matricule: data.assignment.matricule,
                codePoste: data.assignment.codePoste
            };
        } else {
            this.formData = {
                codeSoc: data.codeSoc,
                matricule: '',
                codePoste: ''
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
