import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NightShiftHours {
  matricule: string;
  nomPrenom?: string;
  date: string;
  totalNightHours: number;
  nightPremiumHours: number;
  nightPremiumRate: number;
  nightPremiumAmount: number;
  nightPeriods: NightPeriod[];
}

export interface NightPeriod {
  startTime: string;
  endTime: string;
  hours: number;
  isQualifiedForPremium: boolean;
}

export interface NightShiftProcessRequest {
  codeSociete: string;
  dateDebut: string;
  dateFin: string;
  matricule?: string;
  calculatePremiums: boolean;
}

export interface NightShiftReport {
  dateDebut: string;
  dateFin: string;
  totalEmployees: number;
  totalNightHours: number;
  totalPremiumAmount: number;
  employeeDetails: NightShiftHours[];
}

export interface NightShiftAdjustment {
  codeSociete: string;
  matricule: string;
  date: string;
  adjustedNightHours: number;
  reason?: string;
  adjustedBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class NightShiftService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/nightshift`;

  calculateNightHours(request: NightShiftProcessRequest): Observable<NightShiftHours[]> {
    return this.http.post<NightShiftHours[]>(`${this.apiUrl}/calculate`, request);
  }

  generateReport(request: NightShiftProcessRequest): Observable<NightShiftReport> {
    return this.http.post<NightShiftReport>(`${this.apiUrl}/report`, request);
  }

  adjustNightHours(request: NightShiftAdjustment): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/adjust`, request);
  }

  getPremiumRate(codeSociete: string): Observable<{ rate: number }> {
    return this.http.get<{ rate: number }>(`${this.apiUrl}/premium-rate/${codeSociete}`);
  }
}
