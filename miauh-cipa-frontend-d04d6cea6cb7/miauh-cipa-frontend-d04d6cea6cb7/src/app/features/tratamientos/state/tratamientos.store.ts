import { computed, Injectable, signal } from '@angular/core';
import { Tratamiento } from '../models/tratamiento.model';

@Injectable({ providedIn: 'root' })
export class TratamientosStore {
    // Estado
    private _tratamientos = signal<Tratamiento[]>([]);
    private _loading = signal<boolean>(false);

    // Selectores
    readonly tratamientos = computed(() => this._tratamientos());
    readonly loading = computed(() => this._loading());

    // Acciones
    setLoading(value: boolean) {
        this._loading.set(value);
    }

    setTratamientos(tratamientos: Tratamiento[]) {
        this._tratamientos.set(tratamientos);
    }
}
