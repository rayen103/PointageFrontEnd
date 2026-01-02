import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ============================================================================
// DTOs - Matching backend exactly
// ============================================================================

export interface PresenceDto {
  codeSoc: string;
  matricule: string;
  mois: number;
  annee: number;
  nbrJPresence: number;
  nbrHPresence: number;
  nbrHs: number;
}

export interface PresenceGridDto {
  codeSoc: string;
  departement?: string;
  service?: string;
  mois: number;
  annee: number;
  employees: EmployeePresenceDto[];
}

export interface EmployeePresenceDto {
  matricule: string;
  nom: string;
  prenom: string;
  days: DayPresenceDto[];
}

export interface DayPresenceDto {
  jour: number;
  statut: string; // P=Present, A=Absent, C=Congé, M=Maladie
  heures?: number;
}

export interface DailyRecordDto {
  codeSoc: string;
  matricule: string;
  date: Date;
  heureEntree?: Date;
  heureSortie?: Date;
  validated: boolean;
  complete: boolean;
}

export interface PresenceSearchRequest {
  codeSoc: string;
  matricule?: string;
  mois?: number;
  annee?: number;
  page?: number;
  pageSize?: number;
}

export interface ProcessingRequest {
  codeSoc: string;
  date?: Date;
  dateDebut?: Date;
  dateFin?: Date;
  month?: number;
  year?: number;
}

export interface ProcessingSummaryDto {
  codeSoc: string;
  date?: Date;
  month?: number;
  year?: number;
  employeesProcessed: number;
  recordsProcessed: number;
  errors: number;
}

