import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserAccessDto, UserAccessCreateRequest } from '../../services/user-access.service';

export interface UserAccessFormDialogData {
    cSociete: string;
    user?: UserAccessDto;
    isEdit: boolean;
}

@Component({
    selector: 'app-user-access-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule
    ],
    template: `
        <h2 mat-dialog-title>{{ data.isEdit ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur' }}</h2>
        <mat-dialog-content>
            <form #userForm="ngForm" class="user-form">
                <div class="form-row">
                    <mat-form-field appearance="outline">
                        <mat-label>Code Société</mat-label>
                        <input matInput [(ngModel)]="formData.cSociete" name="cSociete" required [disabled]="data.isEdit">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Code Utilisateur</mat-label>
                        <input matInput [(ngModel)]="formData.cUtilisateur" name="cUtilisateur" required [disabled]="data.isEdit" maxlength="50">
                    </mat-form-field>
                </div>

                <div class="form-row">
                    <mat-form-field appearance="outline">
                        <mat-label>Nom</mat-label>
                        <input matInput [(ngModel)]="formData.nom" name="nom" maxlength="100">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Prénom</mat-label>
                        <input matInput [(ngModel)]="formData.prenom" name="prenom" maxlength="100">
                    </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [(ngModel)]="formData.email" name="email" maxlength="150">
                </mat-form-field>

                <div class="form-row">
                    <mat-form-field appearance="outline">
                        <mat-label>Fonction</mat-label>
                        <input matInput [(ngModel)]="formData.fonction" name="fonction" maxlength="100">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Rôle</mat-label>
                        <mat-select [(ngModel)]="formData.cRole" name="cRole">
                            <mat-option value="">Non défini</mat-option>
                            <mat-option value="ADMIN">Administrateur</mat-option>
                            <mat-option value="MANAGER">Manager</mat-option>
                            <mat-option value="RH">Ressources Humaines</mat-option>
                            <mat-option value="USER">Utilisateur</mat-option>
                        </mat-select>
                    </mat-form-field>
                </div>

                <div class="form-row">
                    <mat-form-field appearance="outline">
                        <mat-label>GSM</mat-label>
                        <input matInput [(ngModel)]="formData.gsm" name="gsm" maxlength="20">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Téléphone</mat-label>
                        <input matInput [(ngModel)]="formData.numeroTelephone" name="numeroTelephone" maxlength="20">
                    </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Adresse</mat-label>
                    <textarea matInput [(ngModel)]="formData.adresse" name="adresse" rows="2"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ data.isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe' }}</mat-label>
                    <input matInput type="password" [(ngModel)]="formData.motDePasse" name="motDePasse" [required]="!data.isEdit">
                </mat-form-field>

                <div class="checkbox-row">
                    <mat-checkbox [(ngModel)]="formData.bAdministrateur" name="bAdministrateur">
                        Administrateur
                    </mat-checkbox>
                </div>
            </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Annuler</button>
            <button mat-raised-button color="primary" [disabled]="!userForm.valid" (click)="onSave()">
                {{ data.isEdit ? 'Modifier' : 'Créer' }}
            </button>
        </mat-dialog-actions>
    `,
    styles: [`
        .user-form {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-width: 500px;
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

        .checkbox-row {
            padding: 8px 0;
        }

        mat-dialog-content {
            max-height: 70vh;
        }
    `]
})
export class UserAccessFormDialogComponent {
    formData: UserAccessCreateRequest;

    constructor(
        public dialogRef: MatDialogRef<UserAccessFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: UserAccessFormDialogData
    ) {
        if (data.user) {
            this.formData = {
                cSociete: data.user.cSociete || data.cSociete,
                cUtilisateur: data.user.cUtilisateur || '',
                nom: data.user.nom,
                prenom: data.user.prenom,
                email: data.user.email,
                fonction: data.user.fonction,
                gsm: data.user.gsm,
                numeroTelephone: data.user.numeroTelephone,
                adresse: data.user.adresse,
                bAdministrateur: data.user.bAdministrateur,
                cRole: data.user.cRole,
                cGroupe: data.user.cGroupe,
                motDePasse: undefined
            };
        } else {
            this.formData = {
                cSociete: data.cSociete,
                cUtilisateur: '',
                nom: '',
                prenom: '',
                email: '',
                fonction: '',
                gsm: '',
                numeroTelephone: '',
                adresse: '',
                bAdministrateur: false,
                cRole: 'USER',
                cGroupe: '',
                motDePasse: ''
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
