import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
    // Estado
    private _contadorAnimales = signal<number>(0);
    private _contadorAdopciones = signal<number>(0);
    private _contadorEnTratamiento = signal<number>(0);
    private _contadorEnAcogida = signal<number>(0);
    private _animalesRecientes = signal<string>('No hay animales registrados');
    private _adopcionesPendientes = signal<string>('No hay adopciones pendientes');
    private _loading = signal<boolean>(false);

    // Selectores
    readonly contadorAnimales = computed(() => this._contadorAnimales());
    readonly contadorAdopciones = computed(() => this._contadorAdopciones());
    readonly contadorEnTratamiento = computed(() => this._contadorEnTratamiento());
    readonly contadorEnAcogida = computed(() => this._contadorEnAcogida());
    readonly animalesRecientes = computed(() => this._animalesRecientes());
    readonly adopcionesPendientes = computed(() => this._adopcionesPendientes());
    readonly loading = computed(() => this._loading());

    // Acciones
    setLoading(value: boolean) {
        this._loading.set(value);
    }

    setContadores(data: {
        animales?: number;
        adopciones?: number;
        tratamiento?: number;
        acogida?: number;
        recientes?: string;
        pendientes?: string;
    }) {
        if (data.animales !== undefined) this._contadorAnimales.set(data.animales);
        if (data.adopciones !== undefined) this._contadorAdopciones.set(data.adopciones);
        if (data.tratamiento !== undefined) this._contadorEnTratamiento.set(data.tratamiento);
        if (data.acogida !== undefined) this._contadorEnAcogida.set(data.acogida);
        if (data.recientes !== undefined) this._animalesRecientes.set(data.recientes);
        if (data.pendientes !== undefined) this._adopcionesPendientes.set(data.pendientes);
    }
}
