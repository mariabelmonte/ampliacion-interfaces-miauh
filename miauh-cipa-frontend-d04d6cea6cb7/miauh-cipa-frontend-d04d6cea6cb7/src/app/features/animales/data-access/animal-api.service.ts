import { Injectable } from '@angular/core';
import { RUTAS } from '../../../core/config/endpoints';
import { HttpService } from "../../../core/services/http.service";
import { Animal, AnimalPayload, UpdateSituacionPayload } from '../models/animal.model';
import { Especie } from '../models/especie.model';
import { Raza } from '../models/raza.model';
import { Situacion } from '../models/situacion.model';
import { Ubicacion } from '../models/ubicacion.model';


/**
 * @description Servicio centralizado para la gestión de datos relacionados con los animales y sus catálogos.
 * Coordina las peticiones HTTP hacia el backend para operaciones CRUD y obtención de recursos.
 */
@Injectable({
    providedIn: 'root'
})
export class AnimalService {

    /**
     * @param _http Servicio de utilidad para realizar peticiones HTTP (GET, POST, etc.)
     */
    constructor(private _http: HttpService) { }

    /**
     * Ocupa todos los animales registrados en el sistema sin filtrar.
     * @returns Una promesa que resuelve con un array de objetos @see Animal
     */
    getAll(): Promise<Animal[]> {
        return this._http.apiGet<Animal[]>(RUTAS.animales.findAll, {});
    }

    /**
     * Obtiene la ficha detallada de un animal específico.
     * @param id Identificador único del animal.
     * @returns Promesa con los datos del animal.
     */
    getById(id: number): Promise<Animal> {
        return this._http.apiGet<Animal>(RUTAS.animales.findById.replace('{id}', id.toString()), {});
    }

    /**
     * Guarda un nuevo animal o actualiza uno existente en el servidor.
     * @param animal Objeto con los datos del animal a persistir.
     * @returns Promesa con la respuesta del servidor.
     */
    saveAnimal(animal: AnimalPayload): Promise<Animal> {
        return this._http.apiPost<Animal, AnimalPayload>(RUTAS.animales.save, this.normalizarPayload(animal));
    }

    /**
     * Actualiza los datos de un animal existente.
     * @param id ID del animal.
     * @param animal Instancia del modelo Animal.
     * @returns Promesa con el resultado de la operación.
     */
    update(id: number, animal: Animal): Promise<Animal> {
        return this._http.apiPost<Animal, Animal>(RUTAS.animales.save, { ...animal, id });
    }

    /**
     * Elimina un animal del registro.
     * @param id ID del animal a borrar.
     * @returns Promesa de finalización.
     */
    delete(id: number): Promise<void> {
        return this._http.apiDelete<void>(RUTAS.animales.delete.replace('{id}', id.toString()), {});
    }

    /**
     * Filtra los animales por su especie (p. ej. Perros, Gatos).
     * @param especieId ID numérico o identificador de la especie.
     * @returns Listado de animales pertenecientes a dicha especie.
     */
    getByEspecie(especieId: number | string): Promise<Animal[]> {
        return this._http.apiGet<Animal[]>(RUTAS.animales.findByEspecie.replace('{especieId}', especieId.toString()), {});
    }

    // --- MÉTODOS DE CATÁLOGOS ---

    /**
     * @description Obtiene el catálogo completo de especies disponibles.
     */
    getEspecies(): Promise<Especie[]> {
        return this._http.apiGet<Especie[]>(RUTAS.especies.findAll, {});
    }

    /**
     * @description Obtiene el catálogo completo de razas registradas.
     */
    getRazas(): Promise<Raza[]> {
        return this._http.apiGet<Raza[]>(RUTAS.razas.findAll, {});
    }

    /**
     * Obtiene el listado de razas filtradas por una especie concreta.
     * @param especieId Identificador de la especie.
     */
    getRazasByEspecie(especieId: number): Promise<Raza[]> {
        return this._http.apiGet<Raza[]>(RUTAS.razas.findByEspecie.replace('{especieId}', especieId.toString()), {});
    }

    /**
     * @description Obtiene el catálogo de ubicaciones físicas (Aula, Cocina, etc.).
     */
    getUbicaciones(): Promise<Ubicacion[]> {
        return this._http.apiGet<Ubicacion[]>(RUTAS.ubicaciones.findAll, {});
    }

    /**
     * @description Obtiene el catálogo de situaciones legales/clínicas (Disponible, Reservado, etc.).
     */
    getSituaciones(): Promise<Situacion[]> {
        return this._http.apiGet<Situacion[]>(RUTAS.situaciones.findAll, {});
    }

    /**
     * Actualiza únicamente el estado o situación de un animal.
     * @param animal Objeto animal afectado.
     * @param situacion Nuevo estado a aplicar.
     * @param idUsuario ID del usuario que realiza la acción (auditoría).
     */
    updateSituacion(animal: Animal, situacion: string, idUsuario: number): Promise<Animal> {
        const payload: UpdateSituacionPayload = { animal, situacion, idUsuario };
        return this._http.apiPut<Animal, UpdateSituacionPayload>(RUTAS.animales.updateSituacion, payload);
    }

    getPerros(): Promise<Animal[]> {
        return this._http.apiGet<Animal[]>(RUTAS.animales.findPerros, {});
    }

    getGatos(): Promise<Animal[]> {
        return this._http.apiGet<Animal[]>(RUTAS.animales.findGatos, {});
    }

    private normalizarPayload(animal: AnimalPayload): AnimalPayload {
        const payload: AnimalPayload = {
            ...animal,
            nombre: this.textoObligatorio(animal.nombre),
            capa: this.textoObligatorio(animal.capa),
            sexo: this.textoObligatorio(animal.sexo),
            tamanyo: this.normalizarTamanyo(animal.tamanyo),
            procedencia: this.textoOpcional(animal.procedencia),
            fechaNacimiento: this.fechaApi(animal.fechaNacimiento),
            fechaIngreso: this.fechaApi(animal.fechaIngreso),
            numeroChip: this.textoOpcional(animal.numeroChip),
            comentarios: this.textoOpcional(animal.comentarios),
            ppp: animal.ppp ?? null
        };

        if (!payload.id) {
            delete payload.id;
        }

        return payload;
    }

    private textoObligatorio(value: string | null | undefined): string {
        return String(value ?? '').trim();
    }

    private textoOpcional(value: string | null | undefined): string | null {
        const texto = String(value ?? '').trim();
        return texto.length > 0 ? texto : null;
    }

    private normalizarTamanyo(value: string | null | undefined): string {
        const tamanyo = this.textoObligatorio(value);
        return tamanyo === 'Gigante' ? 'Grande' : tamanyo;
    }

    private fechaApi(value: Date | string | null | undefined): string | null {
        if (!value) return null;
        if (typeof value === 'string') return value.substring(0, 10);

        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
