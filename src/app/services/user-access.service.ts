import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// User Access interfaces matching backend DTOs
export interface UserAccessDto {
    idUtilisateur: number;
    cSociete?: string;
    cUtilisateur?: string;
    nom?: string;
    prenom?: string;
    email?: string;
    fonction?: string;
    gsm?: string;
    numeroTelephone?: string;
    adresse?: string;
    bAdministrateur?: boolean;
    cGroupe?: string;
    cRole?: string;
    dateInsertion?: string;
    dateModification?: string;
}

export interface UserAccessSearchRequest {
    cSociete?: string;
    cUtilisateur?: string;
    nom?: string;
    cRole?: string;
    bAdministrateur?: boolean;
    page?: number;
    pageSize?: number;
}

export interface UserAccessCreateRequest {
    cSociete: string;
    cUtilisateur: string;
    nom?: string;
    prenom?: string;
    email?: string;
    fonction?: string;
    gsm?: string;
    numeroTelephone?: string;
    adresse?: string;
    bAdministrateur?: boolean;
    cGroupe?: string;
    cRole?: string;
    motDePasse?: string;
}

export interface ChangePasswordRequest {
    idUtilisateur: number;
    ancienMotDePasse?: string;
    nouveauMotDePasse: string;
}

export interface LoginRequest {
    cUtilisateur: string;
    motDePasse: string;
    cSociete?: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    user?: UserAccessDto;
}

@Injectable({
    providedIn: 'root'
})
export class UserAccessService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/api/UserAccess`;

    // Search users with filtering and pagination
    searchUsers(request: UserAccessSearchRequest): Observable<{ data: UserAccessDto[]; totalCount: number; page: number; pageSize: number }> {
        return this.http.post<{ data: UserAccessDto[]; totalCount: number; page: number; pageSize: number }>(
            `${this.apiUrl}/search`,
            request
        );
    }

    // Get all users for a company
    getAllUsers(cSociete: string): Observable<UserAccessDto[]> {
        return this.http.get<UserAccessDto[]>(`${this.apiUrl}/company/${cSociete}`);
    }

    // Get user by ID
    getUserById(idUtilisateur: number): Observable<UserAccessDto> {
        return this.http.get<UserAccessDto>(`${this.apiUrl}/${idUtilisateur}`);
    }

    // Get user by code
    getUserByCode(cSociete: string, cUtilisateur: string): Observable<UserAccessDto> {
        return this.http.get<UserAccessDto>(`${this.apiUrl}/${cSociete}/${cUtilisateur}`);
    }

    // Create a new user
    createUser(request: UserAccessCreateRequest): Observable<{ success: boolean; message: string; idUtilisateur: number }> {
        return this.http.post<{ success: boolean; message: string; idUtilisateur: number }>(this.apiUrl, request);
    }

    // Update an existing user
    updateUser(idUtilisateur: number, request: UserAccessCreateRequest): Observable<{ success: boolean; message: string }> {
        return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/${idUtilisateur}`, request);
    }

    // Delete a user
    deleteUser(idUtilisateur: number): Observable<{ success: boolean; message: string }> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${idUtilisateur}`);
    }

    // Change password
    changePassword(request: ChangePasswordRequest): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/change-password`, request);
    }

    // Reset password (admin)
    resetPassword(idUtilisateur: number, newPassword: string): Observable<{ success: boolean; message: string }> {
        return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${idUtilisateur}/reset-password`, newPassword);
    }

    // Login
    login(request: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request);
    }
}
