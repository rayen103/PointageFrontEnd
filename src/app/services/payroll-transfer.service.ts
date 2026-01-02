import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmployeePayrollData {
  matricule: string;
  nomPrenom: string;
  heuresTravaillees: number;
  heuresSupplementaires: number;
  hs1_25: number;
  hs1_5: number;
  hs1_75: number;
  hs2_00: number;
  heuresNuit: number;
  retards: number;
  absences: number;
  conges: number;
  primesPanier: number;
  validated: boolean;
  errors: string[];
}

export interface PayrollPeriodRequest {
  codeSociete: string;
  dateDebut: string;
  dateFin: string;
  matricule?: string;
}

export interface PayrollTransferRequest {
  codeSociete: string;
  dateDebut: string;
  dateFin: string;
  matricules?: string[];
  transferredBy: string;
  comments?: string;
}

export interface PayrollTransferResult {
  success: boolean;
  message: string;
  totalEmployees: number;
  totalHeures: number;
  totalHS: number;
  transferDate: string;
  transferId: string;
}

export interface PayrollPeriodSummary {
  totalEmployees: number;
  totalHeures: number;
  totalHS: number;
  totalRetards: number;
  totalAbsences: number;
  totalConges: number;
  totalPrimesPanier: number;
  periode: string;
  employeesWithErrors: number;
}

export interface PayrollTransferHistory {
  transferId: string;
  codeSociete: string;
  dateDebut: string;
  dateFin: string;
  totalEmployees: number;
  totalHeures: number;
  totalHS: number;
  transferDate: string;
  transferredBy: string;
  comments?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollTransferService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/payrolltransfer`;

  /**
   * Get aggregated payroll data for all employees in the period
   */
  getPeriodData(request: PayrollPeriodRequest): Observable<EmployeePayrollData[]> {
    return this.http.post<EmployeePayrollData[]>(`${this.apiUrl}/period-data`, request);
  }

  /**
   * Get summary statistics for the payroll period
   */
  getPeriodSummary(request: PayrollPeriodRequest): Observable<PayrollPeriodSummary> {
    return this.http.post<PayrollPeriodSummary>(`${this.apiUrl}/period-summary`, request);
  }

  /**
   * Execute payroll transfer
   */
  executeTransfer(request: PayrollTransferRequest): Observable<PayrollTransferResult> {
    return this.http.post<PayrollTransferResult>(`${this.apiUrl}/transfer`, request);
  }

  /**
   * Get payroll transfer history
   */
  getTransferHistory(
    codeSociete: string, 
    dateDebut?: string, 
    dateFin?: string
  ): Observable<PayrollTransferHistory[]> {
    const params: any = {};
    if (dateDebut) params.dateDebut = dateDebut;
    if (dateFin) params.dateFin = dateFin;
    
    return this.http.get<PayrollTransferHistory[]>(
      `${this.apiUrl}/history/${codeSociete}`,
      { params }
    );
  }

  /**
   * Export payroll data to CSV/Excel
   */
  exportPayrollData(request: PayrollPeriodRequest, format: string = 'csv'): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/export?format=${format}`,
      request,
      { responseType: 'blob' }
    );
  }

  /**
   * Validate employees for payroll transfer
   */
  validateEmployees(request: PayrollPeriodRequest): Observable<{
    hasErrors: boolean;
    errorCount: number;
    errors: Record<string, string[]>;
  }> {
    return this.http.post<{
      hasErrors: boolean;
      errorCount: number;
      errors: Record<string, string[]>;
    }>(`${this.apiUrl}/validate`, request);
  }
}
