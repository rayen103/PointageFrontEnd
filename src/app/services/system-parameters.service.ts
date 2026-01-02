import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SystemParameters {
  nbrPortionHeure: number | null;
  arrondiPointEnt: number | null;
  arrondiPointSort: number | null;
  portionHeureSupp: number | null;
  intervalRepete: number | null;
  demarragePosteNuit: number | null;
  refPosteMensuel: string | null;
  refPosteHoraire: string | null;
}

export interface UpdateSystemParametersRequest {
  nbrPortionHeure?: number | null;
  arrondiPointEnt?: number | null;
  arrondiPointSort?: number | null;
  portionHeureSupp?: number | null;
  intervalRepete?: number | null;
  demarragePosteNuit?: number | null;
  refPosteMensuel?: string | null;
  refPosteHoraire?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SystemParametersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/SystemParameters`;

  getParameters(codeSoc: string): Observable<SystemParameters> {
    return this.http.get<SystemParameters>(`${this.apiUrl}/${codeSoc}`);
  }

  updateParameters(codeSoc: string, payload: UpdateSystemParametersRequest): Observable<SystemParameters> {
    return this.http.put<SystemParameters>(`${this.apiUrl}/${codeSoc}`, payload);
  }
}

