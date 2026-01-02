import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Work Post interfaces matching backend DTOs
export interface WorkPostDto {
  codeSoc: string;
  codePoste: string;
  desigPoste?: string;
  heureDeb?: string;
  heureFin?: string;
  retardPermis?: number;
  sortiePermis?: number;
  posteNuit: boolean;
  heuresNuit?: number;
  plafondDim?: number;
  ignoreDimanche?: boolean;
  ignoreNuit?: boolean;
  active?: boolean;
  dateCreation?: string;
  dateModification?: string;
}

export interface WorkPostSearchRequest {
  codeSoc?: string;
  codePoste?: string;
  desigPoste?: string;
  posteNuit?: boolean;
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface WorkPostCreateRequest {
  codeSoc: string;
  codePoste: string;
  desigPoste: string;
  heureDeb?: string;
  heureFin?: string;
  retardPermis?: number;
  sortiePermis?: number;
  posteNuit?: boolean;
  heuresNuit?: number;
  plafondDim?: number;
  ignoreDimanche?: boolean;
  ignoreNuit?: boolean;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkPostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/WorkPost`;

  // Search work posts with filtering and pagination
  searchWorkPosts(request: WorkPostSearchRequest): Observable<{ data: WorkPostDto[]; totalCount: number; page: number; pageSize: number }> {
    return this.http.post<{ data: WorkPostDto[]; totalCount: number; page: number; pageSize: number }>(
      `${this.apiUrl}/search`,
      request
    );
  }

  // Get all work posts for a company
  getAllWorkPosts(codeSoc: string): Observable<WorkPostDto[]> {
    return this.http.get<WorkPostDto[]>(`${this.apiUrl}/${codeSoc}`);
  }

  // Get a specific work post by ID
  getWorkPostById(codeSoc: string, codePoste: string): Observable<WorkPostDto> {
    return this.http.get<WorkPostDto>(`${this.apiUrl}/${codeSoc}/${codePoste}`);
  }

  // Create a new work post
  createWorkPost(request: WorkPostCreateRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(this.apiUrl, request);
  }

  // Update an existing work post
  updateWorkPost(codeSoc: string, codePoste: string, request: WorkPostCreateRequest): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${codeSoc}/${codePoste}`, request);
  }

  // Delete a work post
  deleteWorkPost(codeSoc: string, codePoste: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${codeSoc}/${codePoste}`);
  }

  // Check if work post has active employee assignments
  hasActiveAssignments(codeSoc: string, codePoste: string): Observable<{ hasAssignments: boolean }> {
    return this.http.get<{ hasAssignments: boolean }>(`${this.apiUrl}/${codeSoc}/${codePoste}/has-assignments`);
  }
}
