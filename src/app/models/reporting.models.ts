// Reporting Models and DTOs

export interface DashboardDataDto {
  codeSoc: string;
  date?: Date | string;
  // Today's stats (matching backend)
  employesPresentsAujourdhui?: number;
  employesAbsentsAujourdhui?: number;
  retardsAujourdhui?: number;
  // Alternative naming for compatibility
  totalEmployees?: number;
  presentToday?: number;
  absentToday?: number;
  pendingLeaveRequests?: number;
  pendingAuthorizations?: number;
  overtimeHoursMonth?: number;
  delaysMonth?: number;
  presenceRate?: number;
  // Monthly stats
  tauxPresenceMois?: number;
  heuresSupplementairesMois?: number;
  congesEnCours?: number;
  // Alerts
  congesEnAttente?: number;
  autorisationsEnAttente?: number;
  retardsNonJustifies?: number;
}

export interface PresenceReportDto {
  codeSoc: string;
  matricule: string;
  employeeName: string;
  departement: string;
  service: string;
  month: number;
  year: number;
  daysPresent: number;
  hoursPresent: number;
  overtimeHours: number;
  delays: number;
  absences: number;
}

export interface DepartmentReportDto {
  codeSoc: string;
  departement: string;
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  presenceRate: number;
  averageOvertime: number;
  averageDelays: number;
}

export interface OvertimeReportDto {
  codeSoc: string;
  matricule: string;
  employeeName: string;
  month: number;
  year: number;
  hs1_25: number;
  hs1_5: number;
  hs1_75: number;
  hs2_00: number;
  totalHours: number;
}

export interface DelayReportDto {
  codeSoc: string;
  matricule: string;
  employeeName: string;
  month: number;
  year: number;
  totalDelays: number;
  totalMinutes: number;
  justifiedDelays: number;
  unjustifiedDelays: number;
}

export interface LeaveReportDto {
  codeSoc: string;
  matricule: string;
  employeeName: string;
  year: number;
  annualLeaveEntitlement: number;
  leaveTaken: number;
  leaveBalance: number;
  pendingRequests: number;
}

export interface ReportFilter {
  codeSoc: string;
  matricule?: string;
  departement?: string;
  service?: string;
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  fileName?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
}
