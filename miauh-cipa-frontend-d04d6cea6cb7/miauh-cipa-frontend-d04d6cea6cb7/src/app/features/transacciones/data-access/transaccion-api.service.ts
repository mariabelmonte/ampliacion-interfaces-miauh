import { inject, Injectable } from "@angular/core";
import { HttpService } from "../../../core/services/http.service";
import { RUTAS } from "../../../core/config/endpoints";
import { Transaccion, TransaccionFormValue, TransaccionPayload } from "../models/transaccion.model";
import { Adoptante } from "../../adoptantes/models/adoptantes.model";
import { Animal } from "../../animales/models/animal.model";

@Injectable({ providedIn: 'root' })
export class TransaccionService {
  private readonly _http = inject(HttpService);

  async getById(id: number, tipo: 'ACOGIDA' | 'ADOPCION'): Promise<Transaccion> {
    const url = tipo === 'ADOPCION' ? RUTAS.transacciones.findByIdAdopcion : RUTAS.transacciones.findByIdAcogida;
    const item = await this._http.apiGet<Transaccion>(url.replace('{id}', id.toString()), {});
    return this.normalizarTransaccion(item, tipo);
  }

  /**
   * Obtiene todas las transacciones (acogidas y adopciones)
   * @returns Promise<Transaccion[]>
   */
  async getAllTransacciones(): Promise<Transaccion[]> {
    const acogidas = await this._http.apiGet<Transaccion[]>(RUTAS.transacciones.findAllAcogidas, {});
    const adopciones = await this._http.apiGet<Transaccion[]>(RUTAS.transacciones.findAllAdopciones, {});

    return [
      ...acogidas.map(a => this.normalizarTransaccion(a, 'ACOGIDA')),
      ...adopciones.map(a => this.normalizarTransaccion(a, 'ADOPCION'))
    ];
  }

  // Endpoints para los Selects del modal
  getAnimalesDisponibles(): Promise<Animal[]> {
    return this._http.apiGet<Animal[]>(RUTAS.transacciones.findAnimalesDisponibles, {});
  }

  getAdoptantes(): Promise<Adoptante[]> {
    return this._http.apiGet<Adoptante[]>(RUTAS.adoptantes.findAll, {});
  }


  /**
 * Método polimórfico para guardar o actualizar
 * @param data Datos del formulario
 * @param tipo 'ADOPCION' | 'ACOGIDA'
 */
  async guardarTransaccion(data: TransaccionFormValue, tipo: 'ADOPCION' | 'ACOGIDA'): Promise<Transaccion> {
    const idAdoptante = typeof data.adoptante === 'number' ? data.adoptante : data.adoptante.id;
    const idAnimal = typeof data.animal === 'number' ? data.animal : data.animal.id;

    const payload: TransaccionPayload = {
      idAdoptante,
      idAnimal,
      observaciones: data.observaciones
    };

    if (data.id) payload.id = data.id;

    let endpoint: string;

    if (tipo === 'ADOPCION') {
      endpoint = RUTAS.transacciones.saveAdopcion;
      payload.fechaInicio = this.toApiDate(data.fechaInicio);
      payload.fechaSalida = this.toApiDate(data.fechaFin);
    } else {
      endpoint = RUTAS.transacciones.saveAcogida;
      payload.fechaInicio = this.toApiDate(data.fechaInicio);
      payload.fechaFin = this.toApiDate(data.fechaFin);
    }

    return this._http.apiPost<Transaccion, TransaccionPayload>(endpoint, payload);
  }

  private normalizarTransaccion(item: Transaccion, tipo: 'ACOGIDA' | 'ADOPCION'): Transaccion {
    return {
      ...item,
      tipo,
      fechaInicio: item.fechaInicio ?? item.fechaAdopcion ?? item.fechaSalida ?? null,
      fechaFin: item.fechaFin ?? item.fechaSalida ?? null,
      telefonoAdoptante: item.telefonoAdoptante ?? (item as Transaccion & { telefono?: string }).telefono ?? ''
    };
  }

  private toApiDate(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
