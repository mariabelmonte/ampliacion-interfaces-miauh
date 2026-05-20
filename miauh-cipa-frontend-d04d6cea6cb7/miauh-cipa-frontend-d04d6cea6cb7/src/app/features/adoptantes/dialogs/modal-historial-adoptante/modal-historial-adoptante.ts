import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AnimalVinculado } from '../../../../shared/models/operacion.model';
import { AdoptanteRepository } from '../../data-access/adoptante.repository';

@Component({
  selector: 'app-modal-historial-adoptante',
  imports: [
    MatDialogModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './modal-historial-adoptante.html',
  styleUrl: './modal-historial-adoptante.scss',
})
export class ModalHistorialAdoptante implements OnInit {

  private readonly _adoptanteRepository = inject(AdoptanteRepository);
  public data = inject(MAT_DIALOG_DATA);

  public animales = signal<AnimalVinculado[]>([]);
  public dataSource = new MatTableDataSource<AnimalVinculado>([]);
  public columnas: string[] = ['nombre', 'tipo', 'fechas', 'observaciones'];
  filtros = {
    texto: '',
    tipo: ''
  };

  async ngOnInit() {
    this.dataSource.filterPredicate = (data: AnimalVinculado, filter: string) => {
      const filtros = JSON.parse(filter || '{}');
      const texto = this.normalizar([
        data.nombre,
        data.numeroChip,
        data.tipoOperacion,
        data.observaciones
      ].join(' '));

      const coincideTexto = !filtros.texto || texto.includes(this.normalizar(filtros.texto));
      const coincideTipo = !filtros.tipo || this.normalizar(data.tipoOperacion) === filtros.tipo;

      return coincideTexto && coincideTipo;
    };

    try {
      const idAdoptante = this.data?.idAdoptante ?? this.data?.id;
      const res = idAdoptante ? await this._adoptanteRepository.getHistorialAnimales(idAdoptante) : [];
      this.animales.set(res);
      this.dataSource.data = res;
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando historial del adoptante', error);
    }
  }

  aplicarFiltroTexto(event: Event): void {
    this.filtros.texto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  aplicarFiltroTipo(valor: string): void {
    this.filtros.tipo = valor;
    this.aplicarFiltros();
  }

  get tiposDisponibles(): string[] {
    return [...new Set(this.animales().map(animal => animal.tipoOperacion).filter(Boolean))].sort();
  }

  private aplicarFiltros(): void {
    this.dataSource.filter = JSON.stringify({
      texto: this.filtros.texto.trim(),
      tipo: this.normalizar(this.filtros.tipo)
    });
  }

  private normalizar(valor: unknown): string {
    return String(valor ?? '').trim().toLowerCase();
  }
}
