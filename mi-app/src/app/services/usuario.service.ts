import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioDTO {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  empresaId: number;
}

export interface UsuarioCreateDTO {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  empresaId: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private url = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getByEmpresa(empresaId: number): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.url}/empresa/${empresaId}`);
  }

  create(usuario: UsuarioCreateDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.url, usuario);
  }

  update(id: number, usuario: Omit<UsuarioDTO, 'id'>): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.url}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
