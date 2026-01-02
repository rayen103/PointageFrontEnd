import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ============================================================================
// DTOs - Matching backend exactly
// ============================================================================

export interface HeuresSupplementairesDto {
  codeSoc: string;
  matricule: string;
  dateHeureSupp: Date;
  hs1_25: number;
  hs1_5: number;
  hs1_75: number;
  hs2_00: number;
}

export interface RetardDto {
  codeSoc: string;
  matricule: string;
  dateRetard: Date;
  retardReel: number;
  retardMn: number;
  motifRetard?: string;
}

export interface HeuresSupplementairesSearchRequest {
  codeSoc: string;
  matricule?: string;
  dateDebut?: Date;
  dateFin?: Date;
  page?: number;
  pageSize?: number;
}

export interface HeuresSupplementairesCreateRequest {
  codeSoc: string;
  matricule: string;
  dateHeureSupp: Date;
  heuresSupp25: number;
  heuresSupp50: number;
  heuresSupp75: number;
  heuresSupp100: number;
}

export interface RetardSearchRequest {
  codeSoc: string;
  matricule?: string;
  dateDebut?: Date;
  dateFin?: Date;
  page?: number;
  pageSize?: number;
}

export interface RetardCreateRequest {
  codeSoc: string;
  matricule: string;
  dateRetard: Date;
  retardMinutes: number;
  motif?: string;
}

export interface RetardJustifyRequest {
  codeSoc: string;
  matricule: string;
  dateRetard: Date;
  motif: string;
}

export interface MonthlySummaryDto {
  codeSoc: string;
  matricule: string;
  mois: number;
  annee: number;
  totalHeuresSupp25?: number;
  totalHeuresSupp50?: number;
  totalHeuresSupp75?: number;
  totalHeuresSupp100?: number;
  totalRetards?: number;
  totalRetardMinutes?: number;
  retardsJustifies?: number;
  retardsNonJustifies?: number;
}

