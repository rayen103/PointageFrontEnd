import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ImportAttendanceRecord {
  matricule: string;
  nomPrenom?: string;
  dateTime: Date;
  type: string; // 'E' or 'S'
  deviceId?: string;
  sourceFile?: string;
}

export interface ImportFileRequest {
  codeSociete: string;
  fileContent: string; // Base64 or raw content
  fileType: string; // "csv", "excel", "text", "access"
  fileName: string;
}

export interface ImportDeviceRequest {
  codeSociete: string;
  deviceIds: string[];
  dateDebut: string;
  dateFin: string;
}

export interface ImportRecordResult {
  matricule: string;
  nomPrenom?: string;
  dateTime: string;
  type: string;
  status: string; // "success", "duplicate", "error"
  errorMessage?: string;
  deviceId?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  totalRecords: number;
  successCount: number;
  duplicateCount: number;
  errorCount: number;
  recordResults: ImportRecordResult[];
}

export interface ImportValidationRequest {
  codeSociete: string;
  records: ImportAttendanceRecord[];
}

export interface ImportValidationResult {
  isValid: boolean;
  totalRecords: number;
  validRecords: number;
  duplicateRecords: number;
  invalidRecords: number;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/import`;

  /**
   * Import attendance records from a file
   */
  importFromFile(request: ImportFileRequest): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.apiUrl}/from-file`, request);
  }

  /**
   * Import attendance records directly from biometric devices
   */
  importFromDevices(request: ImportDeviceRequest): Observable<ImportResult> {
    return this.http.post<ImportResult>(`${this.apiUrl}/from-devices`, request);
  }

  /**
   * Validate import data before processing
   */
  validateImport(request: ImportValidationRequest): Observable<ImportValidationResult> {
    return this.http.post<ImportValidationResult>(`${this.apiUrl}/validate`, request);
  }

  /**
   * Parse file content to preview records before import
   */
  parseFile(request: ImportFileRequest): Observable<{ totalRecords: number; records: ImportAttendanceRecord[] }> {
    return this.http.post<{ totalRecords: number; records: ImportAttendanceRecord[] }>(
      `${this.apiUrl}/parse-file`,
      request
    );
  }

  /**
   * Detect duplicates in import data
   */
  detectDuplicates(
    codeSociete: string,
    records: ImportAttendanceRecord[]
  ): Observable<{ totalDuplicates: number; duplicates: ImportAttendanceRecord[] }> {
    return this.http.post<{ totalDuplicates: number; duplicates: ImportAttendanceRecord[] }>(
      `${this.apiUrl}/detect-duplicates?codeSociete=${codeSociete}`,
      records
    );
  }

  /**
   * Helper to convert File to base64 string
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:*/*;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Helper to read file as text
   */
  fileToText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
