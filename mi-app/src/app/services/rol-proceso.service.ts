import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolProceso } from '../models/rol-proceso.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RolProcesoService {
  private url = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getByEmpresa(empresaId: number): Observable<RolProceso[]> {
    return this.http.get<RolProceso[]>(`${this.url}/empresa/${empresaId}`);
  }
}