// ============================================================================
// Service Implementation
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class AttendanceProcessingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/AttendanceProcessing`;

  // ============================================================================
  // State Management with Signals
  // ============================================================================
  
  private presenceRecords = signal<PresenceDto[]>([]);
  private dailyRecords = signal<DailyRecordDto[]>([]);
  private presenceGrid = signal<PresenceGridDto | null>(null);
  private processingSummary = signal<ProcessingSummaryDto | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  readonly presenceRecords$ = this.presenceRecords.asReadonly();
  readonly dailyRecords$ = this.dailyRecords.asReadonly();
  readonly presenceGrid$ = this.presenceGrid.asReadonly();
  readonly processingSummary$ = this.processingSummary.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // Computed signals
  readonly presenceCount = computed(() => this.presenceRecords().length);
  readonly dailyRecordCount = computed(() => this.dailyRecords().length);
  readonly hasPresence = computed(() => this.presenceRecords().length > 0);
  readonly hasDailyRecords = computed(() => this.dailyRecords().length > 0);
  readonly validatedCount = computed(() => 
    this.dailyRecords().filter(r => r.validated).length
  );
  readonly completeRecordsCount = computed(() => 
    this.dailyRecords().filter(r => r.complete).length
  );

  constructor() {
    effect(() => {
      if (this.error()) {
        console.error('[AttendanceProcessing] Error:', this.error());
      }
    });
  }

  // ============================================================================
  // Presence Operations
  // ============================================================================

  searchPresence(request: PresenceSearchRequest): Observable<PresenceDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<PresenceDto[]>(
      `${this.apiUrl}/presence/rechercher`,
      request
    ).pipe(
      tap(records => this.presenceRecords.set(records)),
      catchError(error => this.handleError('Failed to search presence records', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getPresenceById(codeSoc: string, matricule: string, mois: number, annee: number): Observable<PresenceDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<PresenceDto>(
      `${this.apiUrl}/presence/${codeSoc}/${matricule}/${mois}/${annee}`
    ).pipe(
      catchError(error => this.handleError('Failed to get presence record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getMonthlySummary(codeSoc: string, matricule: string, mois: number, annee: number): Observable<PresenceDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<PresenceDto>(
      `${this.apiUrl}/presence/summary/${codeSoc}/${matricule}/${mois}/${annee}`
    ).pipe(
      catchError(error => this.handleError('Failed to get monthly summary', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Presence Grid Operations
  // ============================================================================

  getPresenceGrid(codeSoc: string, mois: number, annee: number, departement?: string, service?: string): Observable<PresenceGridDto> {
    this.loading.set(true);
    this.error.set(null);

    let url = `${this.apiUrl}/presence/grille/${codeSoc}/${mois}/${annee}`;
    if (departement) url += `?departement=${departement}`;
    if (service) url += `${departement ? '&' : '?'}service=${service}`;

    return this.http.get<PresenceGridDto>(url).pipe(
      tap(grid => this.presenceGrid.set(grid)),
      catchError(error => this.handleError('Failed to get presence grid', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Daily Validation Operations
  // ============================================================================

  getDailyRecords(codeSoc: string, date: Date): Observable<DailyRecordDto[]> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<DailyRecordDto[]>(
      `${this.apiUrl}/validation/jour/${codeSoc}/${dateStr}`
    ).pipe(
      tap(records => this.dailyRecords.set(records)),
      catchError(error => this.handleError('Failed to get daily records', error)),
      finalize(() => this.loading.set(false))
    );
  }

  validateRecord(codeSoc: string, matricule: string, date: Date): Observable<DailyRecordDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.post<DailyRecordDto>(
      `${this.apiUrl}/validation/${codeSoc}/${matricule}/${dateStr}/valider`,
      {}
    ).pipe(
      tap(updated => {
        this.dailyRecords.update(records =>
          records.map(r =>
            r.matricule === matricule && r.date === date ? updated : r
          )
        );
      }),
      catchError(error => this.handleError('Failed to validate record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  invalidateRecord(codeSoc: string, matricule: string, date: Date): Observable<DailyRecordDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.post<DailyRecordDto>(
      `${this.apiUrl}/validation/${codeSoc}/${matricule}/${dateStr}/invalider`,
      {}
    ).pipe(
      tap(updated => {
        this.dailyRecords.update(records =>
          records.map(r =>
            r.matricule === matricule && r.date === date ? updated : r
          )
        );
      }),
      catchError(error => this.handleError('Failed to invalidate record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  isRecordComplete(codeSoc: string, matricule: string, date: Date): Observable<boolean> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<boolean>(
      `${this.apiUrl}/validation/${codeSoc}/${matricule}/${dateStr}/complet`
    ).pipe(
      catchError(error => this.handleError('Failed to check record completeness', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Batch Processing Operations
  // ============================================================================

  processDate(codeSoc: string, date: Date): Observable<ProcessingSummaryDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.post<ProcessingSummaryDto>(
      `${this.apiUrl}/traitement/jour/${codeSoc}/${dateStr}`,
      {}
    ).pipe(
      tap(summary => this.processingSummary.set(summary)),
      catchError(error => this.handleError('Failed to process date', error)),
      finalize(() => this.loading.set(false))
    );
  }

  processPeriod(codeSoc: string, dateDebut: Date, dateFin: Date): Observable<ProcessingSummaryDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateDebutStr = dateDebut.toISOString().split('T')[0];
    const dateFinStr = dateFin.toISOString().split('T')[0];
    return this.http.post<ProcessingSummaryDto>(
      `${this.apiUrl}/traitement/periode/${codeSoc}/${dateDebutStr}/${dateFinStr}`,
      {}
    ).pipe(
      tap(summary => this.processingSummary.set(summary)),
      catchError(error => this.handleError('Failed to process period', error)),
      finalize(() => this.loading.set(false))
    );
  }

  processMonth(codeSoc: string, mois: number, annee: number): Observable<ProcessingSummaryDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ProcessingSummaryDto>(
      `${this.apiUrl}/traitement/mois/${codeSoc}/${mois}/${annee}`,
      {}
    ).pipe(
      tap(summary => this.processingSummary.set(summary)),
      catchError(error => this.handleError('Failed to process month', error)),
      finalize(() => this.loading.set(false))
    );
  }

  validateMonth(codeSoc: string, mois: number, annee: number): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<void>(
      `${this.apiUrl}/traitement/mois/${codeSoc}/${mois}/${annee}/valider`,
      {}
    ).pipe(
      catchError(error => this.handleError('Failed to validate month', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(message: string, error: any): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || message;
    this.error.set(errorMessage);
    console.error(`[AttendanceProcessing] ${message}:`, error);
    return throwError(() => new Error(errorMessage));
  }
}
