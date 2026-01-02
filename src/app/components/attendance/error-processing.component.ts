import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ErrorProcessingService,
  AttendanceError,
  ErrorQueryRequest,
  ErrorResolution
} from '../../services/error-processing.service';

@Component({
  selector: 'app-error-processing',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './error-processing.component.html',
})
export class ErrorProcessingComponent implements OnInit {
  private errorService = inject(ErrorProcessingService);
  private route = inject(ActivatedRoute);

  errors = signal<AttendanceError[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);
  Math = Math;

  // Filters
  codeSociete = signal('DEFAULT');
  dateDebut = signal('');
  dateFin = signal('');
  errorType = signal('');
  severity = signal('');
  status = signal('open');
  matricule = signal('');

  // Resolution
  selectedError = signal<AttendanceError | null>(null);
  resolution = signal('');
  resolvedBy = signal('Admin');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['errorType']) {
        this.errorType.set(params['errorType']);
      }
    });
    this.loadErrors();
  }

  loadErrors(): void {
    this.loading.set(true);
    this.error.set(null);

    const request: ErrorQueryRequest = {
      codeSociete: this.codeSociete(),
      dateDebut: this.dateDebut() || undefined,
      dateFin: this.dateFin() || undefined,
      errorType: this.errorType() || undefined,
      severity: this.severity() || undefined,
      status: this.status() || undefined,
      matricule: this.matricule() || undefined,
      page: this.currentPage(),
      pageSize: this.pageSize()
    };

    this.errorService.queryErrors(request).subscribe({
      next: (response) => {
        this.errors.set(response.errors);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement: ' + err.message);
        this.loading.set(false);
      }
    });
  }

  resolveError(): void {
    const selectedErr = this.selectedError();
    if (!selectedErr || !this.resolution()) {
      this.error.set('Veuillez sélectionner une erreur et fournir une résolution');
      return;
    }

    const request: ErrorResolution = {
      errorId: selectedErr.id,
      resolution: this.resolution(),
      resolvedBy: this.resolvedBy()
    };

    this.errorService.resolveError(request).subscribe({
      next: () => {
        this.selectedError.set(null);
        this.resolution.set('');
        this.loadErrors();
      },
      error: (err) => {
        this.error.set('Erreur lors de la résolution: ' + err.message);
      }
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    return status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  }

  clearFilters(): void {
    this.dateDebut.set('');
    this.dateFin.set('');
    this.errorType.set('');
    this.severity.set('');
    this.status.set('open');
    this.matricule.set('');
    this.currentPage.set(1);
    this.loadErrors();
  }

  nextPage(): void {
    if (this.currentPage() * this.pageSize() < this.totalCount()) {
      this.currentPage.update(p => p + 1);
      this.loadErrors();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadErrors();
    }
  }
}
