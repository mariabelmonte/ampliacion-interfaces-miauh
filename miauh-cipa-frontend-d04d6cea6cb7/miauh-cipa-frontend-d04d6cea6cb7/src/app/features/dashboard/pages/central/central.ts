import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AnimalService } from '../../../animales/data-access/animal-api.service';
import { Animal } from '../../../animales/models/animal.model';
import { CalendarioApiService } from '../../../calendario/data-access/calendario-api.service';
import { Evento } from '../../../calendario/models/evento.model';
import { Calendario } from '../../../calendario/pages/calendario/calendario';
import { CalendarioStore } from '../../../calendario/state/calendario.store';
import { TransaccionService } from '../../../transacciones/data-access/transaccion-api.service';
import { Transaccion } from '../../../transacciones/models/transaccion.model';
import { DashboardStore } from '../../state/dashboard.store';

@Component({
  selector: 'app-central',
  standalone: true,
  imports: [MatCardModule, MatIconModule, CommonModule, Calendario],
  templateUrl: './central.html',
  styleUrl: './central.scss',
})
export class Central implements OnInit {
  public store = inject(CalendarioStore);
  public dashboardStore = inject(DashboardStore);
  private api = inject(CalendarioApiService);
  private animalService = inject(AnimalService);
  private transaccionService = inject(TransaccionService);

  ngOnInit(): void {
    this.cargarResumen();

    if (this.store.eventos().length === 0) {
      this.api.getEventos().subscribe({
        next: (eventos: Evento[]) => this.store.setEventos(eventos),
        error: (err: unknown) => console.error('Error cargando eventos en dashboard:', err),
      });
    }
  }

  completarTarea(id: number): void {
    this.api.patchCompletado(id).subscribe({
      next: () => this.store.marcarComoCompletado(id),
    });
  }

  private async cargarResumen(): Promise<void> {
    this.dashboardStore.setLoading(true);

    try {
      const animales = await this.animalService.getAll();
      this.dashboardStore.setContadores({
        animales: animales.length,
        adopciones: this.countBySituacion(animales, 'adoptado'),
        tratamiento: this.countBySituacion(animales, 'tratamiento'),
        acogida: this.countBySituacion(animales, 'acogida'),
        recientes: this.getAnimalesRecientes(animales),
      });
    } catch (error) {
      console.error('Error cargando resumen de animales:', error);
    }

    try {
      const transacciones = await this.transaccionService.getAllTransacciones();
      this.dashboardStore.setContadores({
        pendientes: this.getAdopcionesPendientes(transacciones),
      });
    } catch (error) {
      console.error('Error cargando resumen de transacciones:', error);
    } finally {
      this.dashboardStore.setLoading(false);
    }
  }

  private countBySituacion(animales: Animal[], situacion: string): number {
    return animales.filter((animal) => this.getSituacion(animal).includes(situacion)).length;
  }

  private getSituacion(animal: Animal): string {
    return this.normalizar(animal.nombreSituacion ?? animal.situacion?.nombre ?? '');
  }

  private getAnimalesRecientes(animales: Animal[]): string {
    const recientes = [...animales]
      .filter((animal) => Boolean(animal.fechaIngreso))
      .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
      .slice(0, 3)
      .map((animal) => animal.nombre)
      .filter(Boolean);

    return recientes.length ? recientes.join(', ') : 'No hay animales registrados';
  }

  private getAdopcionesPendientes(transacciones: Transaccion[]): string {
    const pendientes = transacciones.filter(
      (transaccion) => transaccion.tipo === 'ADOPCION' && !transaccion.fechaSalida
    );

    return pendientes.length ? `${pendientes.length} pendientes` : 'No hay adopciones pendientes';
  }

  private normalizar(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
