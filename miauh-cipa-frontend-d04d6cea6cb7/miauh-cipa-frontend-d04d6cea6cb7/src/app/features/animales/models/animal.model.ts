import { FormControl } from "@angular/forms";
import { Situacion } from "./situacion.model";
import { Ubicacion } from "./ubicacion.model";
import { Especie } from "./especie.model";
import { Raza } from "./raza.model";

export interface Animal {

    id: number;
    nombre: string;
    capa: string;
    sexo: string;
    tamanyo: string;
    procedencia: string;
    fechaNacimiento: Date;
    fechaIngreso: Date;
    esterilizado: boolean;
    numeroChip: string;
    comentarios: string;
    imagenUrl?: string;
    imagenAlt?: string;
    imagenTamanyo?: 'sm' | 'md' | 'lg';
    raza?: Raza;
    situacion?: Situacion;
    ubicacion?: Ubicacion;
    especie?: Especie;

    // Propiedades aplanadas que vienen de los DTOs del backend
    nombreRaza?: string;
    nombreEspecie?: string;
    nombreSituacion?: string;
    nombreUbicacion?: string;

}


export interface AnimalForm {
    id: FormControl<number | null>;
    nombre: FormControl<string | null>;
    capa: FormControl<string | null>;
    sexo: FormControl<string | null>;
    tamanyo: FormControl<string | null>;
    procedencia: FormControl<string | null>;
    fechaNacimiento: FormControl<Date | null>;
    fechaIngreso: FormControl<Date | null>;
    esterilizado: FormControl<boolean | null>;
    numeroChip: FormControl<string | null>;
    comentarios: FormControl<string | null>;
    especieId: FormControl<number | null>;
    razaId: FormControl<number | null>;
    ubicacionId: FormControl<number | null>;
    situacionId: FormControl<number | null>;
    ppp: FormControl<boolean | null>;
}

export interface AnimalPayload {
    id?: number | null;
    nombre?: string | null;
    capa?: string | null;
    sexo?: string | null;
    tamanyo?: string | null;
    procedencia?: string | null;
    fechaNacimiento?: Date | string | null;
    fechaIngreso?: Date | string | null;
    esterilizado?: boolean | null;
    numeroChip?: string | null;
    comentarios?: string | null;
    especieId?: number | null;
    razaId?: number | null;
    ubicacionId?: number | null;
    situacionId?: number | null;
    ppp?: boolean | null;
}

export interface UpdateSituacionPayload {
    animal: Animal;
    situacion: string;
    idUsuario: number;
}
