import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gateway } from '../models/gateway.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GatewayService {
  private url = `${environment.apiUrl}/gateways`;

  constructor(private http: HttpClient) {}

  getByProceso(procesoId: number): Observable<Gateway[]> {
    return this.http.get<Gateway[]>(`${this.url}/proceso/${procesoId}`);
  }

  getById(id: number): Observable<Gateway> {
    return this.http.get<Gateway>(`${this.url}/${id}`);
  }

  create(gateway: Omit<Gateway, 'id'>): Observable<Gateway> {
    return this.http.post<Gateway>(this.url, gateway);
  }

  update(id: number, gateway: Omit<Gateway, 'id'>): Observable<Gateway> {
    return this.http.put<Gateway>(`${this.url}/${id}`, gateway);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
