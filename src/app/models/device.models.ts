// Device Management Models for GRH Pointage System

export interface TerminalDto {
  id: number;
  numeroTerminal: number;
  adresseIp: string;
  port: number;
  nomService: string;
  localisation?: string;
  typeAppareil: string;
  modele?: string;
  numeroSerie?: string;
  remarques?: string;
  actif?: boolean;
  dateCreation?: Date;
  derniereConnexion?: Date;
}

export interface CreateTerminalRequest {
  numeroTerminal: number;
  adresseIp: string;
  port: number;
  nomService: string;
  localisation?: string;
  typeAppareil: string;
  modele?: string;
  numeroSerie?: string;
  remarques?: string;
}

export interface UpdateTerminalRequest {
  id: number;
  numeroTerminal?: number;
  adresseIp?: string;
  port?: number;
  nomService?: string;
  localisation?: string;
  typeAppareil?: string;
  modele?: string;
  numeroSerie?: string;
  remarques?: string;
}

export interface SyncTerminalRequest {
  terminalId: number;
  syncType: 'full' | 'incremental' | 'employees-only';
  startDate?: Date;
  endDate?: Date;
}

export interface SyncResultDto {
  terminalId: number;
  success: boolean;
  recordsAdded: number;
  recordsUpdated: number;
  errors: number;
  duration: number;
  message?: string;
  timestamp: Date;
}

export interface DeviceConnectionTestDto {
  terminalId: number;
  success: boolean;
  responseTime?: number;
  lastConnection?: Date;
  memoryUsage?: number;
  recordCount?: number;
  error?: string;
}

export interface EmployeeEnrollmentDto {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  terminalId: number | null;
  enrolled: boolean;
  enrolledDate?: Date;
}

export interface DeviceStatsDto {
  totalPointages: number;
  employeesEnrolled: number;
  devicesOnline: number;
  totalDevices: number;
  storageUsed: number;
  lastSyncCount: number;
  lastSyncTime: Date;
  syncErrors: number;
  totalSyncs: number;
}

// Legacy types from backend service (for backward compatibility)
export interface DeviceDto {
  ip: string;
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
