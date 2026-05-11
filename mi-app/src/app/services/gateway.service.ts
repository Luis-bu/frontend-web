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
}
