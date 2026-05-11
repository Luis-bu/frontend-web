import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private url = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getByEmpresa(empresaId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.url}/empresa/${empresaId}`);
  }
}
