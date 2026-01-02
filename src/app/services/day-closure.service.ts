import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DayClosure {
  codeSociete: string;
  date: string;
  isClosed: boolean;
  closedDate?: string;
  closedBy?: string;
  comments?: string;
  totalEmployees: number;
  processedEmployees: number;
  pendingEmployees: number;
  validationErrors: string[];
}

export interface DayClosureRequest {
  codeSociete: string;
  date: string;
  closedBy: string;
  comments?: string;
}

export interface DayReopenRequest {
  codeSociete: string;
  date: string;
  reopenedBy: string;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class DayClosureService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/dayclosure`;

  closeDay(request: DayClosureRequest): Observable<DayClosure> {
    return this.http.post<DayClosure>(`${this.apiUrl}/close`, request);
  }

  reopenDay(request: DayReopenRequest): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/reopen`, request);
  }

  getStatus(codeSociete: string, date: string): Observable<DayClosure> {
    return this.http.get<DayClosure>(`${this.apiUrl}/status/${codeSociete}/${date}`);
  }

  validateClosure(codeSociete: string, date: string): Observable<DayClosure> {
    return this.http.post<DayClosure>(`${this.apiUrl}/validate`, null, {
      params: { codeSociete, date }
    });
  }
}
