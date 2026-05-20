import { RolUsuario } from './usuario.models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

export interface AuthResponse {
  token: string;
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  rol: RolUsuario;
}
