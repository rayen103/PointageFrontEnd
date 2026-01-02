// Leave Management Models and DTOs

export interface LeaveDto {
  codeSoc: string;
  numeroTitreConge: number;
  matricule: string;
  codeConge: string;
  date1JourConge: Date | string;
  dateFinConge: Date | string;
  dureeConge: number;
  flagSolde: boolean;
  employeeName?: string;
  leaveTypeName?: string;
  annee?: number;
}

export interface AbsenceDto {
  codeSoc: string;
  numAbsence: number;
  matricule: string;
  dateAbsence: Date | string;
  motifAbsence: string;
  observation?: string;
  employeeName?: string;
}

export interface AuthorizationDto {
  codeSoc: string;
  numAut: number;
  matricule: string;
  dateAut: Date | string;
  hrAcces: string;
  hrSortie: string;
  motif: string;
  ref?: string;
  employeeName?: string;
}

export interface LeaveSearchRequest {
  codeSoc: string;
  matricule?: string;
  dateDebut?: Date | string;
  dateFin?: Date | string;
  codeConge?: string;
  annee?: number;
  page?: number;
  pageSize?: number;
}

export interface LeaveCreateRequest {
  codeSoc: string;
  matricule: string;
  codeConge: string;
  date1JourConge: Date | string;
  dateFinConge: Date | string;
  dureeConge: number;
}

export interface LeaveEntitlementDto {
  codeSoc: string;
  matricule: string;
  annee: number;
  congeAn: number;
  congePris: number;
  congeSolde: number;
}

export interface AbsenceSearchRequest {
  codeSoc: string;
  matricule?: string;
  dateDebut?: Date | string;
  dateFin?: Date | string;
  motif?: string;
  page?: number;
  pageSize?: number;
}

export interface AbsenceCreateRequest {
  codeSoc: string;
  matricule: string;
  dateAbsence: Date | string;
  motifAbsence: string;
  observation?: string;
}

export interface AuthorizationSearchRequest {
  codeSoc: string;
  matricule?: string;
  dateDebut?: Date | string;
  dateFin?: Date | string;
  motif?: string;
  page?: number;
  pageSize?: number;
}

export interface AuthorizationCreateRequest {
  codeSoc: string;
  matricule: string;
  dateAut: Date | string;
  hrAcces: string;
  hrSortie: string;
  motif: string;
  ref?: string;
}
