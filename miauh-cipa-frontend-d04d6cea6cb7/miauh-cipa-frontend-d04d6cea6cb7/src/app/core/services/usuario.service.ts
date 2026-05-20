import { inject, Injectable } from '@angular/core';
import { RUTAS } from '../config/endpoints';
import { RolUsuario, UsuarioCreate, UsuarioDetail, UsuarioSummary } from '../models/usuario.models';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private _http = inject(HttpService);

  findAll(): Promise<UsuarioSummary[]> {
    return this._http.apiUsuariosGet<UsuarioSummary[]>(RUTAS.users.findAll);
  }

  findById(usuarioId: number): Promise<UsuarioDetail> {
    return this._http.apiUsuariosGet<UsuarioDetail>(RUTAS.users.findById.replace('{id}', usuarioId.toString()));
  }

  me(): Promise<UsuarioDetail> {
    return this._http.apiUsuariosGet<UsuarioDetail>(RUTAS.users.me);
  }

  save(usuario: UsuarioCreate | UsuarioDetail): Promise<UsuarioDetail> {
    return this._http.apiUsuariosPost<UsuarioDetail>(RUTAS.users.save, usuario);
  }

  cambiarRol(usuarioId: number, rol: RolUsuario): Promise<UsuarioDetail> {
    return this._http.apiUsuariosPatch<UsuarioDetail>(
      RUTAS.users.cambiarRol
        .replace('{id}', usuarioId.toString())
        .replace('{rol}', rol),
      {}
    );
  }

  activar(usuarioId: number): Promise<UsuarioDetail> {
    return this._http.apiUsuariosPatch<UsuarioDetail>(RUTAS.users.activar.replace('{id}', usuarioId.toString()), {});
  }

  desactivar(usuarioId: number): Promise<UsuarioDetail> {
    return this._http.apiUsuariosPatch<UsuarioDetail>(RUTAS.users.desactivar.replace('{id}', usuarioId.toString()), {});
  }
}
