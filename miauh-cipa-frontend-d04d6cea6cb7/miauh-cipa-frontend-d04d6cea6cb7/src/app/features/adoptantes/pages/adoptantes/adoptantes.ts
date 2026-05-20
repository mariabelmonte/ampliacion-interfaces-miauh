import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Adoptante } from '../../models/adoptantes.model';
import { AdoptanteService } from '../../data-access/adoptante-api.service';
import { ModalAdoptante } from '../../dialogs/modal-adoptante/modal-adoptante';
import { ModalHistorialAdoptante } from '../../dialogs/modal-historial-adoptante/modal-historial-adoptante';
import { AdoptantesStore } from '../../state/adoptantes.store';
import { paginatorIntlFactory } from '../../../../core/material/paginator-intl';

@Component({
  selector: 'app-adoptantes',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './adoptantes.html',
  styleUrl: './adoptantes.scss',
  providers: [{ provide: MatPaginatorIntl, useFactory: paginatorIntlFactory }]
})
export class Adoptantes implements OnInit {
  private readonly _adoptanteService: AdoptanteService = inject(AdoptanteService);

  // Para futuras funcionalidades relacionadas con la gestión de adoptantes.
  private _dialog: MatDialog = inject(MatDialog);
  public store = inject(AdoptantesStore);

  public modalAbierto = signal<boolean>(false);

  displayedColumns = ['nombreCompleto', 'identificacion', 'contacto', 'animales', 'acciones'];
  dataSource = new MatTableDataSource<Adoptante>();
  filtros = {
    texto: '',
    vinculacion: ''
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  ngOnInit(): void {
    this.cargarAdoptantes();
  }

  async cargarAdoptantes(): Promise<void> {
    this.store.setLoading(true);
    try {
      const data = await this._adoptanteService.getAll();
      this.store.setAdoptantes(data);
      this.actualizarTabla();
    } catch (error) {
      console.error('Error cargando adoptantes', error);
    } finally {
      this.store.setLoading(false);
    }
  }

  actualizarTabla() {
    this.dataSource.data = this.store.adoptantes();
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: Adoptante, filter: string) => {
      const filtros = JSON.parse(filter || '{}');
      const texto = this.normalizar([
        data.nombreCompleto,
        data.identificacion,
        data.telefono1,
        data.telefonoAdoptante,
        data.email,
        data.direccion?.municipio
      ].join(' '));
      const totalAnimales = data.totalAnimales ?? 0;

      const coincideTexto = !filtros.texto || texto.includes(this.normalizar(filtros.texto));
      const coincideVinculacion =
        !filtros.vinculacion ||
        (filtros.vinculacion === 'con' ? totalAnimales > 0 : totalAnimales === 0);

      return coincideTexto && coincideVinculacion;
    };
    this.aplicarFiltros();
  }

  aplicarFiltroTabla(event: Event) {
    this.filtros.texto = (event.target as HTMLInputElement).value;
    this.aplicarFiltros();
  }

  aplicarFiltroCampo(valor: string) {
    this.filtros.vinculacion = valor;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    this.dataSource.filter = JSON.stringify({
      texto: this.filtros.texto.trim(),
      vinculacion: this.filtros.vinculacion
    });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private normalizar(valor: unknown): string {
    return String(valor ?? '').trim().toLowerCase();
  }

  verHistorial(adoptante: Adoptante): void {
    console.log('Ver historial de:', adoptante);
    const dialogRef = this._dialog.open(ModalHistorialAdoptante, {
      width: '90vw',
      maxWidth: '1200px',
      data: adoptante || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarAdoptantes();
    });

  }

  editarPersona(adoptante?: Adoptante) {
    const dialogRef = this._dialog.open(ModalAdoptante, {
      width: '90vw',
      maxWidth: '1200px',
      data: adoptante || null // Si no pasamos nada, es "Nuevo"
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarAdoptantes();
    });
  }

  nuevaPersona(): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalAdoptante, {
      width: '90vw',
      maxWidth: '1200px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarAdoptantes();
      }
    });
  }
}
