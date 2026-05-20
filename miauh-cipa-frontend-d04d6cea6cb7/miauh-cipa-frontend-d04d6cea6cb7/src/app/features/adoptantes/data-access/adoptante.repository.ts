import { Injectable, inject } from '@angular/core';
import { AdoptanteService } from './adoptante-api.service';
import { AnimalVinculado } from '../../../shared/models/operacion.model';

@Injectable({
    providedIn: 'root'
})
export class AdoptanteRepository {
    private readonly _api = inject(AdoptanteService);

    /**
     * Obtiene el historial completo de animales vinculados a un adoptante,
     * uniendo las adopciones y las acogidas.
     */
    async getHistorialAnimales(id: number): Promise<AnimalVinculado[]> {
        const [adopciones, acogidas] = await Promise.all([
            this._api.getAdopcionesByAdoptante(id),
            this._api.getAcogidasByAdoptante(id)
        ]);

        const adopcionesMapeadas = (adopciones || []).map(a => this.normalizarHistorial(a, 'ADOPCION'));

        const acogidasMapeadas = (acogidas || []).map(a => this.normalizarHistorial(a, 'ACOGIDA'));

        const historial = [...adopcionesMapeadas, ...acogidasMapeadas].sort((a, b) => {
            const dateA = new Date(a.fechaInicio ?? a.fechaFin ?? a.fechaSalida ?? 0).getTime();
            const dateB = new Date(b.fechaInicio ?? b.fechaFin ?? b.fechaSalida ?? 0).getTime();
            return dateB - dateA;
        });

        return historial;
    }

    private normalizarHistorial(item: AnimalVinculado, tipo: 'ADOPCION' | 'ACOGIDA'): AnimalVinculado {
        return {
            ...item,
            nombre: item.nombre ?? item.nombreAnimal ?? 'Animal sin nombre',
            numeroChip: item.numeroChip ?? '',
            tipoOperacion: item.tipoOperacion || tipo,
            fechaInicio: item.fechaInicio ?? (tipo === 'ADOPCION' ? item.fechaSalida : null),
            fechaFin: item.fechaFin ?? item.fechaSalida ?? null
        };
    }
}
