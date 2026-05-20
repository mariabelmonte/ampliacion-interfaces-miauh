import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TransaccionService } from '../../data-access/transaccion-api.service';
import { Transaccion } from '../../models/transaccion.model';
import { ModalTransacciones } from '../../dialogs/modal-transacciones/modal-transacciones';
import { TransaccionesStore } from '../../state/transacciones.store';
import { paginatorIntlFactory } from '../../../../core/material/paginator-intl';


@Component({
  selector: 'app-transacciones',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatDialogModule, MatChipsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './transacciones.html',
  styleUrl: './transacciones.scss',
  providers: [{ provide: MatPaginatorIntl, useFactory: paginatorIntlFactory }]
})
export class Transacciones implements OnInit {
  private readonly _service = inject(TransaccionService);
  private readonly _dialog = inject(MatDialog);
  public store = inject(TransaccionesStore);

  // Material Table
  displayedColumns = ['tipo', 'animal', 'adoptante', 'fechas', 'acciones'];
  dataSource = new MatTableDataSource<Transaccion>();
  filtros = {
    texto: '',
    estado: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.store.setLoading(true);
    try {
      const data = await this._service.getAllTransacciones();
      this.store.setTransacciones(data);
      this.actualizarTabla();
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    } finally {
      this.store.setLoading(false);
    }
  }

  actualizarTabla() {
    this.dataSource.data = this.store.transaccionesFiltradas();
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Transaccion, filter: string) => {
      const filtros = JSON.parse(filter || '{}');
      const texto = this.normalizar([
        data.tipo,
        data.nombreAnimal,
        data.nombreAdoptante,
        data.telefonoAdoptante,
        data.observaciones
      ].join(' '));
      const estaActiva = !data.fechaFin;

      const coincideTexto = !filtros.texto || texto.includes(this.normalizar(filtros.texto));
      const coincideEstado = !filtros.estado || (filtros.estado === 'activa' ? estaActiva : !estaActiva);

      return coincideTexto && coincideEstado;
    };
    this.aplicarFiltros();
  }

  aplicarFiltroTabla(event: Event) {
    this.filtros.texto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  aplicarFiltroEstado(valor: string) {
    this.filtros.estado = valor;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.dataSource.filter = JSON.stringify({
      texto: this.filtros.texto.trim(),
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
   * Abre el modal para crear o editar
   * @param tipo 'ADOPCION' | 'ACOGIDA'
   * @param item Si viene, es edición. Si no, es nuevo.
   */
  async abrirModal(tipo: 'ADOPCION' | 'ACOGIDA', item?: Transaccion) {
    let datosCompletos = item;

    // Si es edición (viene un item), buscamos el detalle completo
    if (item && item.id) {
      this.store.setLoading(true);
      try {
        datosCompletos = await this._service.getById(item.id, tipo);
      } catch (error) {
        console.error("Error al obtener detalle:", error);
      } finally {
        this.store.setLoading(false);
      }
    }

    // Ahora abrimos el modal con "datosCompletos" que ya incluye teléfono y observaciones
    const dialogRef = this._dialog.open(ModalTransacciones, {
      width: '90vw',
      maxWidth: '1200px',
      data: { tipo, item: datosCompletos }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarDatos();
    });
  }

  cambiarFiltro(nuevoFiltro: string) {
    this.store.setFiltro(nuevoFiltro);
    this.actualizarTabla();
  }
}
