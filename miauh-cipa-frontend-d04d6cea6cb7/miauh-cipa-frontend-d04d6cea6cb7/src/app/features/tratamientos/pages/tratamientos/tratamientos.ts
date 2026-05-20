import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { TratamientoService } from '../../data-access/tratamiento-api.service';
import { Tratamiento } from '../../models/tratamiento.model';
import { ModalGestionSalud } from '../../../animales/dialogs/modal-gestion-salud/modal-gestion-salud';
import { TratamientosStore } from '../../state/tratamientos.store';
import { AnimalService } from '../../../animales/data-access/animal-api.service';
import { paginatorIntlFactory } from '../../../../core/material/paginator-intl';

/**
 * @description Componente para la gestión visual de los tratamientos clínicos.
 * Permite listar, filtrar y visualizar el historial de intervenciones médicas realizadas a los animales.
 */
@Component({
  selector: 'app-tratamientos',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSelectModule
  ],
  templateUrl: './tratamientos.html',
  styleUrl: './tratamientos.scss',
  providers: [{ provide: MatPaginatorIntl, useFactory: paginatorIntlFactory }]
})
export class Tratamientos implements OnInit {

  // Inyección de dependencias mediante la función 'inject' (estilo moderno de Angular)
  private _tratamientoService: TratamientoService = inject(TratamientoService);
  private _animalService: AnimalService = inject(AnimalService);
  private _dialog: MatDialog = inject(MatDialog);
  public store = inject(TratamientosStore);

  /** Listado de columnas que se renderizarán en la tabla de tratamientos. */
  displayedColumns: string[] = ['tipo', 'medicamento', 'fecha', 'comentarios', 'acciones'];

  /** Fuente de datos para la tabla de Material. */
  dataSource: MatTableDataSource<Tratamiento> = new MatTableDataSource<Tratamiento>([]);
  filtros = {
    texto: '',
    tipo: '',
    estado: ''
  };

  // Referencias a utilidades de tabla
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /**
   * Ciclo de vida: Inicialización del componente.
   */
  ngOnInit(): void {
    this.cargarTratamientos();
  }

  /**
   * Recupera la lista completa de tratamientos desde el servicio y configura la tabla.
   */
  async cargarTratamientos(): Promise<void> {
    this.store.setLoading(true);
    try {
      const animales = await this._animalService.getAll();
      const data = (await Promise.all(
        animales.map((animal) => this._tratamientoService.getByAnimal(animal.id))
      )).flat();
      this.store.setTratamientos(data);
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.dataSource.filterPredicate = (data: Tratamiento, filter: string): boolean => {
        const filtros = JSON.parse(filter || '{}');
        const texto = this.normalizar([
          this.tipoTratamiento(data),
          this.nombreTratamiento(data),
          data.informacion
        ].join(' '));

        const coincideTexto = !filtros.texto || texto.includes(this.normalizar(filtros.texto));
        const coincideTipo = !filtros.tipo || this.normalizar(this.tipoTratamiento(data)) === filtros.tipo;
        const coincideEstado = !filtros.estado;

        return coincideTexto && coincideTipo && coincideEstado;
      };
      this.aplicarFiltros();

    } catch (error) {
      console.error('Error al cargar la lista de tratamientos:', error);
    } finally {
      this.store.setLoading(false);
    }
  }

  /**
   * Filtra los resultados de la tabla en tiempo real.
   * @param event Evento de teclado del input de búsqueda.
   */
  aplicarFiltro(event: Event): void {
    this.filtros.texto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  aplicarFiltroCampo(campo: 'tipo' | 'estado', valor: string): void {
    this.filtros[campo] = valor;
    this.aplicarFiltros();
  }

  get tiposDisponibles(): string[] {
    return [...new Set(this.store.tratamientos().map(t => this.tipoTratamiento(t)).filter(Boolean))].sort();
  }

  private aplicarFiltros(): void {
    this.dataSource.filter = JSON.stringify({
      texto: this.filtros.texto.trim(),
      tipo: this.normalizar(this.filtros.tipo),
      estado: this.filtros.estado
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private normalizar(valor: unknown): string {
    return String(valor ?? '').trim().toLowerCase();
  }

  /**
   * Notifica el deseo de crear un nuevo registro.
   */
  nuevoTratamiento(): void {
    const dialogRef = this._dialog.open(ModalGestionSalud, {
      width: '90vw',
      maxWidth: '1200px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarTratamientos();
      }
    });
  }


  /**
   * Acción para visualizar el detalle.
   * @param tratamiento Objeto del tratamiento seleccionado.
   */
  verDetalle(tratamiento: Tratamiento): void {
    console.log('Visualizando detalle de tratamiento:', tratamiento.id);
  }

  tipoTratamiento(tratamiento: Tratamiento): string {
    if (tratamiento.nombreTipoVacuna) return 'VACUNA';
    if (tratamiento.nombreTipoTest) return 'TEST';
    if (tratamiento.nombreTipoDesparasitacion) return 'DESPARASITACION';
    return tratamiento.tipo ?? 'TRATAMIENTO';
  }

  nombreTratamiento(tratamiento: Tratamiento): string {
    return tratamiento.nombreTipoVacuna
      ?? tratamiento.nombreTipoTest
      ?? tratamiento.nombreTipoDesparasitacion
      ?? tratamiento.informacion
      ?? 'Sin informacion';
  }

  notasTratamiento(tratamiento: Tratamiento): string {
    return tratamiento.medicacion ?? tratamiento.informacion ?? 'Sin observaciones';
  }
}
