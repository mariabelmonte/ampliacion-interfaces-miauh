import { computed, inject, Injectable, signal } from '@angular/core';
import { Userfull } from '../../shared/models/user.model';
import { UsuarioDetail } from '../models/usuario.models';
import { UsuarioService } from './usuario.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly _usuarios = inject(UsuarioService);
    private readonly _userSignal = signal<Userfull | null>(null);
    readonly user = computed(() => this._userSignal());

    async fetchUser(): Promise<Userfull> {
        const response = await this._usuarios.me();
        const userData = this.mapUsuario(response);

        this._userSignal.set(userData);
        return userData;
    }

    clearUser(): void {
        this._userSignal.set(null);
    }

    updateLocalUser(data: Partial<Userfull>): void {
        this._userSignal.update(user => user ? { ...user, ...data } : null);
    }

    private mapUsuario(usuario: UsuarioDetail): Userfull {
        const name = `${usuario.nombre} ${usuario.apellidos ?? ''}`.trim();

        return {
            id: usuario.id,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos ?? '',
            name,
            email: usuario.email,
            rol: usuario.rol,
            role: usuario.rol,
            activo: usuario.activo,
            active: usuario.activo,
        };
    }
}
