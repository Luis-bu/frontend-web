export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  correo: string;
  nombre: string;
  rol: string;
  empresaId: number;
}
