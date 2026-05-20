import { Seguimiento } from "../../../shared/models/seguimiento.model";

export interface Transaccion {
  id?: number;
  idAdoptante: number;
  idAnimal: number;
  nombreAdoptante?: string;
  telefonoAdoptante: string;
  nombreAnimal?: string;
  fechaInicio: Date | string | null;
  fechaAdopcion?: Date | string;
  fechaFin?: Date | string | null;
  fechaSalida?: Date | string | null;
  observaciones: string;
  tipo: 'ACOGIDA' | 'ADOPCION';
  seguimientos?: Seguimiento[];
}

export interface TransaccionFormValue {
  id?: number;
  adoptante: number | { id: number };
  animal: number | { id: number };
  fechaInicio: Date | string;
  fechaFin?: Date | string | null;
  observaciones?: string | null;
}

export interface TransaccionPayload {
  id?: number;
  idAdoptante: number;
  idAnimal: number;
  observaciones?: string | null;
  fechaSalida?: Date | string | null;
  fechaInicio?: Date | string | null;
  fechaFin?: Date | string | null;
}
