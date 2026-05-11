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
}
