import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Actividad } from '../models/actividad.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ActividadService {
  private url = `${environment.apiUrl}/actividades`;

  constructor(private http: HttpClient) {}

  getByProceso(procesoId: number): Observable<Actividad[]> {
    return this.http.get<Actividad[]>(`${this.url}/proceso/${procesoId}`);
  }

  getById(id: number): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.url}/${id}`);
  }

  create(actividad: Omit<Actividad, 'id'>): Observable<Actividad> {
    return this.http.post<Actividad>(this.url, actividad);
  }

  update(id: number, actividad: Omit<Actividad, 'id'>): Observable<Actividad> {
    return this.http.put<Actividad>(`${this.url}/${id}`, actividad);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