// ============================================================================
// Service Implementation
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class OvertimeDelayService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/OvertimeDelay`;

  // ============================================================================
  // State Management with Signals
  // ============================================================================
  
  private overtimeRecords = signal<HeuresSupplementairesDto[]>([]);
  private delayRecords = signal<RetardDto[]>([]);
  private monthlySummary = signal<MonthlySummaryDto | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  readonly overtimeRecords$ = this.overtimeRecords.asReadonly();
  readonly delayRecords$ = this.delayRecords.asReadonly();
  readonly monthlySummary$ = this.monthlySummary.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // Computed signals
  readonly overtimeCount = computed(() => this.overtimeRecords().length);
  readonly delayCount = computed(() => this.delayRecords().length);
  readonly hasOvertime = computed(() => this.overtimeRecords().length > 0);
  readonly hasDelays = computed(() => this.delayRecords().length > 0);
  readonly totalOvertimeHours = computed(() => {
    const records = this.overtimeRecords();
    return records.reduce((sum, r) => sum + r.hs1_25 + r.hs1_5 + r.hs1_75 + r.hs2_00, 0);
  });
  readonly totalDelayMinutes = computed(() => {
    const records = this.delayRecords();
    return records.reduce((sum, r) => sum + r.retardMn, 0);
  });

  constructor() {
    effect(() => {
      if (this.error()) {
        console.error('[OvertimeDelay] Error:', this.error());
      }
    });
  }

  // ============================================================================
  // Overtime Operations
  // ============================================================================

  searchOvertime(request: HeuresSupplementairesSearchRequest): Observable<HeuresSupplementairesDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<HeuresSupplementairesDto[]>(
      `${this.apiUrl}/heures-supp/rechercher`,
      request
    ).pipe(
      tap(records => this.overtimeRecords.set(records)),
      catchError(error => this.handleError('Failed to search overtime records', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getOvertimeById(codeSoc: string, matricule: string, date: Date): Observable<HeuresSupplementairesDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<HeuresSupplementairesDto>(
      `${this.apiUrl}/heures-supp/${codeSoc}/${matricule}/${dateStr}`
    ).pipe(
      catchError(error => this.handleError('Failed to get overtime record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  createOvertime(request: HeuresSupplementairesCreateRequest): Observable<HeuresSupplementairesDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<HeuresSupplementairesDto>(
      `${this.apiUrl}/heures-supp`,
      request
    ).pipe(
      tap(record => {
        this.overtimeRecords.update(records => [...records, record]);
      }),
      catchError(error => this.handleError('Failed to create overtime record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  updateOvertime(
    codeSoc: string,
    matricule: string,
    date: Date,
    request: Partial<HeuresSupplementairesCreateRequest>
  ): Observable<HeuresSupplementairesDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.put<HeuresSupplementairesDto>(
      `${this.apiUrl}/heures-supp/${codeSoc}/${matricule}/${dateStr}`,
      request
    ).pipe(
      tap(updated => {
        this.overtimeRecords.update(records =>
          records.map(r =>
            r.matricule === matricule && r.dateHeureSupp === date ? updated : r
          )
        );
      }),
      catchError(error => this.handleError('Failed to update overtime record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteOvertime(codeSoc: string, matricule: string, date: Date): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.delete<void>(
      `${this.apiUrl}/heures-supp/${codeSoc}/${matricule}/${dateStr}`
    ).pipe(
      tap(() => {
        this.overtimeRecords.update(records =>
          records.filter(r => !(r.matricule === matricule && r.dateHeureSupp === date))
        );
      }),
      catchError(error => this.handleError('Failed to delete overtime record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getOvertimeSummary(codeSoc: string, matricule: string, month: number, year: number): Observable<MonthlySummaryDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<MonthlySummaryDto>(
      `${this.apiUrl}/heures-supp/summary/${codeSoc}/${matricule}/${month}/${year}`
    ).pipe(
      tap(summary => this.monthlySummary.set(summary)),
      catchError(error => this.handleError('Failed to get overtime summary', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Delay Operations
  // ============================================================================

  searchDelays(request: RetardSearchRequest): Observable<RetardDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<RetardDto[]>(
      `${this.apiUrl}/retards/rechercher`,
      request
    ).pipe(
      tap(records => this.delayRecords.set(records)),
      catchError(error => this.handleError('Failed to search delay records', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getDelayById(codeSoc: string, matricule: string, date: Date): Observable<RetardDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<RetardDto>(
      `${this.apiUrl}/retards/${codeSoc}/${matricule}/${dateStr}`
    ).pipe(
      catchError(error => this.handleError('Failed to get delay record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  createDelay(request: RetardCreateRequest): Observable<RetardDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<RetardDto>(
      `${this.apiUrl}/retards`,
      request
    ).pipe(
      tap(record => {
        this.delayRecords.update(records => [...records, record]);
      }),
      catchError(error => this.handleError('Failed to create delay record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  updateDelay(
    codeSoc: string,
    matricule: string,
    date: Date,
    request: Partial<RetardCreateRequest>
  ): Observable<RetardDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.put<RetardDto>(
      `${this.apiUrl}/retards/${codeSoc}/${matricule}/${dateStr}`,
      request
    ).pipe(
      tap(updated => {
        this.delayRecords.update(records =>
          records.map(r =>
            r.matricule === matricule && r.dateRetard === date ? updated : r
          )
        );
      }),
      catchError(error => this.handleError('Failed to update delay record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteDelay(codeSoc: string, matricule: string, date: Date): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = date.toISOString().split('T')[0];
    return this.http.delete<void>(
      `${this.apiUrl}/retards/${codeSoc}/${matricule}/${dateStr}`
    ).pipe(
      tap(() => {
        this.delayRecords.update(records =>
          records.filter(r => !(r.matricule === matricule && r.dateRetard === date))
        );
      }),
      catchError(error => this.handleError('Failed to delete delay record', error)),
      finalize(() => this.loading.set(false))
    );
  }

  justifyDelay(request: RetardJustifyRequest): Observable<RetardDto> {
    this.loading.set(true);
    this.error.set(null);

    const dateStr = request.dateRetard.toISOString().split('T')[0];
    return this.http.post<RetardDto>(
      `${this.apiUrl}/retards/${request.codeSoc}/${request.matricule}/${dateStr}/justifier`,
      { motif: request.motif }
    ).pipe(
      tap(updated => {
        this.delayRecords.update(records =>
          records.map(r =>
            r.matricule === request.matricule && r.dateRetard === request.dateRetard ? updated : r
          )
        );
      }),
      catchError(error => this.handleError('Failed to justify delay', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getDelaySummary(codeSoc: string, matricule: string, month: number, year: number): Observable<MonthlySummaryDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<MonthlySummaryDto>(
      `${this.apiUrl}/retards/summary/${codeSoc}/${matricule}/${month}/${year}`
    ).pipe(
      tap(summary => this.monthlySummary.set(summary)),
      catchError(error => this.handleError('Failed to get delay summary', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(message: string, error: any): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || message;
    this.error.set(errorMessage);
    console.error(`[OvertimeDelay] ${message}:`, error);
    return throwError(() => new Error(errorMessage));
  }
}
