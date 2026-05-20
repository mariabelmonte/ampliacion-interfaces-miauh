import { Injectable, inject } from '@angular/core';
import { HttpService } from '../../../core/services/http.service';
import { Tratamiento, SaludPayload } from '../models/tratamiento.model';
import { RUTAS } from '../../../core/config/endpoints';

export interface TipoTratamientoOption {
    id: number;
    nombre: string;
}

/**
 * @description Servicio para la gestión de tratamientos médicos de los animales.
 */
@Injectable({ providedIn: 'root' })
export class TratamientoService {
    private readonly _http = inject(HttpService);

    /**
     * @description Obtiene el listado completo de todos los tratamientos.
     * @returns Promesa con el array de tratamientos.
     */
    public getByAnimal(idAnimal: number): Promise<Tratamiento[]> {
        return this._http.apiGet<Tratamiento[]>(
            RUTAS.tratamientos.findByAnimal.replace('{idAnimal}', idAnimal.toString())
        );
    }

    /**
     * @description Guarda o actualiza un tratamiento.
     */
    public save(tratamiento: SaludPayload): Promise<void> {
        return this._http.apiPost<void, SaludPayload>(RUTAS.tratamientos.save, tratamiento);
    }

    /**
     * @description Guarda un registro de salud (Vacuna, Test, etc).
     */
    public saveSalud(payload: SaludPayload): Promise<void> {
        return this._http.apiPost<void, SaludPayload>(RUTAS.tratamientos.save, payload);
    }

    public getTiposVacunaByAnimal(idAnimal: number): Promise<TipoTratamientoOption[]> {
        return this._http.apiGet<TipoTratamientoOption[]>(
            RUTAS.tiposVacuna.findByAnimal.replace('{idAnimal}', idAnimal.toString())
        );
    }

    public getTiposTestByAnimal(idAnimal: number): Promise<TipoTratamientoOption[]> {
        return this._http.apiGet<TipoTratamientoOption[]>(
            RUTAS.tiposTest.findByAnimal.replace('{idAnimal}', idAnimal.toString())
        );
    }

    public getTiposDesparasitacionByAnimal(idAnimal: number): Promise<TipoTratamientoOption[]> {
        return this._http.apiGet<TipoTratamientoOption[]>(
            RUTAS.tiposDesparasitacion.findByAnimal.replace('{idAnimal}', idAnimal.toString())
        );
    }

}
