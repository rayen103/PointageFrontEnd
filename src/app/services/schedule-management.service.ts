import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// DTOs matching backend
export interface HoraireDto {
  codeSoc: string;
  codeHoraire: string;
  libelleJour: string;
  debutAmH?: number;
  debutAmMn?: number;
  finAmH?: number;
  finAmMn?: number;
  debutPmH?: number;
  debutPmMn?: number;
  finPmH?: number;
  finPmMn?: number;
}

export interface ShiftDto {
  codeSoc: string;
  codeShift: string;
  designationShift: string;
  nbrHeureMois?: number;
  nbrJourMois?: number;
}

export interface EquipeDto {
  codeSoc: string;
  codeEq: string;
  desigEq: string;
}

export interface PlaningDto {
  codeSoc: string;
  matricule: string;
  dateRepos?: Date;
  codeHoraire?: string;
  codeShift?: string;
  codePoste?: string;
}

export interface EquipeEmpDto {
  codeSoc: string;
  codeEq: string;
  matricule: string;
}

// Search Request DTOs
export interface HoraireSearchRequest {
  codeSoc: string;
  codeHoraire?: string;
  libelleJour?: string;
  page?: number;
  pageSize?: number;
}

export interface HoraireCreateRequest {
  codeSoc: string;
  codeHoraire: string;
  libelleJour: string;
  debutAmH?: number;
  debutAmMn?: number;
  finAmH?: number;
  finAmMn?: number;
  debutPmH?: number;
  debutPmMn?: number;
  finPmH?: number;
  finPmMn?: number;
}

export interface ShiftSearchRequest {
  codeSoc: string;
  codeShift?: string;
  designationShift?: string;
  page?: number;
  pageSize?: number;
}

export interface ShiftCreateRequest {
  codeSoc: string;
  codeShift: string;
  designationShift: string;
  nbrHeureMois?: number;
  nbrJourMois?: number;
}

export interface ShiftAssignRequest {
  codeSoc: string;
  codeShift: string;
  matricule: string;
  dateDebut?: Date;
  dateFin?: Date;
}

export interface PlaningSearchRequest {
  codeSoc: string;
  matricule?: string;
  dateDebut?: Date;
  dateFin?: Date;
  page?: number;
  pageSize?: number;
}

export interface PlaningCreateRequest {
  codeSoc: string;
  matricule: string;
  dateRepos?: Date;
  codeHoraire?: string;
  codeShift?: string;
  codePoste?: string;
}

export interface EquipeSearchRequest {
  codeSoc: string;
  codeEq?: string;
  desigEq?: string;
  page?: number;
  pageSize?: number;
}

export interface EquipeCreateRequest {
  codeSoc: string;
  codeEq: string;
  desigEq: string;
}

export interface TeamMemberRequest {
  codeSoc: string;
  codeEq: string;
  matricule: string;
}

/**
 * Schedule Management Service
 * Handles work schedules, shifts, planning, and teams using Angular 21 signals
 */
