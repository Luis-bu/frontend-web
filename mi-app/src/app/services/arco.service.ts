import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Arco } from '../models/arco.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ArcoService {
  private url = `${environment.apiUrl}/arcos`;

  constructor(private http: HttpClient) {}

  getByProceso(procesoId: number): Observable<Arco[]> {
    return this.http.get<Arco[]>(`${this.url}/proceso/${procesoId}`);
  }

  getById(id: number): Observable<Arco> {
    return this.http.get<Arco>(`${this.url}/${id}`);
  }

  create(arco: Omit<Arco, 'id'>): Observable<Arco> {
    return this.http.post<Arco>(this.url, arco);
  }

  update(id: number, arco: Omit<Arco, 'id'>): Observable<Arco> {
    return this.http.put<Arco>(`${this.url}/${id}`, arco);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
