import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Animal } from '../../models/animal.model';
import { paginatorIntlFactory } from '../../../../core/material/paginator-intl';

/**
 * @description Componente genérico y reutilizable para la visualización de listas de animales en formato tabla.
 * Soporta filtrado, paginación, ordenación y acciones personalizadas (editar, dar de baja, añadir).
 */
@Component({
  selector: 'app-tabla-xanimal',
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
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './tabla-xanimal.html',
  styleUrl: './tabla-xanimal.scss',
  providers: [{ provide: MatPaginatorIntl, useFactory: paginatorIntlFactory }]
})
export class TablaXanimal implements OnInit, OnChanges {

  /** Datos de origen para la tabla. Se espera un listado de objetos que cumplan con la interface Animal. */
  @Input() datos: Animal[] = [];

  /** Título principal que aparecerá en la cabecera de la sección. */
  @Input() titulo: string = '';

  /** Breve descripción o subtítulo que aparece bajo el título principal. */
  @Input() subtitulo: string = '';

  /** Listado de claves que definen las columnas a mostrar y su orden. */
  @Input() columnas: string[] = ['nombre', 'nombreRaza', 'nombreEspecie', 'nombreSituacion', 'acciones'];

  /** Permite ocultar el filtro de especie en vistas ya filtradas como perros o gatos. */
  @Input() mostrarFiltroEspecie = true;

  /** Evento emitido cuando el usuario desea añadir un nuevo registro. */
  @Output() onAdd: EventEmitter<void> = new EventEmitter<void>();

  /** Evento emitido cuando se pulsa el botón de editar en una fila. */
  @Output() onEdit: EventEmitter<Animal> = new EventEmitter<Animal>();

  /** Signal para controlar el estado de carga visual de la tabla. */
  @Input() cargando: boolean = false;

  /** Permite deshabilitar el botón de añadir para prevenir múltiples clics. */
  @Input() deshabilitarAdd: boolean = false;

  /** Evento emitido cuando se pulsa el botón de información de salud. */
  @Output() onSalud = new EventEmitter<Animal>();

  // Referencias a los componentes de infraestructura de la tabla de Material
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /** Fuente de datos optimizada para componentes de Angular Material. */
  dataSource: MatTableDataSource<Animal> = new MatTableDataSource<Animal>([]);
  filtros = {
    texto: '',
    especie: '',
    situacion: ''
  };

  /**
   * Inicialización del componente. Configura el origen de datos inicial.
   */
  ngOnInit(): void {
    this.actualizarDataSource();
  }

  /**
   * Reacciona a cambios en los @Input, específicamente para actualizar la tabla cuando 'datos' cambia.
   * @param changes Objeto con los cambios detectados por Angular.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos'] && !changes['datos'].firstChange) {
      this.actualizarDataSource();
    }
  }

  /**
   * Configura o refresca la fuente de datos, vinculando la paginación y la ordenación.
   */
  private actualizarDataSource(): void {
    this.dataSource = new MatTableDataSource(this.datos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (data: Animal, filter: string): boolean => {
      const filtros = JSON.parse(filter || '{}');
      const texto = this.normalizar([
        data.nombre,
        data.numeroChip,
        data.nombreRaza,
        data.nombreEspecie,
        data.nombreSituacion,
        data.nombreUbicacion
      ].join(' '));

      const coincideTexto = !filtros.texto || texto.includes(this.normalizar(filtros.texto));
      const coincideEspecie = !filtros.especie || this.normalizar(data.nombreEspecie) === filtros.especie;
      const coincideSituacion = !filtros.situacion || this.normalizar(data.nombreSituacion) === filtros.situacion;

      return coincideTexto && coincideEspecie && coincideSituacion;
    };
    this.aplicarFiltros();
  }

  /**
   * Aplica un filtro de texto a la tabla.
   * @param event Evento del teclado del input de búsqueda.
   */
  aplicarFiltro(event: Event): void {
    this.filtros.texto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  aplicarFiltroCampo(campo: 'especie' | 'situacion', valor: string): void {
    this.filtros[campo] = valor;
    this.aplicarFiltros();
  }

  get especiesDisponibles(): string[] {
    return this.opcionesUnicas('nombreEspecie');
  }

  get situacionesDisponibles(): string[] {
    return this.opcionesUnicas('nombreSituacion');
  }

  private aplicarFiltros(): void {
    this.dataSource.filter = JSON.stringify({
      texto: this.filtros.texto.trim(),
      especie: this.normalizar(this.filtros.especie),
      situacion: this.normalizar(this.filtros.situacion)
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private opcionesUnicas(campo: 'nombreEspecie' | 'nombreSituacion'): string[] {
    return [...new Set(this.datos.map(animal => animal[campo]).filter(Boolean) as string[])].sort();
  }

  private normalizar(valor: unknown): string {
    return String(valor ?? '').trim().toLowerCase();
  }

  /**
   * Notifica al componente padre el deseo de añadir un nuevo elemento.
   */
  emitirAdd(): void {
    this.onAdd.emit();
  }

  /**
   * Notifica al componente padre el deseo de editar un animal.
   * @param animal Objeto animal de la fila seleccionada.
   */
  emitirEdit(animal: Animal): void {
    this.onEdit.emit(animal);
  }

  emitirSalud(animal: Animal): void {
    this.onSalud.emit(animal);
  }
}