@Injectable({
  providedIn: 'root'
})
export class ScheduleManagementService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/ScheduleManagement`;

  // State signals
  private schedules = signal<HoraireDto[]>([]);
  private shifts = signal<ShiftDto[]>([]);
  private teams = signal<EquipeDto[]>([]);
  private plannings = signal<PlaningDto[]>([]);
  private selectedSchedule = signal<HoraireDto | null>(null);
  private selectedShift = signal<ShiftDto | null>(null);
  private selectedTeam = signal<EquipeDto | null>(null);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  readonly schedules$ = this.schedules.asReadonly();
  readonly shifts$ = this.shifts.asReadonly();
  readonly teams$ = this.teams.asReadonly();
  readonly plannings$ = this.plannings.asReadonly();
  readonly selectedSchedule$ = this.selectedSchedule.asReadonly();
  readonly selectedShift$ = this.selectedShift.asReadonly();
  readonly selectedTeam$ = this.selectedTeam.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // Computed signals
  readonly schedulesCount = computed(() => this.schedules().length);
  readonly shiftsCount = computed(() => this.shifts().length);
  readonly teamsCount = computed(() => this.teams().length);
  readonly planningsCount = computed(() => this.plannings().length);
  readonly hasSchedules = computed(() => this.schedules().length > 0);
  readonly hasShifts = computed(() => this.shifts().length > 0);
  readonly hasTeams = computed(() => this.teams().length > 0);

  constructor() {
    effect(() => {
      if (this.error()) {
        console.error('[ScheduleManagement] Error:', this.error());
      }
    });
  }

  // Work Schedule Operations
  searchSchedules(request: HoraireSearchRequest): Observable<HoraireDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<HoraireDto[]>(`${this.baseUrl}/horaires/rechercher`, request).pipe(
      tap(schedules => this.schedules.set(schedules)),
      catchError(error => this.handleError('Failed to search schedules', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getScheduleById(codeSoc: string, codeHoraire: string): Observable<HoraireDto> {
    this.loading.set(true);

    return this.http.get<HoraireDto>(`${this.baseUrl}/horaires/${codeSoc}/${codeHoraire}`).pipe(
      tap(schedule => this.selectedSchedule.set(schedule)),
      catchError(error => this.handleError('Failed to get schedule', error)),
      finalize(() => this.loading.set(false))
    );
  }

  createSchedule(request: HoraireCreateRequest): Observable<HoraireDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<HoraireDto>(`${this.baseUrl}/horaires`, request).pipe(
      tap(schedule => {
        this.schedules.update(schedules => [...schedules, schedule]);
      }),
      catchError(error => this.handleError('Failed to create schedule', error)),
      finalize(() => this.loading.set(false))
    );
  }

  updateSchedule(codeSoc: string, codeHoraire: string, request: HoraireCreateRequest): Observable<HoraireDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<HoraireDto>(`${this.baseUrl}/horaires/${codeSoc}/${codeHoraire}`, request).pipe(
      tap(updated => {
        this.schedules.update(schedules =>
          schedules.map(s => s.codeHoraire === codeHoraire ? updated : s)
        );
      }),
      catchError(error => this.handleError('Failed to update schedule', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteSchedule(codeSoc: string, codeHoraire: string): Observable<void> {
    this.loading.set(true);

    return this.http.delete<void>(`${this.baseUrl}/horaires/${codeSoc}/${codeHoraire}`).pipe(
      tap(() => {
        this.schedules.update(schedules =>
          schedules.filter(s => s.codeHoraire !== codeHoraire)
        );
      }),
      catchError(error => this.handleError('Failed to delete schedule', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // Shift Operations
  searchShifts(request: ShiftSearchRequest): Observable<ShiftDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ShiftDto[]>(`${this.baseUrl}/shifts/rechercher`, request).pipe(
      tap(shifts => this.shifts.set(shifts)),
      catchError(error => this.handleError('Failed to search shifts', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getShiftById(codeSoc: string, codeShift: string): Observable<ShiftDto> {
    this.loading.set(true);

    return this.http.get<ShiftDto>(`${this.baseUrl}/shifts/${codeSoc}/${codeShift}`).pipe(
      tap(shift => this.selectedShift.set(shift)),
      catchError(error => this.handleError('Failed to get shift', error)),
      finalize(() => this.loading.set(false))
    );
  }

  createShift(request: ShiftCreateRequest): Observable<ShiftDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<ShiftDto>(`${this.baseUrl}/shifts`, request).pipe(
      tap(shift => {
        this.shifts.update(shifts => [...shifts, shift]);
      }),
      catchError(error => this.handleError('Failed to create shift', error)),
      finalize(() => this.loading.set(false))
    );
  }

  updateShift(codeSoc: string, codeShift: string, request: ShiftCreateRequest): Observable<ShiftDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<ShiftDto>(`${this.baseUrl}/shifts/${codeSoc}/${codeShift}`, request).pipe(
      tap(updated => {
        this.shifts.update(shifts =>
          shifts.map(s => s.codeShift === codeShift ? updated : s)
        );
      }),
      catchError(error => this.handleError('Failed to update shift', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteShift(codeSoc: string, codeShift: string): Observable<void> {
    this.loading.set(true);

    return this.http.delete<void>(`${this.baseUrl}/shifts/${codeSoc}/${codeShift}`).pipe(
      tap(() => {
        this.shifts.update(shifts =>
          shifts.filter(s => s.codeShift !== codeShift)
        );
      }),
      catchError(error => this.handleError('Failed to delete shift', error)),
      finalize(() => this.loading.set(false))
    );
  }

  assignShiftToEmployee(request: ShiftAssignRequest): Observable<void> {
    this.loading.set(true);

    return this.http.post<void>(`${this.baseUrl}/shifts/assign`, request).pipe(
      catchError(error => this.handleError('Failed to assign shift', error)),
      finalize(() => this.loading.set(false))
    );
  }

  unassignShiftFromEmployee(codeSoc: string, codeShift: string, matricule: string): Observable<void> {
    this.loading.set(true);

    return this.http.delete<void>(`${this.baseUrl}/shifts/${codeSoc}/${codeShift}/${matricule}`).pipe(
      catchError(error => this.handleError('Failed to unassign shift', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // Planning Operations
  searchPlannings(request: PlaningSearchRequest): Observable<PlaningDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<PlaningDto[]>(`${this.baseUrl}/planings/rechercher`, request).pipe(
      tap(plannings => this.plannings.set(plannings)),
      catchError(error => this.handleError('Failed to search plannings', error)),
      finalize(() => this.loading.set(false))
    );
  }

  createPlanning(request: PlaningCreateRequest): Observable<PlaningDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<PlaningDto>(`${this.baseUrl}/planings`, request).pipe(
      tap(planning => {
        this.plannings.update(plannings => [...plannings, planning]);
      }),
      catchError(error => this.handleError('Failed to create planning', error)),
      finalize(() => this.loading.set(false))
    );
  }

  updatePlanning(codeSoc: string, matricule: string, request: PlaningCreateRequest): Observable<PlaningDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<PlaningDto>(`${this.baseUrl}/planings/${codeSoc}/${matricule}`, request).pipe(
      tap(updated => {
        this.plannings.update(plannings =>
          plannings.map(p => p.matricule === matricule ? updated : p)
        );
      }),
      catchError(error => this.handleError('Failed to update planning', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deletePlanning(codeSoc: string, matricule: string, date: Date): Observable<void> {
    this.loading.set(true);
    const dateStr = date.toISOString().split('T')[0];

    return this.http.delete<void>(`${this.baseUrl}/planings/${codeSoc}/${matricule}/${dateStr}`).pipe(
      tap(() => {
        this.plannings.update(plannings =>
          plannings.filter(p => p.matricule !== matricule)
        );
      }),
      catchError(error => this.handleError('Failed to delete planning', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getPlanningByPeriod(codeSoc: string, dateDebut: Date, dateFin: Date): Observable<PlaningDto[]> {
    this.loading.set(true);
    const dateDebutStr = dateDebut.toISOString().split('T')[0];
    const dateFinStr = dateFin.toISOString().split('T')[0];

    return this.http.get<PlaningDto[]>(`${this.baseUrl}/planings/period`, {
      params: { codeSoc, dateDebut: dateDebutStr, dateFin: dateFinStr }
    }).pipe(
      tap(plannings => this.plannings.set(plannings)),
      catchError(error => this.handleError('Failed to get planning by period', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // Team Operations
  searchTeams(request: EquipeSearchRequest): Observable<EquipeDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<EquipeDto[]>(`${this.baseUrl}/equipes/rechercher`, request).pipe(
      tap(teams => this.teams.set(teams)),
      catchError(error => this.handleError('Failed to search teams', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getTeamById(codeSoc: string, codeEq: string): Observable<EquipeDto> {
    this.loading.set(true);

    return this.http.get<EquipeDto>(`${this.baseUrl}/equipes/${codeSoc}/${codeEq}`).pipe(
      tap(team => this.selectedTeam.set(team)),
      catchError(error => this.handleError('Failed to get team', error)),
      finalize(() => this.loading.set(false))
    );
  }

  createTeam(request: EquipeCreateRequest): Observable<EquipeDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<EquipeDto>(`${this.baseUrl}/equipes`, request).pipe(
      tap(team => {
        this.teams.update(teams => [...teams, team]);
      }),
      catchError(error => this.handleError('Failed to create team', error)),
      finalize(() => this.loading.set(false))
    );
  }

  updateTeam(codeSoc: string, codeEq: string, request: EquipeCreateRequest): Observable<EquipeDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<EquipeDto>(`${this.baseUrl}/equipes/${codeSoc}/${codeEq}`, request).pipe(
      tap(updated => {
        this.teams.update(teams =>
          teams.map(t => t.codeEq === codeEq ? updated : t)
        );
      }),
      catchError(error => this.handleError('Failed to update team', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteTeam(codeSoc: string, codeEq: string): Observable<void> {
    this.loading.set(true);

    return this.http.delete<void>(`${this.baseUrl}/equipes/${codeSoc}/${codeEq}`).pipe(
      tap(() => {
        this.teams.update(teams =>
          teams.filter(t => t.codeEq !== codeEq)
        );
      }),
      catchError(error => this.handleError('Failed to delete team', error)),
      finalize(() => this.loading.set(false))
    );
  }

  addTeamMember(request: TeamMemberRequest): Observable<void> {
    this.loading.set(true);

    return this.http.post<void>(`${this.baseUrl}/equipes/${request.codeSoc}/${request.codeEq}/members/${request.matricule}`, {}).pipe(
      catchError(error => this.handleError('Failed to add team member', error)),
      finalize(() => this.loading.set(false))
    );
  }

  removeTeamMember(codeSoc: string, codeEq: string, matricule: string): Observable<void> {
    this.loading.set(true);

    return this.http.delete<void>(`${this.baseUrl}/equipes/${codeSoc}/${codeEq}/members/${matricule}`).pipe(
      catchError(error => this.handleError('Failed to remove team member', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getTeamMembers(codeSoc: string, codeEq: string): Observable<EquipeEmpDto[]> {
    this.loading.set(true);

    return this.http.get<EquipeEmpDto[]>(`${this.baseUrl}/equipes/${codeSoc}/${codeEq}/members`).pipe(
      catchError(error => this.handleError('Failed to get team members', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // Error handling
  private handleError(message: string, error: Error): Observable<never> {
    console.error(message, error);
    this.error.set(`${message}: ${error.message}`);
    return throwError(() => error);
  }
}
