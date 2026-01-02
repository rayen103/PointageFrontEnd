import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Post Assignment interfaces matching backend DTOs
export interface PostAssignmentDto {
    codeSoc: string;
    matricule: string;
    codePoste: string;
    nomEmploye?: string;
    desigPoste?: string;
}

export interface PostAssignmentSearchRequest {
    codeSoc?: string;
    matricule?: string;
    codePoste?: string;
    page?: number;
    pageSize?: number;
}

export interface PostAssignmentCreateRequest {
    codeSoc: string;
    matricule: string;
    codePoste: string;
}

export interface BulkPostAssignmentRequest {
    codeSoc: string;
    codePoste: string;
    matricules: string[];
}

@Injectable({
    providedIn: 'root'
})
export class PostAssignmentService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/api/PostAssignment`;

    // Search post assignments with filtering and pagination
    searchAssignments(request: PostAssignmentSearchRequest): Observable<{ data: PostAssignmentDto[]; totalCount: number; page: number; pageSize: number }> {
        return this.http.post<{ data: PostAssignmentDto[]; totalCount: number; page: number; pageSize: number }>(
            `${this.apiUrl}/search`,
            request
        );
    }

    // Get assignments by employee
    getAssignmentsByEmployee(codeSoc: string, matricule: string): Observable<PostAssignmentDto[]> {
        return this.http.get<PostAssignmentDto[]>(`${this.apiUrl}/employee/${codeSoc}/${matricule}`);
    }

    // Get assignments by work post
    getAssignmentsByPost(codeSoc: string, codePoste: string): Observable<PostAssignmentDto[]> {
        return this.http.get<PostAssignmentDto[]>(`${this.apiUrl}/post/${codeSoc}/${codePoste}`);
    }

    // Get a specific assignment
    getAssignment(codeSoc: string, matricule: string, codePoste: string): Observable<PostAssignmentDto> {
        return this.http.get<PostAssignmentDto>(`${this.apiUrl}/${codeSoc}/${matricule}/${codePoste}`);
    }

    // Create a new assignment
    createAssignment(request: PostAssignmentCreateRequest): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(this.apiUrl, request);
    }

    // Delete an assignment
    deleteAssignment(codeSoc: string, matricule: string, codePoste: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${codeSoc}/${matricule}/${codePoste}`);
    }

    // Bulk assign employees to a post
    bulkAssign(request: BulkPostAssignmentRequest): Observable<{ success: boolean; message: string; count: number }> {
        return this.http.post<{ success: boolean; message: string; count: number }>(`${this.apiUrl}/bulk-assign`, request);
    }

    // Remove all employees from a post
    removeAllFromPost(codeSoc: string, codePoste: string): Observable<{ success: boolean; message: string; count: number }> {
        return this.http.delete<{ success: boolean; message: string; count: number }>(`${this.apiUrl}/post/${codeSoc}/${codePoste}/all`);
    }
}
