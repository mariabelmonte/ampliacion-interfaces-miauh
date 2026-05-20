import { computed, Injectable, signal } from '@angular/core';
import { Evento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class CalendarioStore {
    private _eventos = signal<Evento[]>([]);
    private _loading = signal<boolean>(false);

    readonly eventos = computed(() => this._eventos());
    readonly loading = computed(() => this._loading());
    readonly tareasPendientes = computed(() =>
        [...this._eventos()].sort((a, b) => Number(a.completado) - Number(b.completado))
    );

    setLoading(value: boolean) {
        this._loading.set(value);
    }

    setEventos(eventos: Evento[]) {
        this._eventos.set(eventos);
    }

    agregarEvento(evento: Evento) {
        this._eventos.update(actuales => [...actuales, evento]);
    }

    actualizarEvento(evento: Evento) {
        this._eventos.update(actuales =>
            actuales.map(ev => ev.id === evento.id ? evento : ev)
        );
    }

    eliminarEvento(id: number) {
        this._eventos.update(actuales => actuales.filter(ev => ev.id !== id));
    }

    marcarComoCompletado(id: number) {
        this._eventos.update(actuales =>
            actuales.map(ev => ev.id === id ? { ...ev, completado: true } : ev)
        );
    }
}
