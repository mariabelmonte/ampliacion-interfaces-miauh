import { Transaccion } from "../../transacciones/models/transaccion.model";

export interface Adoptante {
    id: number;
    identificacion: string;
    nombre: string;
    apellidos: string;
    nombreCompleto: string;
    telefono1: string;
    telefono2?: string;
    telefonoPrincipal?: string; // Para la vista de lista
    telefonoAdoptante?: string; // Para la vista de lista
    telefonoSecundario?: string;
    email: string;
    direccion: {
        id?: number;
        via: string;
        numero: string;
        bloque?: string;
        piso?: string;
        puerta?: string;
        codigoPostal: string;
        municipio: string;
        provincia: string;
        pais: string;
        observaciones?: string;
    };
    observaciones?: string;
    totalAnimales: number; // Campo calculado para mostrar el número total de animales adoptados o acogidos por el adoptante
    // Relación: Un adoptante puede tener varias operaciones (adopciones o acogidas)

    operaciones?: Transaccion[];
    /*
    De transaccion obtener estos datos: 

    idOperacion: number;
    idAnimal: number;
    nombreAnimal: string;
    tipoOperacion: 'ADOPCION' | 'ACOGIDA';
    fechaInicio: Date;
    fechaFin?: Date; // Solo para acogidas que son las que terminan */
}

export interface AdoptanteDto extends Omit<Adoptante, 'telefono1' | 'telefono2' | 'totalAnimales'> {
    telefonos?: string[];
    numeroAnimales?: number;
    telefono1?: string;
    telefono2?: string;
    totalAnimales?: number;
}

export type AdoptantePayload = Omit<Partial<Adoptante>, 'telefono1' | 'telefono2'> & {
    telefono1?: string;
    telefono2?: string;
    telefonos?: string[];
};
