import { RolUsuario } from '../../core/models/usuario.models';

export interface Userfull {
  id: number;
  nombre: string;
  apellidos: string;
  name: string;
  email: string;
  rol: RolUsuario;
  role: RolUsuario;
  password?: string;
  activo: boolean;
  active: boolean;
}

export const createEmptyUser = (): Userfull => ({
  id: 0,
  nombre: '',
  apellidos: '',
  name: '',
  email: '',
  rol: 'USER',
  role: 'USER',
  activo: true,
  active: true,
});
