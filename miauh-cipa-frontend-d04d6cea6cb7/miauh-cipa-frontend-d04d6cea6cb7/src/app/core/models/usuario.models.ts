export type RolUsuario = 'USER' | 'SUPERUSER' | 'ADMINISTRATOR';

export interface UsuarioSummary {
  id: number;
  nombre: string;
  apellidos?: string;
  email: string;
  rol: RolUsuario;
  activo?: boolean;
}

export interface UsuarioDetail extends UsuarioSummary {
  activo: boolean;
}

export interface UsuarioCreate {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  rol: RolUsuario;
}
