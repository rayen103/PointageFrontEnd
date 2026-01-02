import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Overtime Tier interfaces matching backend DTOs
export interface OvertimeTierDto {
    codeSoc: string;
    codePalier: string;
    desigPalier?: string;
    typePalier?: string;
    valeur?: number;
    ordre?: number;
    taux?: number;
}

export interface OvertimeTierSearchRequest {
    codeSoc?: string;
    codePalier?: string;
    typePalier?: string;
    page?: number;
    pageSize?: number;
}

export interface OvertimeTierCreateRequest {
    codeSoc: string;
    codePalier: string;
    desigPalier?: string;
    typePalier?: string;
    valeur?: number;
    ordre?: number;
    taux?: number;
}

@Injectable({
    providedIn: 'root'
})
export class OvertimeTierService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/api/OvertimeTier`;

    // Search overtime tiers with filtering and pagination
    searchOvertimeTiers(request: OvertimeTierSearchRequest): Observable<{ data: OvertimeTierDto[]; totalCount: number; page: number; pageSize: number }> {
        return this.http.post<{ data: OvertimeTierDto[]; totalCount: number; page: number; pageSize: number }>(
            `${this.apiUrl}/search`,
            request
        );
    }

    // Get all overtime tiers for a company
    getAllOvertimeTiers(codeSoc: string): Observable<OvertimeTierDto[]> {
        return this.http.get<OvertimeTierDto[]>(`${this.apiUrl}/${codeSoc}`);
    }

    // Get a specific overtime tier by ID
    getOvertimeTierById(codeSoc: string, codePalier: string): Observable<OvertimeTierDto> {
        return this.http.get<OvertimeTierDto>(`${this.apiUrl}/${codeSoc}/${codePalier}`);
    }

    // Create a new overtime tier
    createOvertimeTier(request: OvertimeTierCreateRequest): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(this.apiUrl, request);
    }

    // Update an existing overtime tier
    updateOvertimeTier(codeSoc: string, codePalier: string, request: OvertimeTierCreateRequest): Observable<{ success: boolean; message: string }> {
        return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${codeSoc}/${codePalier}`, request);
    }

    // Delete an overtime tier
    deleteOvertimeTier(codeSoc: string, codePalier: string): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${codeSoc}/${codePalier}`);
    }
}
