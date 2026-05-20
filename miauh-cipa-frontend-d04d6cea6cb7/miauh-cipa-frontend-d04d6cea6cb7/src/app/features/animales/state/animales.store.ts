import { computed, Injectable, signal } from '@angular/core';
import { Animal } from '../models/animal.model';

@Injectable({ providedIn: 'root' })
export class AnimalesStore {
    // Estado
    private _listaAnimales = signal<Animal[]>([]);
    private _loading = signal<boolean>(false);

    // Selectores
    readonly listaAnimales = computed(() => this._listaAnimales());
    readonly loading = computed(() => this._loading());

    // Acciones
    setLoading(value: boolean) {
        this._loading.set(value);
    }

    setListaAnimales(animales: Animal[]) {
        this._listaAnimales.set(animales);
    }
}
