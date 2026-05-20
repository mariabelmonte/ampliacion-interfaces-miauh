export interface AnimalVinculado {
    id: number;
    nombre: string;
    nombreAnimal?: string;
    numeroChip?: string;
    tipoOperacion: 'ADOPCION' | 'ACOGIDA';
    fechaInicio?: Date | string | null;
    fechaFin?: Date | string | null;
    fechaSalida?: Date | string | null;
    duracion?: string;
    observaciones?: string;
}
