import { computed, Injectable, signal } from '@angular/core';
import { Adoptante } from '../models/adoptantes.model';

@Injectable({ providedIn: 'root' })
export class AdoptantesStore {
    // Estado
    private _adoptantes = signal<Adoptante[]>([]);
    private _loading = signal<boolean>(false);

    // Selectores
    readonly adoptantes = computed(() => this._adoptantes());
    readonly loading = computed(() => this._loading());

    // Acciones
    setLoading(value: boolean) {
        this._loading.set(value);
    }

    setAdoptantes(adoptantes: Adoptante[]) {
        this._adoptantes.set(adoptantes);
    }
}
