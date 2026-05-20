import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Evento, EventoPayload, SeguimientoCalendarioDto } from '../models/evento.model';
import { RUTAS } from '../../../core/config/endpoints';
import { HttpService } from '../../../core/services/http.service';

@Injectable({
    providedIn: 'root'
})
export class CalendarioApiService {

    private _http = inject(HttpService);

    getEventos(): Observable<Evento[]> {
        return from(this._http.apiCalendarioGet<Evento[]>(RUTAS.calendario.findAll)).pipe(
            map((eventos) => eventos.map((evento) => this.normalizarEvento(evento)))
        );
    }

    async getTodoElCalendario(): Promise<Evento[]> {
        try {
            // Lanzamos ambas peticiones en paralelo
            const [eventosNormales, seguimientos] = await Promise.all([
                this._http.apiCalendarioGet<Evento[]>(RUTAS.calendario.findAll),
                this._http.apiGet<SeguimientoCalendarioDto[]>(RUTAS.seguimientos.findAll, {})
            ]);

            // Mapeamos los seguimientos al formato de la interfaz Evento
            const seguimientosMapeados: Evento[] = seguimientos.map((s) => ({
                id: s.id, // ID del seguimiento
                titulo: `Seguimiento: ${s.animal_nombre}`,
                fechaHoraInicio: s.fecha_programada,
                fechaHoraFin: s.fecha_programada,
                color: s.realizado ? '#2ecc71' : '#f39c12',
                idRefeExterna: s.id_adopcion,
                tipoRefeExterna: 'ADOPCION',
                nombreCategoria: 'SEGUIMIENTO',
                completado: s.realizado,
                tipo: 'SEGUIMIENTO',
                realizado: s.realizado,
                comentarios: s.comentarios,
                idReferencia: s.id_adopcion
            }));

            return [
                ...eventosNormales.map((evento) => this.normalizarEvento(evento)),
                ...seguimientosMapeados
            ];
        } catch (error) {
            console.error("Error unificando calendario", error);
            return [];
        }
    }

    saveEvento(evento: EventoPayload): Observable<Evento> {
        return from(this._http.apiCalendarioPost<Evento>(RUTAS.calendario.save, evento)).pipe(
            map((saved) => this.normalizarEvento(saved))
        );
    }

    updateEvento(evento: EventoPayload): Observable<Evento> {
        return from(this._http.apiCalendarioPost<Evento>(RUTAS.calendario.update, evento)).pipe(
            map((updated) => this.normalizarEvento(updated))
        );
    }

    deleteEvento(id: number): Observable<void> {
        return from(this._http.apiCalendarioDelete<void>(RUTAS.calendario.delete.replace('{id}', id.toString())));
    }

    patchCompletado(id: number): Observable<void> {
        return from(this._http.apiCalendarioPatch<void>(RUTAS.calendario.completeEvent.replace('{id}', id.toString()), {}));
    }

    private normalizarEvento(evento: Evento): Evento {
        return {
            ...evento,
            comentarios: evento.comentarios ?? evento.descripcion ?? ''
        };
    }
}
