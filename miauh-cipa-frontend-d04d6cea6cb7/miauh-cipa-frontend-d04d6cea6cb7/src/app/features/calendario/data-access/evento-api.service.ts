import { Injectable, inject, signal } from '@angular/core';
import { from } from 'rxjs';
import { RUTAS } from '../../../core/config/endpoints';
import { HttpService } from '../../../core/services/http.service';
import { Evento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class EventoService {
  private readonly _http = inject(HttpService);
  private readonly eventosSignal = signal<Evento[]>([]);
  public readonly eventos = this.eventosSignal.asReadonly();

  getEventos(): void {
    from(this._http.apiCalendarioGet<Evento[]>(RUTAS.calendario.findAll)).subscribe({
      next: (data) => this.eventosSignal.set(data),
      error: (err: unknown) => console.error('Error al conectar con el microservicio', err),
    });
  }

  actualizarEstadoCompletado(id: number): void {
    this.eventosSignal.update((lista) =>
      lista.map((evento) => (evento.id === id ? { ...evento, completado: !evento.completado } : evento))
    );

    this._http.apiCalendarioPatch<void>(RUTAS.calendario.completeEvent.replace('{id}', id.toString()), {}).then(
      () => console.log(`Evento ${id} sincronizado en el backend`),
      (err: unknown) => {
        console.warn('Sincronizacion fallida, pero el estado local es correcto.', err);
      }
    );
  }

  borrarEvento(id: number): void {
    this.eventosSignal.update((lista) => lista.filter((evento) => evento.id !== id));
  }
}
