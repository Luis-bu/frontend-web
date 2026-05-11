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
}
