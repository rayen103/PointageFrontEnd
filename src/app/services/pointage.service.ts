import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PointageSearchRequest {
  codeSociete?: string;
  matricule?: string;
  dateDebut?: string;
  dateFin?: string;
  typePointage?: string;
  page?: number;
  pageSize?: number;
}

export interface PointageDto {
  codeSoc: string;
  matricule: string;
  nomPrenom?: string;
  datePnt?: string;
  heurePnt?: string;
  typePnt?: string;
  pointeuse?: string;
  retard?: number;
  flagES?: string;
}

export interface PointageSummaryDto {
  matricule: string;
  nomPrenom?: string;
  date: string;
  heureEntree?: string;
  heureSortie?: string;
  dureeTravail?: number;
  retard?: number;
  isComplete: boolean;
}

export interface PointageCreateRequest {
  codeSoc: string;
  matricule: string;
  datePnt: string;
  heurePnt: string;
  typePnt: string;
  pointeuse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/pointage`;

  rechercher(request: PointageSearchRequest): Observable<{ data: PointageDto[]; totalCount: number; page: number; pageSize: number }> {
    return this.http.post<{ data: PointageDto[]; totalCount: number; page: number; pageSize: number }>(
      `${this.apiUrl}/rechercher`,
      request
    );
  }

  getSummary(codeSociete: string, dateDebut: string, dateFin: string, matricule?: string): Observable<PointageSummaryDto[]> {
    const params: any = { codeSociete, dateDebut, dateFin };
    if (matricule) params.matricule = matricule;
    
    return this.http.get<PointageSummaryDto[]>(`${this.apiUrl}/summary`, { params });
  }

  getById(codeSoc: string, matricule: string, datePnt: string): Observable<PointageDto> {
    return this.http.get<PointageDto>(`${this.apiUrl}/${codeSoc}/${matricule}/${datePnt}`);
  }

  create(request: PointageCreateRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}`, request);
  }

  delete(codeSoc: string, matricule: string, datePnt: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${codeSoc}/${matricule}/${datePnt}`);
  }
}

