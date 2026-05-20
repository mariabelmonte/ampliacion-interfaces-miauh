import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type HttpQueryParams = Record<
  string,
  string | number | boolean | readonly (string | number | boolean)[]
>;

export type JsonRequestBody = object | readonly unknown[] | null;

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly http = inject(HttpClient);
  private currentConfig = environment.endpoint_fijo;
  private readonly calendarioConfig = environment.endpoint_calendario;
  private readonly usuariosConfig = environment.endpoint_usuarios;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  async apiGet<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.get<T>(this.buildUrl(this.currentConfig, endpoint), {
          headers: this.getHeaders(),
          params,
        })
      );
    } catch (error) {
      console.error('Error en apiGet:', error);
      throw error;
    }
  }

  async apiPost<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.post<T>(this.buildUrl(this.currentConfig, endpoint), body, {
          headers: this.getHeaders(),
        })
      );
    } catch (error) {
      console.error('Error en apiPost:', error);
      throw error;
    }
  }

  async apiPut<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.put<T>(this.buildUrl(this.currentConfig, endpoint), body, {
          headers: this.getHeaders(),
        })
      );
    } catch (error) {
      console.error('Error en apiPut:', error);
      throw error;
    }
  }

  async apiDelete<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.delete<T>(this.buildUrl(this.currentConfig, endpoint), {
          headers: this.getHeaders(),
          params,
        })
      );
    } catch (error) {
      console.error('Error en apiDelete:', error);
      throw error;
    }
  }

  async apiPatch<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.patch<T>(this.buildUrl(this.currentConfig, endpoint), body, {
          headers: this.getHeaders(),
        })
      );
    } catch (error) {
      console.error('Error en apiPatch:', error);
      throw error;
    }
  }

  setConfig(config: string): void {
    this.currentConfig = config;
  }

  async apiUsuariosGet<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.get<T>(this.buildUrl(this.usuariosConfig, endpoint), {
          headers: this.getHeaders(),
          params,
        })
      );
    } catch (error) {
      console.error('Error en apiUsuariosGet:', error);
      throw error;
    }
  }

  async apiUsuariosPost<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.post<T>(this.buildUrl(this.usuariosConfig, endpoint), body, {
          headers: this.getHeaders(),
        })
      );
    } catch (error) {
      console.error('Error en apiUsuariosPost:', error);
      throw error;
    }
  }

  async apiUsuariosPatch<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.patch<T>(this.buildUrl(this.usuariosConfig, endpoint), body, {
          headers: this.getHeaders(),
        })
      );
    } catch (error) {
      console.error('Error en apiUsuariosPatch:', error);
      throw error;
    }
  }

  async apiCalendarioGet<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.get<T>(this.buildUrl(this.calendarioConfig, endpoint), {
          headers: this.getHeaders(),
          params,
        })
      );
    } catch (error) {
      console.error('Error en apiCalendarioGet:', error);
      throw error;
    }
  }

  async apiCalendarioPost<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.post<T>(this.buildUrl(this.calendarioConfig, endpoint), body, {
          headers: this.getHeaders(),
        })
      );
    } catch (error) {
      console.error('Error en apiCalendarioPost:', error);
      throw error;
    }
  }

  async apiCalendarioDelete<T>(endpoint: string, params: HttpQueryParams = {}): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.delete<T>(this.buildUrl(this.calendarioConfig, endpoint), {
          headers: this.getHeaders(),
          params,
        })
      );
    } catch (error) {
      console.error('Error en apiCalendarioDelete:', error);
      throw error;
    }
  }

  async apiCalendarioPatch<T, TBody = JsonRequestBody>(endpoint: string, body: TBody): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.patch<T>(this.buildUrl(this.calendarioConfig, endpoint), body, {
          headers: this.getHeaders(),
        })
      );
    } catch (error) {
      console.error('Error en apiCalendarioPatch:', error);
      throw error;
    }
  }

  private buildUrl(baseUrl: string, endpoint: string): string {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    return `${normalizedBase}${normalizedEndpoint}`;
  }
}
