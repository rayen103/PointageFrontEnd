import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuditTrail {
  id: number;
  codeSociete: string;
  actionDate: string;
  actionType: string;
  entityType: string;
  entityId?: string;
  userId: string;
  userName?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
}

export interface AuditTrailRequest {
  codeSociete: string;
  dateDebut?: string;
  dateFin?: string;
  actionType?: string;
  entityType?: string;
  userId?: string;
  matricule?: string;
  page?: number;
  pageSize?: number;
}

export interface AdjustmentTrace {
  adjustmentDate: string;
  matricule: string;
  employeeName?: string;
  workDate: string;
  adjustmentType: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  adjustedBy: string;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/audit`;

  logAuditEntry(entry: AuditTrail): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.apiUrl}/log`, entry);
  }

  queryAuditTrail(request: AuditTrailRequest): Observable<{
    entries: AuditTrail[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    return this.http.post<{
      entries: AuditTrail[];
      totalCount: number;
      page: number;
      pageSize: number;
    }>(`${this.apiUrl}/query`, request);
  }

  getAdjustmentHistory(
    codeSociete: string,
    matricule: string,
    dateDebut?: string,
    dateFin?: string
  ): Observable<AdjustmentTrace[]> {
    const params: any = {};
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;

    return this.http.get<AdjustmentTrace[]>(
      `${this.apiUrl}/adjustments/${codeSociete}/${matricule}`,
      { params }
    );
  }

  getEntityAuditLog(
    codeSociete: string,
    entityType: string,
    entityId: string
  ): Observable<AuditTrail[]> {
    return this.http.get<AuditTrail[]>(
      `${this.apiUrl}/entity/${codeSociete}/${entityType}/${entityId}`
    );
  }
}
