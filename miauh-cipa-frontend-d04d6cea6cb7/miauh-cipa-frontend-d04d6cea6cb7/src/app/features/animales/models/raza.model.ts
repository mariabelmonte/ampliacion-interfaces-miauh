import { Especie } from "./especie.model";

export interface Raza {
    id: number;
    idRaza: number;
    nombre: string;
    especie: Especie;
}