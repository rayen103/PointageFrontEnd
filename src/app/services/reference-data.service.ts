import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// DTOs matching backend
export interface LeaveTypeDto {
  codeConge: string;
  codeSoc: string;
  designConge?: string;
  paye?: number;
  congeAn?: number;
  moisLiq?: number;
  dureeLeg?: number;
  dateCreation?: Date;
  dateModification?: Date;
}

export interface CreateLeaveTypeRequest {
  codeSoc: string;
  codeConge: string;
  designConge: string;
  paye: number;
  congeAn?: number;
  moisLiq?: number;
  dureeLeg?: number;
}

export interface UpdateLeaveTypeRequest {
  designConge?: string;
  paye?: number;
  congeAn?: number;
  moisLiq?: number;
  dureeLeg?: number;
}

export interface AbsenceMotiveDto {
  codeMotif: string;
  codeSoc: string;
  designMotif?: string;
  abrev?: string;
  autorise?: number;
  coef?: number;
  transfPaie?: number;
  couleur?: number;
  rouge?: number;
  vert?: number;
  bleu?: number;
  dateCreation?: Date;
  dateModification?: Date;
}

export interface CreateAbsenceMotiveRequest {
  codeSoc: string;
  codeMotif: string;
  designMotif: string;
  abrev?: string;
  autorise?: number;
  coef?: number;
  transfPaie?: number;
}

export interface UpdateAbsenceMotiveRequest {
  designMotif?: string;
  abrev?: string;
  autorise?: number;
  coef?: number;
  transfPaie?: number;
}

export interface DelayMotiveDto {
  codeMotif: string;
  codeSoc: string;
  designMotif?: string;
  valMin?: number;
  valMax?: number;
  couleur?: number;
  rouge?: number;
  vert?: number;
  bleu?: number;
  dateCreation?: Date;
  dateModification?: Date;
}

export interface CreateDelayMotiveRequest {
  codeSoc: string;
  codeMotif: string;
  designMotif: string;
  valMin?: number;
  valMax?: number;
}

export interface UpdateDelayMotiveRequest {
  designMotif?: string;
  valMin?: number;
  valMax?: number;
}

export interface AuthorizationMotiveDto {
  codeMotif: string;
  codeSoc: string;
  designMotif?: string;
  couleur?: number;
  rouge?: number;
  vert?: number;
  bleu?: number;
  dateCreation?: Date;
  dateModification?: Date;
}

export interface CreateAuthorizationMotiveRequest {
  codeSoc: string;
  codeMotif: string;
  designMotif: string;
}

export interface UpdateAuthorizationMotiveRequest {
  designMotif?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReferenceDataService {
  private apiUrl = `${environment.apiUrl}/api/referencedata`;

  constructor(private http: HttpClient) {}

  // Leave Types
  getAllLeaveTypes(codeSoc: string): Observable<LeaveTypeDto[]> {
    return this.http.get<LeaveTypeDto[]>(`${this.apiUrl}/leave-types/${codeSoc}`);
  }

  getLeaveTypeById(codeSoc: string, codeConge: string): Observable<LeaveTypeDto> {
    return this.http.get<LeaveTypeDto>(`${this.apiUrl}/leave-types/${codeSoc}/${codeConge}`);
  }

  createLeaveType(request: CreateLeaveTypeRequest): Observable<LeaveTypeDto> {
    return this.http.post<LeaveTypeDto>(`${this.apiUrl}/leave-types`, request);
  }

  updateLeaveType(codeSoc: string, codeConge: string, request: UpdateLeaveTypeRequest): Observable<LeaveTypeDto> {
    return this.http.put<LeaveTypeDto>(`${this.apiUrl}/leave-types/${codeSoc}/${codeConge}`, request);
  }

  deleteLeaveType(codeSoc: string, codeConge: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leave-types/${codeSoc}/${codeConge}`);
  }

  // Absence Motives
  getAllAbsenceMotives(codeSoc: string): Observable<AbsenceMotiveDto[]> {
    return this.http.get<AbsenceMotiveDto[]>(`${this.apiUrl}/absence-motives/${codeSoc}`);
  }

  getAbsenceMotiveById(codeSoc: string, codeMotif: string): Observable<AbsenceMotiveDto> {
    return this.http.get<AbsenceMotiveDto>(`${this.apiUrl}/absence-motives/${codeSoc}/${codeMotif}`);
  }

  createAbsenceMotive(request: CreateAbsenceMotiveRequest): Observable<AbsenceMotiveDto> {
    return this.http.post<AbsenceMotiveDto>(`${this.apiUrl}/absence-motives`, request);
  }

  updateAbsenceMotive(codeSoc: string, codeMotif: string, request: UpdateAbsenceMotiveRequest): Observable<AbsenceMotiveDto> {
    return this.http.put<AbsenceMotiveDto>(`${this.apiUrl}/absence-motives/${codeSoc}/${codeMotif}`, request);
  }

  deleteAbsenceMotive(codeSoc: string, codeMotif: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/absence-motives/${codeSoc}/${codeMotif}`);
  }

  // Delay Motives
  getAllDelayMotives(codeSoc: string): Observable<DelayMotiveDto[]> {
    return this.http.get<DelayMotiveDto[]>(`${this.apiUrl}/delay-motives/${codeSoc}`);
  }

  getDelayMotiveById(codeSoc: string, codeMotif: string): Observable<DelayMotiveDto> {
    return this.http.get<DelayMotiveDto>(`${this.apiUrl}/delay-motives/${codeSoc}/${codeMotif}`);
  }

  createDelayMotive(request: CreateDelayMotiveRequest): Observable<DelayMotiveDto> {
    return this.http.post<DelayMotiveDto>(`${this.apiUrl}/delay-motives`, request);
  }

  updateDelayMotive(codeSoc: string, codeMotif: string, request: UpdateDelayMotiveRequest): Observable<DelayMotiveDto> {
    return this.http.put<DelayMotiveDto>(`${this.apiUrl}/delay-motives/${codeSoc}/${codeMotif}`, request);
  }

  deleteDelayMotive(codeSoc: string, codeMotif: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delay-motives/${codeSoc}/${codeMotif}`);
  }

  // Authorization Motives
  getAllAuthorizationMotives(codeSoc: string): Observable<AuthorizationMotiveDto[]> {
    return this.http.get<AuthorizationMotiveDto[]>(`${this.apiUrl}/authorization-motives/${codeSoc}`);
  }

  getAuthorizationMotiveById(codeSoc: string, codeMotif: string): Observable<AuthorizationMotiveDto> {
    return this.http.get<AuthorizationMotiveDto>(`${this.apiUrl}/authorization-motives/${codeSoc}/${codeMotif}`);
  }

  createAuthorizationMotive(request: CreateAuthorizationMotiveRequest): Observable<AuthorizationMotiveDto> {
    return this.http.post<AuthorizationMotiveDto>(`${this.apiUrl}/authorization-motives`, request);
  }

  updateAuthorizationMotive(codeSoc: string, codeMotif: string, request: UpdateAuthorizationMotiveRequest): Observable<AuthorizationMotiveDto> {
    return this.http.put<AuthorizationMotiveDto>(`${this.apiUrl}/authorization-motives/${codeSoc}/${codeMotif}`, request);
  }

  deleteAuthorizationMotive(codeSoc: string, codeMotif: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/authorization-motives/${codeSoc}/${codeMotif}`);
  }
}
