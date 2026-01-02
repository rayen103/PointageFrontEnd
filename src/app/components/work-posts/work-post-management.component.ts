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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { WorkPostService, WorkPostDto, WorkPostSearchRequest, WorkPostCreateRequest } from '../../services/work-post.service';
import { WorkPostFormDialogComponent } from './work-post-form-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
    selector: 'app-work-post-management',
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
        MatCheckboxModule,
        MatChipsModule
    ],
    templateUrl: './work-post-management.component.html',
    styleUrls: ['./work-post-management.component.scss']
})
export class WorkPostManagementComponent implements OnInit {
    private readonly workPostService = inject(WorkPostService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    workPosts = signal<WorkPostDto[]>([]);
    loading = signal(false);
    totalCount = signal(0);

    // Search filters
    searchCodeSoc = signal('CST');
    searchCodePoste = signal('');
    searchDesignation = signal('');
    searchPosteNuit = signal<boolean | null>(null);

    // Pagination
    currentPage = signal(1);
    pageSize = signal(50);

    // Table columns
    displayedColumns: string[] = ['codePoste', 'desigPoste', 'retardPermis', 'sortiePermis', 'posteNuit', 'actions'];

    ngOnInit() {
        this.searchWorkPosts();
    }

    searchWorkPosts() {
        this.loading.set(true);

        const request: WorkPostSearchRequest = {
            codeSoc: this.searchCodeSoc() || undefined,
            codePoste: this.searchCodePoste() || undefined,
            desigPoste: this.searchDesignation() || undefined,
            posteNuit: this.searchPosteNuit() ?? undefined,
            page: this.currentPage(),
            pageSize: this.pageSize()
        };

        this.workPostService.searchWorkPosts(request).subscribe({
            next: (response) => {
                this.workPosts.set(response.data);
                this.totalCount.set(response.totalCount);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error searching work posts:', error);
                this.snackBar.open('Erreur lors de la recherche des postes', 'Fermer', { duration: 3000 });
                this.loading.set(false);
            }
        });
    }

    openCreateDialog() {
        const dialogRef = this.dialog.open(WorkPostFormDialogComponent, {
            width: '600px',
            data: {
                codeSoc: this.searchCodeSoc(),
                isEdit: false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createWorkPost(result);
            }
        });
    }

    createWorkPost(request: WorkPostCreateRequest) {
        this.loading.set(true);

        this.workPostService.createWorkPost(request).subscribe({
            next: (response) => {
                this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                this.searchWorkPosts();
            },
            error: (error) => {
                console.error('Error creating work post:', error);
                const errorMessage = error.error?.error || 'Erreur lors de la création du poste';
                this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                this.loading.set(false);
            }
        });
    }

    editWorkPost(post: WorkPostDto) {
        const dialogRef = this.dialog.open(WorkPostFormDialogComponent, {
            width: '600px',
            data: {
                workPost: post,
                codeSoc: post.codeSoc,
                isEdit: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading.set(true);

                this.workPostService.updateWorkPost(post.codeSoc, post.codePoste, result).subscribe({
                    next: (response) => {
                        this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                        this.searchWorkPosts();
                    },
                    error: (error) => {
                        console.error('Error updating work post:', error);
                        const errorMessage = error.error?.error || 'Erreur lors de la modification du poste';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                        this.loading.set(false);
                    }
                });
            }
        });
    }

    deleteWorkPost(post: WorkPostDto) {
        // First check for active assignments
        this.workPostService.hasActiveAssignments(post.codeSoc, post.codePoste).subscribe({
            next: (result) => {
                if (result.hasAssignments) {
                    this.snackBar.open('Impossible de supprimer: des employés sont affectés à ce poste', 'Fermer', { duration: 5000 });
                    return;
                }
                this.confirmDelete(post);
            },
            error: (error) => {
                console.error('Error checking assignments:', error);
                // Proceed with delete confirmation anyway
                this.confirmDelete(post);
            }
        });
    }

    private confirmDelete(post: WorkPostDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Confirmer la suppression',
                message: `Voulez-vous vraiment supprimer le poste ${post.codePoste} - ${post.desigPoste}?`,
                confirmText: 'Supprimer',
                cancelText: 'Annuler'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.loading.set(true);

                this.workPostService.deleteWorkPost(post.codeSoc, post.codePoste).subscribe({
                    next: (response) => {
                        this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                        this.searchWorkPosts();
                    },
                    error: (error) => {
                        console.error('Error deleting work post:', error);
                        const errorMessage = error.error?.error || 'Erreur lors de la suppression du poste';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                        this.loading.set(false);
                    }
                });
            }
        });
    }

    clearSearch() {
        this.searchCodePoste.set('');
        this.searchDesignation.set('');
        this.searchPosteNuit.set(null);
        this.searchWorkPosts();
    }

    toggleNightFilter() {
        const current = this.searchPosteNuit();
        if (current === null) {
            this.searchPosteNuit.set(true);
        } else if (current === true) {
            this.searchPosteNuit.set(false);
        } else {
            this.searchPosteNuit.set(null);
        }
    }
}
