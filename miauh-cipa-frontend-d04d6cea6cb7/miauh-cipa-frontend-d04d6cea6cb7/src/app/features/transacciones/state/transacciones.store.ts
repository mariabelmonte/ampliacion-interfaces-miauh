import { computed, Injectable, signal } from '@angular/core';
import { Transaccion } from '../models/transaccion.model';

@Injectable({ providedIn: 'root' })
export class TransaccionesStore {
    // Estado
    private _allTransacciones = signal<Transaccion[]>([]);
    private _loading = signal<boolean>(false);
    private _filtroActual = signal<string>('TODAS');

    // Selectores
    readonly allTransacciones = computed(() => this._allTransacciones());
    readonly loading = computed(() => this._loading());
    readonly filtroActual = computed(() => this._filtroActual());

    readonly transaccionesFiltradas = computed(() => {
        const lista = this._allTransacciones();
        const filtro = this._filtroActual();
        if (filtro === 'TODAS') return lista;
        return lista.filter(t => t.tipo === filtro);
    });

    // Acciones
    setLoading(value: boolean) {
        this._loading.set(value);
    }

    setTransacciones(transacciones: Transaccion[]) {
        this._allTransacciones.set(transacciones);
    }

    setFiltro(filtro: string) {
        this._filtroActual.set(filtro);
    }
}
