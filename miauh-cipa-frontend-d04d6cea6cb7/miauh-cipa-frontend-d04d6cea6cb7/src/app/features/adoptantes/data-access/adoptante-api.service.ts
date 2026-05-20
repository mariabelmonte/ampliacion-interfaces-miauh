import { Injectable, inject } from '@angular/core';
import { RUTAS } from '../../../core/config/endpoints';
import { HttpService } from '../../../core/services/http.service';
import { AnimalVinculado } from '../../../shared/models/operacion.model';
import { Adoptante, AdoptanteDto, AdoptantePayload } from '../models/adoptantes.model';

@Injectable({
  providedIn: 'root',
})
export class AdoptanteService {
  private readonly _http = inject(HttpService);

  getAll(): Promise<Adoptante[]> {
    return this._http.apiGet<AdoptanteDto[]>(RUTAS.adoptantes.findAll, {}).then((data) =>
      (data || []).map((item) => ({
        ...item,
        nombreCompleto: item.nombreCompleto,
        identificacion: item.identificacion,
        telefonoPrincipal: item.telefonoPrincipal ?? item.telefonoAdoptante ?? item.telefonos?.[0] ?? '',
        telefonoAdoptante: item.telefonoAdoptante ?? item.telefonoPrincipal ?? item.telefonos?.[0] ?? '',
        telefonoSecundario: item.telefonoSecundario ?? item.telefonos?.[1] ?? '',
        telefono1: item.telefonoPrincipal ?? item.telefonoAdoptante ?? item.telefonos?.[0] ?? '',
        telefono2: item.telefonoSecundario ?? item.telefonos?.[1] ?? '',
        totalAnimales: item.numeroAnimales ?? item.totalAnimales ?? 0,
      }) as Adoptante)
    );
  }

  getById(id: number): Promise<Adoptante> {
    return this._http
      .apiGet<AdoptanteDto>(RUTAS.adoptantes.findById.replace('{id}', id.toString()), {})
      .then((item) => ({
        ...item,
        nombreCompleto: item.nombreCompleto,
        telefonoAdoptante: item.telefonoAdoptante ?? item.telefonoPrincipal ?? item.telefonos?.[0] ?? '',
        telefonoSecundario: item.telefonoSecundario ?? item.telefonos?.[1] ?? '',
        telefonoPrincipal: item.telefonoPrincipal ?? item.telefonoAdoptante ?? item.telefonos?.[0] ?? '',
        telefono1: item.telefonoAdoptante ?? item.telefonoPrincipal ?? item.telefonos?.[0] ?? '',
        telefono2: item.telefonoSecundario ?? item.telefonos?.[1] ?? '',
        direccion: item.direccion || {},
        observaciones: item.observaciones || item.direccion?.observaciones,
        totalAnimales: item.numeroAnimales ?? item.totalAnimales ?? 0,
      }) as Adoptante);
  }

  save(adoptante: AdoptantePayload): Promise<Adoptante> {
    const telefonoPrincipal = adoptante.telefonoAdoptante
      ?? adoptante.telefonoPrincipal
      ?? adoptante.telefono1
      ?? adoptante.telefonos?.[0]
      ?? '';
    const telefonoSecundario = adoptante.telefonoSecundario
      ?? adoptante.telefono2
      ?? adoptante.telefonos?.[1]
      ?? '';

    const payload: AdoptantePayload = {
      ...adoptante,
      telefonoAdoptante: telefonoPrincipal,
      telefonoSecundario,
    };

    delete payload.telefono1;
    delete payload.telefono2;
    delete payload.telefonos;

    return this._http.apiPost<Adoptante, AdoptantePayload>(RUTAS.adoptantes.save, payload);
  }

  getAdopcionesByAdoptante(id: number): Promise<AnimalVinculado[]> {
    return this._http.apiGet<AnimalVinculado[]>(
      RUTAS.adoptantes.findAdopcionesByAdoptante.replace('{id}', id.toString()),
      {}
    );
  }

  getAcogidasByAdoptante(id: number): Promise<AnimalVinculado[]> {
    return this._http.apiGet<AnimalVinculado[]>(
      RUTAS.adoptantes.findAcogidasByAdoptante.replace('{id}', id.toString()),
      {}
    );
  }
}
