import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceso } from '../models/proceso.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProcesoService {
  private url = `${environment.apiUrl}/procesos`;

  constructor(private http: HttpClient) {}

  getByEmpresa(empresaId: number): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(`${this.url}/empresa/${empresaId}`);
  }

  getById(id: number): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.url}/${id}`);
  }

  create(proceso: Omit<Proceso, 'id'>): Observable<Proceso> {
    return this.http.post<Proceso>(this.url, proceso);
  }

  update(id: number, proceso: Omit<Proceso, 'id'>): Observable<Proceso> {
    return this.http.put<Proceso>(`${this.url}/${id}`, proceso);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
