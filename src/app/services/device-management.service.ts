import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ============================================================================
// DTOs - Matching backend exactly
// ============================================================================

export interface DeviceDto {
  ip: string; // Primary key
  codeSoc: string;
  terminal: string;
  service?: string;
  id?: number;
}

export interface DeviceCreateRequest {
  ip: string;
  codeSoc: string;
  terminal: string;
  service?: string;
}

export interface DeviceStatisticsDto {
  ip: string;
  totalEmployees: number;
  totalRecordsToday: number;
  totalRecordsMonth: number;
  lastSyncTime?: Date;
  status: string;
}

export interface SyncStatusDto {
  ip: string;
  isRunning: boolean;
  progress: number;
  recordsSynced: number;
  errors: number;
  startTime?: Date;
  estimatedCompletion?: Date;
}

export interface EmployeeEnrollmentDto {
  ip: string;
  matricule: string;
  codeSoc: string;
  enrolled: boolean;
  enrollmentDate?: Date;
}

// ============================================================================
// Service Implementation
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class DeviceManagementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/DeviceManagement`;

  // ============================================================================
  // State Management with Signals
  // ============================================================================

  private devices = signal<DeviceDto[]>([]);
  private selectedDevice = signal<DeviceDto | null>(null);
  private syncStatus = signal<SyncStatusDto | null>(null);
  private deviceStatistics = signal<DeviceStatisticsDto | null>(null);
  private enrolledEmployees = signal<EmployeeEnrollmentDto[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Public readonly signals
  readonly devices$ = this.devices.asReadonly();
  readonly selectedDevice$ = this.selectedDevice.asReadonly();
  readonly syncStatus$ = this.syncStatus.asReadonly();
  readonly deviceStatistics$ = this.deviceStatistics.asReadonly();
  readonly enrolledEmployees$ = this.enrolledEmployees.asReadonly();
  readonly loading$ = this.loading.asReadonly();
  readonly error$ = this.error.asReadonly();

  // Computed signals
  readonly deviceCount = computed(() => this.devices().length);
  readonly hasDevices = computed(() => this.devices().length > 0);
  readonly activeDevices = computed(() =>
    this.devices().filter(d => d.id && d.id > 0)
  );
  readonly isSyncing = computed(() => this.syncStatus()?.isRunning || false);
  readonly enrolledCount = computed(() =>
    this.enrolledEmployees().filter(e => e.enrolled).length
  );

  constructor() {
    effect(() => {
      if (this.error()) {
        console.error('[DeviceManagement] Error:', this.error());
      }
    });
  }

  // ============================================================================
  // Device CRUD Operations
  // ============================================================================

  getAllDevices(codeSoc: string): Observable<DeviceDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<{ data: DeviceDto[] }>(
      `${this.apiUrl}/pointeuses/rechercher`,
      { codeSoc }
    ).pipe(
      map(response => response.data || []),
      tap(devices => this.devices.set(devices)),
      catchError(error => this.handleError('Failed to get devices', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getDevice(codeSoc: string, codePointeuse: string): Observable<DeviceDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DeviceDto>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}`
    ).pipe(
      tap(device => this.selectedDevice.set(device)),
      catchError(error => this.handleError('Failed to get device', error)),
      finalize(() => this.loading.set(false))
    );
  }

  createDevice(request: DeviceCreateRequest): Observable<DeviceDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<DeviceDto>(
      `${this.apiUrl}/pointeuses`,
      request
    ).pipe(
      tap(device => {
        this.devices.update(devices => [...devices, device]);
      }),
      catchError(error => this.handleError('Failed to create device', error)),
      finalize(() => this.loading.set(false))
    );
  }

  updateDevice(codeSoc: string, codePointeuse: string, request: Partial<DeviceCreateRequest>): Observable<DeviceDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.put<DeviceDto>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}`,
      request
    ).pipe(
      tap(updated => {
        this.devices.update(devices =>
          devices.map(d => d.ip === codePointeuse ? updated : d)
        );
        if (this.selectedDevice()?.ip === codePointeuse) {
          this.selectedDevice.set(updated);
        }
      }),
      catchError(error => this.handleError('Failed to update device', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deleteDevice(codeSoc: string, codePointeuse: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}`
    ).pipe(
      tap(() => {
        this.devices.update(devices => devices.filter(d => d.ip !== codePointeuse));
        if (this.selectedDevice()?.ip === codePointeuse) {
          this.selectedDevice.set(null);
        }
      }),
      catchError(error => this.handleError('Failed to delete device', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Device Operations
  // ============================================================================

  activateDevice(codeSoc: string, codePointeuse: string): Observable<DeviceDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<DeviceDto>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}/activate`,
      {}
    ).pipe(
      tap(updated => {
        this.devices.update(devices =>
          devices.map(d => d.ip === codePointeuse ? updated : d)
        );
      }),
      catchError(error => this.handleError('Failed to activate device', error)),
      finalize(() => this.loading.set(false))
    );
  }

  deactivateDevice(codeSoc: string, codePointeuse: string): Observable<DeviceDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<DeviceDto>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}/deactivate`,
      {}
    ).pipe(
      tap(updated => {
        this.devices.update(devices =>
          devices.map(d => d.ip === codePointeuse ? updated : d)
        );
      }),
      catchError(error => this.handleError('Failed to deactivate device', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Connectivity Operations
  // ============================================================================



  getDeviceStatistics(codeSoc: string, codePointeuse: string): Observable<DeviceStatisticsDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<DeviceStatisticsDto>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}/statistiques`
    ).pipe(
      tap(stats => this.deviceStatistics.set(stats)),
      catchError(error => this.handleError('Failed to get device statistics', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Sync Operations
  // ============================================================================

  syncDevice(codeSoc: string, codePointeuse: string): Observable<SyncStatusDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<SyncStatusDto>(
      `${this.apiUrl}/sync`,
      { codeSoc, codePointeuse }
    ).pipe(
      tap(status => this.syncStatus.set(status)),
      catchError(error => this.handleError('Failed to start sync', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getSyncStatus(codeSoc: string, codePointeuse: string): Observable<SyncStatusDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<SyncStatusDto>(
      `${this.apiUrl}/sync/last-sync/${codeSoc}/${codePointeuse}`
    ).pipe(
      tap(status => this.syncStatus.set(status)),
      catchError(error => this.handleError('Failed to get sync status', error)),
      finalize(() => this.loading.set(false))
    );
  }

  cancelSync(codeSoc: string, codePointeuse: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    // Note: Backend doesn't have a cancel sync endpoint, so this is a placeholder
    return this.http.post<void>(
      `${this.apiUrl}/sync/cancel`,
      { codeSoc, codePointeuse }
    ).pipe(
      tap(() => this.syncStatus.set(null)),
      catchError(error => this.handleError('Failed to cancel sync', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Employee Enrollment Operations
  // ============================================================================

  enrollEmployee(codeSoc: string, codePointeuse: string, matricule: string): Observable<EmployeeEnrollmentDto> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<EmployeeEnrollmentDto>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}/employees/${matricule}/register`,
      {}
    ).pipe(
      tap(enrollment => {
        this.enrolledEmployees.update(enrollments => [...enrollments, enrollment]);
      }),
      catchError(error => this.handleError('Failed to enroll employee', error)),
      finalize(() => this.loading.set(false))
    );
  }

  getEnrolledEmployees(codeSoc: string, codePointeuse: string): Observable<EmployeeEnrollmentDto[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<EmployeeEnrollmentDto[]>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}/employees`
    ).pipe(
      tap(enrollments => this.enrolledEmployees.set(enrollments)),
      catchError(error => this.handleError('Failed to get enrolled employees', error)),
      finalize(() => this.loading.set(false))
    );
  }

  removeEmployee(codeSoc: string, codePointeuse: string, matricule: string): Observable<void> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.delete<void>(
      `${this.apiUrl}/pointeuses/${codeSoc}/${codePointeuse}/employees/${matricule}`
    ).pipe(
      tap(() => {
        this.enrolledEmployees.update(enrollments =>
          enrollments.filter(e => e.matricule !== matricule)
        );
      }),
      catchError(error => this.handleError('Failed to remove employee', error)),
      finalize(() => this.loading.set(false))
    );
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(message: string, error: any): Observable<never> {
    const errorMessage = error?.error?.message || error?.message || message;
    this.error.set(errorMessage);
    console.error(`[DeviceManagement] ${message}:`, error);
    return throwError(() => new Error(errorMessage));
  }

  // ============================================================================
  // Additional methods for new components (mock implementations)
  // ============================================================================

  getTerminals(): Observable<any[]> {
    // Mock implementation - returns sample terminals
    const mockTerminals = [
      { id: 1, numeroTerminal: 1001, adresseIp: '192.168.1.100', port: 4370, nomService: 'RH - Bureau Principal', localisation: 'Bâtiment A', typeAppareil: 'ZKTeco', modele: 'ZK-F18' },
      { id: 2, numeroTerminal: 1002, adresseIp: '192.168.1.101', port: 4370, nomService: 'Production - Atelier', localisation: 'Bâtiment B', typeAppareil: 'ZKTeco', modele: 'ZK-F18' }
    ];
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockTerminals);
        observer.complete();
      }, 500);
    });
  }

  createTerminal(request: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ id: Date.now(), ...request });
        observer.complete();
      }, 500);
    });
  }

  updateTerminal(request: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(request);
        observer.complete();
      }, 500);
    });
  }

  deleteTerminal(id: number): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  syncTerminal(request: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          terminalId: request.terminalId,
          success: true,
          recordsAdded: Math.floor(Math.random() * 50) + 10,
          recordsUpdated: Math.floor(Math.random() * 20) + 5,
          errors: 0,
          duration: Math.floor(Math.random() * 10) + 3,
          message: 'Synchronisation réussie',
          timestamp: new Date()
        });
        observer.complete();
      }, 3000);
    });
  }

  testConnection(terminalId: number): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          terminalId,
          success: Math.random() > 0.2,
          responseTime: Math.floor(Math.random() * 100) + 10,
          lastConnection: new Date(),
          memoryUsage: Math.floor(Math.random() * 60) + 20,
          recordCount: Math.floor(Math.random() * 1000) + 500,
          error: Math.random() > 0.8 ? 'Timeout de connexion' : undefined
        });
        observer.complete();
      }, 1000);
    });
  }
}
