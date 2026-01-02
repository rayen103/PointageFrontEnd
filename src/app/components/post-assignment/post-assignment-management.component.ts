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
import { PostAssignmentService, PostAssignmentDto, PostAssignmentSearchRequest, PostAssignmentCreateRequest } from '../../services/post-assignment.service';
import { PostAssignmentFormDialogComponent } from './post-assignment-form-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
    selector: 'app-post-assignment-management',
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
        MatSelectModule
    ],
    templateUrl: './post-assignment-management.component.html',
    styleUrls: ['./post-assignment-management.component.scss']
})
export class PostAssignmentManagementComponent implements OnInit {
    private readonly postAssignmentService = inject(PostAssignmentService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    assignments = signal<PostAssignmentDto[]>([]);
    loading = signal(false);
    totalCount = signal(0);

    // Search filters
    searchCodeSoc = signal('CST');
    searchMatricule = signal('');
    searchCodePoste = signal('');

    // Pagination
    currentPage = signal(1);
    pageSize = signal(50);

    // Table columns
    displayedColumns: string[] = ['matricule', 'codePoste', 'actions'];

    ngOnInit() {
        this.searchAssignments();
    }

    searchAssignments() {
        this.loading.set(true);

        const request: PostAssignmentSearchRequest = {
            codeSoc: this.searchCodeSoc() || undefined,
            matricule: this.searchMatricule() || undefined,
            codePoste: this.searchCodePoste() || undefined,
            page: this.currentPage(),
            pageSize: this.pageSize()
        };

        this.postAssignmentService.searchAssignments(request).subscribe({
            next: (response) => {
                this.assignments.set(response.data);
                this.totalCount.set(response.totalCount);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error searching assignments:', error);
                this.snackBar.open('Erreur lors de la recherche des affectations', 'Fermer', { duration: 3000 });
                this.loading.set(false);
            }
        });
    }

    openCreateDialog() {
        const dialogRef = this.dialog.open(PostAssignmentFormDialogComponent, {
            width: '500px',
            data: {
                codeSoc: this.searchCodeSoc(),
                isEdit: false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createAssignment(result);
            }
        });
    }

    createAssignment(request: PostAssignmentCreateRequest) {
        this.loading.set(true);

        this.postAssignmentService.createAssignment(request).subscribe({
            next: (response) => {
                this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                this.searchAssignments();
            },
            error: (error) => {
                console.error('Error creating assignment:', error);
                const errorMessage = error.error?.error || 'Erreur lors de la création de l\'affectation';
                this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                this.loading.set(false);
            }
        });
    }

    deleteAssignment(assignment: PostAssignmentDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Confirmer la suppression',
                message: `Voulez-vous vraiment supprimer l'affectation de ${assignment.matricule} au poste ${assignment.codePoste}?`,
                confirmText: 'Supprimer',
                cancelText: 'Annuler'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.loading.set(true);

                this.postAssignmentService.deleteAssignment(
                    assignment.codeSoc,
                    assignment.matricule,
                    assignment.codePoste
                ).subscribe({
                    next: (response) => {
                        this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                        this.searchAssignments();
                    },
                    error: (error) => {
                        console.error('Error deleting assignment:', error);
                        const errorMessage = error.error?.error || 'Erreur lors de la suppression de l\'affectation';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                        this.loading.set(false);
                    }
                });
            }
        });
    }

    clearSearch() {
        this.searchMatricule.set('');
        this.searchCodePoste.set('');
        this.searchAssignments();
    }
}
