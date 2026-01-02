import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AttendanceError {
  id: number;
  codeSociete: string;
  matricule: string;
  employeeName?: string;
  date: string;
  errorType: string;
  severity: string;
  description: string;
  status: string;
  detectedDate: string;
  resolvedBy?: string;
  resolvedDate?: string;
  resolution?: string;
}

export interface ErrorQueryRequest {
  codeSociete: string;
  dateDebut?: string;
  dateFin?: string;
  errorType?: string;
  severity?: string;
  status?: string;
  matricule?: string;
  page?: number;
  pageSize?: number;
}

export interface ErrorResolution {
  errorId: number;
  resolution: string;
  resolvedBy: string;
}

export interface WeeklyAnomaly {
  weekStart: string;
  weekEnd: string;
  totalErrors: number;
  criticalErrors: number;
  highPriorityErrors: number;
  resolvedErrors: number;
  pendingErrors: number;
  errorsByType: Record<string, number>;
  topErrors: AttendanceError[];
}

export interface ErrorDashboard {
  asOfDate: string;
  totalOpenErrors: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  resolvedToday: number;
  newToday: number;
  errorsByType: Record<string, number>;
  topEmployeesWithErrors: string[];
  weeklySummary: WeeklyAnomaly[];
}

@Injectable({
  providedIn: 'root'
})
export class ErrorProcessingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/errorprocessing`;

  detectErrors(
    codeSociete: string,
    dateDebut: string,
    dateFin: string
  ): Observable<AttendanceError[]> {
    return this.http.post<AttendanceError[]>(
      `${this.apiUrl}/detect`,
      null,
      { params: { codeSociete, dateDebut, dateFin } }
    );
  }

  queryErrors(request: ErrorQueryRequest): Observable<{
    errors: AttendanceError[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    return this.http.post<{
      errors: AttendanceError[];
      totalCount: number;
      page: number;
      pageSize: number;
    }>(`${this.apiUrl}/query`, request);
  }

  resolveError(request: ErrorResolution): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/resolve`, request);
  }

  getWeeklyAnomaly(codeSociete: string, weekStart: string): Observable<WeeklyAnomaly> {
    return this.http.get<WeeklyAnomaly>(
      `${this.apiUrl}/weekly-anomaly/${codeSociete}`,
      { params: { weekStart } }
    );
  }

  getDashboard(codeSociete: string): Observable<ErrorDashboard> {
    return this.http.get<ErrorDashboard>(`${this.apiUrl}/dashboard/${codeSociete}`);
  }
}
