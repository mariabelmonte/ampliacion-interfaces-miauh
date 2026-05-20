export type TipoEventoCalendario = 'EVENTO' | 'SEGUIMIENTO';
export type TipoReferenciaEvento = 'ANIMAL' | 'TRATAMIENTO' | 'ADOPCION' | 'GENERAL';
export type CategoriaEvento =
    | 'VISITA'
    | 'VETERINARIO'
    | 'ENTREVISTA'
    | 'LIMPIEZA'
    | 'OTROS'
    | 'SEGUIMIENTO'
    | 'TRATAMIENTO'
    | 'ADOPCION';

export interface Evento {
    id: number;
    titulo: string;
    descripcion?: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    color: string;
    idRefeExterna: number | null;
    tipoRefeExterna: TipoReferenciaEvento;
    nombreCategoria: CategoriaEvento;
    completado: boolean;
    tipo: TipoEventoCalendario;
    realizado?: boolean;
    comentarios?: string;
    idReferencia?: number;
}

export type EventoPayload = Omit<Evento, 'id'> & { id?: number | null };

export interface SeguimientoCalendarioDto {
    id: number;
    animal_nombre: string;
    fecha_programada: string;
    realizado: boolean;
    comentarios?: string;
    id_adopcion: number;
}

export type ModalEventoResult =
    | { action: 'delete'; id: number }
    | { action: 'save'; evento: EventoPayload };
