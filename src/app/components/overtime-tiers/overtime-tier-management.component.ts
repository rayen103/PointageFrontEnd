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
import { OvertimeTierService, OvertimeTierDto, OvertimeTierSearchRequest, OvertimeTierCreateRequest } from '../../services/overtime-tier.service';
import { OvertimeTierFormDialogComponent } from './overtime-tier-form-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
    selector: 'app-overtime-tier-management',
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
    templateUrl: './overtime-tier-management.component.html',
    styleUrls: ['./overtime-tier-management.component.scss']
})
export class OvertimeTierManagementComponent implements OnInit {
    private readonly overtimeTierService = inject(OvertimeTierService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    overtimeTiers = signal<OvertimeTierDto[]>([]);
    loading = signal(false);
    totalCount = signal(0);

    // Search filters
    searchCodeSoc = signal('CST');
    searchCodePalier = signal('');
    searchTypePalier = signal('');

    // Pagination
    currentPage = signal(1);
    pageSize = signal(50);

    // Table columns
    displayedColumns: string[] = ['codePalier', 'desigPalier', 'typePalier', 'valeur', 'taux', 'ordre', 'actions'];

    // Tier types for filter dropdown
    typePalierOptions = ['HS', 'HC', 'HN'];

    ngOnInit() {
        this.searchOvertimeTiers();
    }

    searchOvertimeTiers() {
        this.loading.set(true);

        const request: OvertimeTierSearchRequest = {
            codeSoc: this.searchCodeSoc() || undefined,
            codePalier: this.searchCodePalier() || undefined,
            typePalier: this.searchTypePalier() || undefined,
            page: this.currentPage(),
            pageSize: this.pageSize()
        };

        this.overtimeTierService.searchOvertimeTiers(request).subscribe({
            next: (response) => {
                this.overtimeTiers.set(response.data);
                this.totalCount.set(response.totalCount);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error searching overtime tiers:', error);
                this.snackBar.open('Erreur lors de la recherche des paliers', 'Fermer', { duration: 3000 });
                this.loading.set(false);
            }
        });
    }

    openCreateDialog() {
        const dialogRef = this.dialog.open(OvertimeTierFormDialogComponent, {
            width: '500px',
            data: {
                codeSoc: this.searchCodeSoc(),
                isEdit: false
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createOvertimeTier(result);
            }
        });
    }

    createOvertimeTier(request: OvertimeTierCreateRequest) {
        this.loading.set(true);

        this.overtimeTierService.createOvertimeTier(request).subscribe({
            next: (response) => {
                this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                this.searchOvertimeTiers();
            },
            error: (error) => {
                console.error('Error creating overtime tier:', error);
                const errorMessage = error.error?.error || 'Erreur lors de la création du palier';
                this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                this.loading.set(false);
            }
        });
    }

    editOvertimeTier(tier: OvertimeTierDto) {
        const dialogRef = this.dialog.open(OvertimeTierFormDialogComponent, {
            width: '500px',
            data: {
                overtimeTier: tier,
                codeSoc: tier.codeSoc,
                isEdit: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading.set(true);

                this.overtimeTierService.updateOvertimeTier(tier.codeSoc, tier.codePalier, result).subscribe({
                    next: (response) => {
                        this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                        this.searchOvertimeTiers();
                    },
                    error: (error) => {
                        console.error('Error updating overtime tier:', error);
                        const errorMessage = error.error?.error || 'Erreur lors de la modification du palier';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                        this.loading.set(false);
                    }
                });
            }
        });
    }

    deleteOvertimeTier(tier: OvertimeTierDto) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Confirmer la suppression',
                message: `Voulez-vous vraiment supprimer le palier ${tier.codePalier} - ${tier.desigPalier}?`,
                confirmText: 'Supprimer',
                cancelText: 'Annuler'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.loading.set(true);

                this.overtimeTierService.deleteOvertimeTier(tier.codeSoc, tier.codePalier).subscribe({
                    next: (response) => {
                        this.snackBar.open(response.message, 'Fermer', { duration: 3000 });
                        this.searchOvertimeTiers();
                    },
                    error: (error) => {
                        console.error('Error deleting overtime tier:', error);
                        const errorMessage = error.error?.error || 'Erreur lors de la suppression du palier';
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                        this.loading.set(false);
                    }
                });
            }
        });
    }

    clearSearch() {
        this.searchCodePalier.set('');
        this.searchTypePalier.set('');
        this.searchOvertimeTiers();
    }

    getTypePalierLabel(type: string | undefined): string {
        switch (type) {
            case 'HS': return 'Heures Supp.';
            case 'HC': return 'Heures Comp.';
            case 'HN': return 'Heures Nuit';
            default: return type || '-';
        }
    }

    formatRate(taux: number | undefined): string {
        if (taux === undefined || taux === null) return '-';
        return `${(taux * 100).toFixed(0)}%`;
    }
}
