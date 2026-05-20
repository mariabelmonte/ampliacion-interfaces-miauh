import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { RUTAS } from '../../../core/config/endpoints';
import { HttpService } from '../../../core/services/http.service';

export interface SeguimientoUpdatePayload {
  id: number | null;
  realizado: boolean | null;
  comentarios: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SeguimientoService {
  private _http = inject(HttpService);

  update(id: number | null, data: Omit<SeguimientoUpdatePayload, 'id'>): Observable<void> {
    const url = RUTAS.seguimientos.save; 
    return from(this._http.apiPost<void, SeguimientoUpdatePayload>(url, { ...data, id }));
  }
}
