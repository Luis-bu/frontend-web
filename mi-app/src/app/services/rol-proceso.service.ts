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

  getById(id: number): Observable<RolProceso> {
    return this.http.get<RolProceso>(`${this.url}/${id}`);
  }

  create(rol: Omit<RolProceso, 'id'>): Observable<RolProceso> {
    return this.http.post<RolProceso>(this.url, rol);
  }

  update(id: number, rol: Omit<RolProceso, 'id'>): Observable<RolProceso> {
    return this.http.put<RolProceso>(`${this.url}/${id}`, rol);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
