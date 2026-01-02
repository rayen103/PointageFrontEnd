import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ============================================================================
// DTOs - Matching backend exactly
// ============================================================================

export interface PresenceReportDto {
  codeSoc: string;
  matricule: string;
  nom: string;
  prenom: string;
  departement: string;
  mois: number;
  annee: number;
  joursPresents: number;
  joursAbsents: number;
  heuresTravaillees: number;
  heuresTheorique: number;
  tauxPresence: number;
}

export interface DepartmentReportDto {
  codeSoc: string;
  departement: string;
  mois: number;
  annee: number;
  totalEmployees: number;
  tauxPresenceMoyen: number;
  heuresTravaillees: number;
  heuresSupplementaires: number;
}

export interface OvertimeReportDto {
  codeSoc: string;
  matricule: string;
  nom: string;
  prenom: string;
  mois: number;
  annee: number;
  hs25: number;
  hs50: number;
  hs75: number;
  hs100: number;
  totalHeures: number;
}

export interface DelayReportDto {
  codeSoc: string;
  matricule: string;
  nom: string;
  prenom: string;
  mois: number;
  annee: number;
  nombreRetards: number;
  totalMinutes: number;
  retardsJustifies: number;
  retardsNonJustifies: number;
}

export interface LeaveReportDto {
  codeSoc: string;
  matricule: string;
  nom: string;
  prenom: string;
  annee: number;
  joursAcquis: number;
  joursPris: number;
  joursSolde: number;
  typeConge: string;
}

export interface DashboardDataDto {
  codeSoc: string;
  date: Date;
  // Today's stats
  employesPresentsAujourdhui: number;
  employesAbsentsAujourdhui: number;
  retardsAujourdhui: number;
  // Monthly stats
  tauxPresenceMois: number;
  heuresSupplementairesMois: number;
  congesEnCours: number;
  // Alerts
  congesEnAttente: number;
  autorisationsEnAttente: number;
  retardsNonJustifies: number;
}

export interface AttendanceForDateDto {
  codeSoc: string;
  date: Date;
  employees: EmployeeAttendanceDto[];
}

export interface EmployeeAttendanceDto {
  matricule: string;
  nom: string;
  prenom: string;
  heureEntree?: Date;
  heureSortie?: Date;
  statut: string;
}

export interface ReportFilterDto {
  codeSoc: string;
  mois?: number;
  annee?: number;
  departement?: string;
  service?: string;
  matricule?: string;
}

// ============================================================================
// Service Implementation
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Reporting`;

  // ============================================================================
  // State Management with Signals
  // ============================================================================
  
  private dashboardData = signal<DashboardDataDto | null>(null);
  private currentReport = signal<any>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  readonly dashboardData$ = this.dashboardData.asReadonly();
  readonly currentReport$ = this.currentReport.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // Computed signals
  readonly hasDashboardData = computed(() => this.dashboardData() !== null);
  readonly hasReport = computed(() => this.currentReport() !== null);
  readonly presenceRate = computed(() => this.dashboardData()?.tauxPresenceMois || 0);
  readonly pendingApprovals = computed(() => {
    const data = this.dashboardData();
    return (data?.congesEnAttente || 0) + (data?.autorisationsEnAttente || 0);
  });

  constructor() {
    effect(() => {
      if (this.error()) {
        console.error('[Reporting] Error:', this.error());
      }
    });
  }

  // ============================================================================
  // Report Operations
  // ============================================================================

  getPresenceReport(filter: ReportFilterDto): Observable<PresenceReportDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<PresenceReportDto[]>(
      `${this.apiUrl}/rapports/presence`,
      filter
    ).pipe(
      tap(report => this.currentReport.set(report)),
      catchError(error => this.handleError('Failed to get presence report', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getDepartmentReport(filter: ReportFilterDto): Observable<DepartmentReportDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<DepartmentReportDto[]>(
      `${this.apiUrl}/rapports/departement`,
      filter
    ).pipe(
      tap(report => this.currentReport.set(report)),
      catchError(error => this.handleError('Failed to get department report', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getOvertimeReport(filter: ReportFilterDto): Observable<OvertimeReportDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<OvertimeReportDto[]>(
      `${this.apiUrl}/rapports/heures-supp`,
      filter
    ).pipe(
      tap(report => this.currentReport.set(report)),
      catchError(error => this.handleError('Failed to get overtime report', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getDelayReport(filter: ReportFilterDto): Observable<DelayReportDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<DelayReportDto[]>(
      `${this.apiUrl}/rapports/retards`,
      filter
    ).pipe(
      tap(report => this.currentReport.set(report)),
      catchError(error => this.handleError('Failed to get delay report', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getLeaveReport(filter: ReportFilterDto): Observable<LeaveReportDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<LeaveReportDto[]>(
      `${this.apiUrl}/rapports/conges`,
      filter
    ).pipe(
      tap(report => this.currentReport.set(report)),
      catchError(error => this.handleError('Failed to get leave report', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Dashboard Operations
  // ============================================================================

  getDashboard(codeSoc: string, date?: Date): Observable<DashboardDataDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date ? date.toISOString().split('T')[0] : '';
    const url = dateStr 
      ? `${this.apiUrl}/tableau-de-bord/${codeSoc}?date=${dateStr}`
      : `${this.apiUrl}/tableau-de-bord/${codeSoc}`;

    return this.http.get<DashboardDataDto>(url).pipe(
      tap(data => this.dashboardData.set(data)),
      catchError(error => this.handleError('Failed to get dashboard data', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Attendance Operations
  // ============================================================================

  getAttendanceForDate(codeSoc: string, date: Date): Observable<AttendanceForDateDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<AttendanceForDateDto>(
      `${this.apiUrl}/presence/jour/${codeSoc}/${dateStr}`
    ).pipe(
      catchError(error => this.handleError('Failed to get attendance for date', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Export Operations
  // ============================================================================

  exportToPDF(reportType: string, filter: ReportFilterDto): Observable<Blob> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post(
      `${this.apiUrl}/export/pdf/${reportType}`,
      filter,
      { responseType: 'blob' }
    ).pipe(
      catchError(error => this.handleError('Failed to export to PDF', error)),
      finalize(() => this.loading.set(false))
    );
  }

  exportToExcel(reportType: string, filter: ReportFilterDto): Observable<Blob> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post(
      `${this.apiUrl}/export/excel/${reportType}`,
      filter,
      { responseType: 'blob' }
    ).pipe(
      catchError(error => this.handleError('Failed to export to Excel', error)),
      finalize(() => this.loading.set(false))
    );
  }

  exportToCSV(reportType: string, filter: ReportFilterDto): Observable<Blob> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post(
      `${this.apiUrl}/export/csv/${reportType}`,
      filter,
      { responseType: 'blob' }
    ).pipe(
      catchError(error => this.handleError('Failed to export to CSV', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(message: string, error: any): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || message;
    this.error.set(errorMessage);
    console.error(`[Reporting] ${message}:`, error);
    return throwError(() => new Error(errorMessage));
  }
}
