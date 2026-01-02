import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { UserAccessService, UserAccessDto, UserAccessSearchRequest, UserAccessCreateRequest } from '../../services/user-access.service';
import { UserAccessFormDialogComponent } from './user-access-form-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
    selector: 'app-user-access-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatDialogModule,
        MatSnackBarModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatSelectModule,
        MatCheckboxModule,
        MatChipsModule
    ],
    templateUrl: './user-access-management.component.html',
    styleUrls: ['./user-access-management.component.scss']
})
export class UserAccessManagementComponent implements OnInit {
    private readonly userAccessService = inject(UserAccessService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    users = signal<UserAccessDto[]>([]);
    loading = signal(false);
    totalCount = signal(0);

    // Search filters
    searchCSociete = signal('CST');
    searchCUtilisateur = signal('');
    searchNom = signal('');
    searchCRole = signal('');

    // Pagination
    currentPage = signal(1);
    pageSize = signal(50);

    // Table columns
    displayedColumns: string[] = ['cUtilisateur', 'nom', 'prenom', 'email', 'cRole', 'bAdministrateur', 'actions'];

    // Role options
    roleOptions = ['ADMIN', 'USER', 'MANAGER', 'RH'];

    ngOnInit() {
        this.searchUsers();
    }

    searchUsers() {
        this.loading.set(true);

        const request: UserAccessSearchRequest = {
            cSociete: this.searchCSociete() || undefined,
            cUtilisateur: this.searchCUtilisateur() || undefined,
            nom: this.searchNom() || undefined,
            cRole: this.searchCRole() || undefined,
            page: this.currentPage(),
            pageSize: this.pageSize()
        };

        this.userAccessService.searchUsers(request).subscribe({
            next: (response) => {
                this.users.set(response.data);
                this.totalCount.set(response.totalCount);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error searching users:', error);
                this.snackBar.open('Erreur lors de la recherche des utilisateurs', 'Fermer', { duration: 3000 });
                this.loading.set(false);
            }
        });
    }

    openCreateDialog() {
        const dialogRef = this.dialog.open(UserAccessFormDialogComponent, {
            width: '600px',
            data: {
                cSociete: this.searchCSociete(),
                isEdit: false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createUser(result);
            }
        });
    }

    createUser(request: UserAccessCreateRequest) {
        this.loading.set(true);

        this.userAccessService.createUser(request).subscribe({
            next: (response) => {
                this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                this.searchUsers();
            },
            error: (error) => {
                console.error('Error creating user:', error);
                const errorMessage = error.error?.error || 'Erreur lors de la création de l\'utilisateur';
                this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                this.loading.set(false);
            }
        });
    }

    editUser(user: UserAccessDto) {
        const dialogRef = this.dialog.open(UserAccessFormDialogComponent, {
            width: '600px',
            data: {
                user: user,
                cSociete: user.cSociete,
                isEdit: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading.set(true);

                this.userAccessService.updateUser(user.idUtilisateur, result).subscribe({
                    next: (response) => {
                        this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                        this.searchUsers();
                    },
                    error: (error) => {
                        console.error('Error updating user:', error);
                        const errorMessage = error.error?.error || 'Erreur lors de la modification de l\'utilisateur';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                        this.loading.set(false);
                    }
                });
            }
        });
    }

    deleteUser(user: UserAccessDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Confirmer la suppression',
                message: `Voulez-vous vraiment supprimer l'utilisateur ${user.cUtilisateur} (${user.nom} ${user.prenom})?`,
                confirmText: 'Supprimer',
                cancelText: 'Annuler'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.loading.set(true);

                this.userAccessService.deleteUser(user.idUtilisateur).subscribe({
                    next: (response) => {
                        this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                        this.searchUsers();
                    },
                    error: (error) => {
                        console.error('Error deleting user:', error);
                        const errorMessage = error.error?.error || 'Erreur lors de la suppression de l\'utilisateur';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                        this.loading.set(false);
                    }
                });
            }
        });
    }

    clearSearch() {
        this.searchCUtilisateur.set('');
        this.searchNom.set('');
        this.searchCRole.set('');
        this.searchUsers();
    }

    getFullName(user: UserAccessDto): string {
        return `${user.prenom || ''} ${user.nom || ''}`.trim() || '-';
    }
}
