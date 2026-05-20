import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';
import { RolUsuario } from '../models/usuario.models';
import { RUTAS } from '../config/endpoints';
import { HttpService } from './http.service';

type StoredUser = Omit<AuthResponse, 'token'> & {
  name: string;
  role: RolUsuario;
  active: boolean;
};

interface JwtClaims {
  id?: number;
  sub?: string | number;
  name?: string;
  nombre?: string;
  role?: RolUsuario | 'ADMINISTRADOR';
  rol?: RolUsuario | 'ADMINISTRADOR';
  image?: string;
  email?: string;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'a_t';
  private readonly userKey = 'miauh_user';
  private _http = inject(HttpService);
  private router = inject(Router);
  private _currentUser = signal<StoredUser | null>(this.readStoredUser());

  readonly currentUser = computed(() => this._currentUser());

  async initSession(): Promise<void> {
    if (!this.isAuthenticated()) {
      this.logout(false);
      return;
    }

    this._currentUser.set(this.readStoredUser());
  }

  async login(value: LoginRequest): Promise<AuthResponse> {
    const response = await this._http.apiUsuariosPost<AuthResponse>(RUTAS.auth.login, value);
    this.saveToken(response.token);
    this.saveCurrentUser(response);
    return response;
  }

  async register(value: RegisterRequest): Promise<AuthResponse> {
    const response = await this._http.apiUsuariosPost<AuthResponse>(RUTAS.auth.register, value);

    if (response?.token) {
      this.saveToken(response.token);
      this.saveCurrentUser(response);
    }

    return response;
  }

  registrarUsuario(value: RegisterRequest): Promise<AuthResponse> {
    return this.register(value);
  }

  logout(navigate = true): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._currentUser.set(null);

    if (navigate) {
      this.router.navigate(['/login']);
    }
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): StoredUser | null {
    return this._currentUser();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  hasRole(role: RolUsuario): boolean {
    const currentRole = this.getNormalizedRole();
    return currentRole === 'ADMINISTRATOR' || currentRole === role;
  }

  hasAnyRole(roles: RolUsuario[]): boolean {
    const currentRole = this.getNormalizedRole();
    return currentRole === 'ADMINISTRATOR' || roles.includes(currentRole as RolUsuario);
  }

  decodeToken(tipo: string, a_t?: string): string | number | undefined {
    const token = a_t ?? this.getToken();
    if (!token) return undefined;

    const tok = jwtDecode<JwtClaims>(token);
    switch (tipo) {
      case 'ID':
        return tok.id ?? tok.sub;
      case 'NAME':
        return tok.name ?? tok.nombre;
      case 'ROLE':
        return tok.role ?? tok.rol;
      case 'IMAGE':
        return tok.image;
      case 'EMAIL':
        return tok.email ?? tok.sub;
      default:
        return undefined;
    }
  }

  private saveCurrentUser(response: AuthResponse): void {
    const user: StoredUser = {
      id: response.id,
      nombre: response.nombre,
      apellidos: response.apellidos,
      email: response.email,
      rol: response.rol,
      name: `${response.nombre} ${response.apellidos}`.trim(),
      role: response.rol,
      active: true,
    };

    localStorage.setItem(this.userKey, JSON.stringify(user));
    this._currentUser.set(user);
  }

  private readStoredUser(): StoredUser | null {
    const rawUser = localStorage.getItem(this.userKey);
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as StoredUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private getNormalizedRole(): RolUsuario | null {
    const role = (this._currentUser()?.rol ?? this._currentUser()?.role) as string | undefined;
    if (role === 'ADMINISTRADOR') return 'ADMINISTRATOR';
    return (role ?? null) as RolUsuario | null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: { exp?: number } = jwtDecode(token);
      return !!decoded.exp && decoded.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
