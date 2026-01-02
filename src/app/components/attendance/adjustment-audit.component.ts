import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuditService,
  AuditTrail,
  AuditTrailRequest
} from '../../services/audit.service';

@Component({
  selector: 'app-adjustment-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adjustment-audit.component.html',
})
export class AdjustmentAuditComponent implements OnInit {
  private auditService = inject(AuditService);
  private router = inject(Router);

  auditEntries = signal<AuditTrail[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);

  // Filters
  codeSociete = signal('DEFAULT');
  dateDebut = signal('');
  dateFin = signal('');
  actionType = signal('');
  entityType = signal('');
  userId = signal('');
  matricule = signal('');

  ngOnInit(): void {
    this.loadAuditTrail();
  }

  loadAuditTrail(): void {
    this.loading.set(true);
    this.error.set(null);

    const request: AuditTrailRequest = {
      codeSociete: this.codeSociete(),
      dateDebut: this.dateDebut() || undefined,
      dateFin: this.dateFin() || undefined,
      actionType: this.actionType() || undefined,
      entityType: this.entityType() || undefined,
      userId: this.userId() || undefined,
      matricule: this.matricule() || undefined,
      page: this.currentPage(),
      pageSize: this.pageSize()
    };

    this.auditService.queryAuditTrail(request).subscribe({
      next: (response) => {
        this.auditEntries.set(response.entries);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  viewEmployeeHistory(matricule: string): void {
    this.router.navigate(['/pointage/attendance/adjustment-history'], {
      queryParams: { matricule }
    });
  }

  getActionTypeColor(actionType: string): string {
    if (actionType?.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (actionType?.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (actionType?.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  clearFilters(): void {
    this.dateDebut.set('');
    this.dateFin.set('');
    this.actionType.set('');
    this.entityType.set('');
    this.userId.set('');
    this.matricule.set('');
    this.currentPage.set(1);
    this.loadAuditTrail();
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.totalCount()) {
      this.currentPage.update(p => p + 1);
      this.loadAuditTrail();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadAuditTrail();
    }
  }

  exportToCsv(): void {
    console.log('Export to CSV');
  }
}
