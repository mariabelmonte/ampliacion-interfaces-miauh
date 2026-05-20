import { Component, inject, signal, OnInit } from '@angular/core';
import { AnimalService } from '../../data-access/animal-api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TablaXanimal } from '../../components/tabla-xanimal/tabla-xanimal';
import { ModalXanimal } from '../../dialogs/modal-xanimal/modal-xanimal';
import { ModalGestionSalud } from '../../dialogs/modal-gestion-salud/modal-gestion-salud';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-perro',
  standalone: true,
  imports: [TablaXanimal, MatDialogModule],
  templateUrl: './perro.html',
  styleUrl: './perro.scss',
})
export class Perro implements OnInit {
  private _animalService: AnimalService = inject(AnimalService);
  private _dialog: MatDialog = inject(MatDialog);

  listaPerros = signal<Animal[]>([]);
  cargando = signal<boolean>(false);
  modalAbierto = signal<boolean>(false);

  columnasPerro: string[] = ['imagen', 'nombre', 'nombreRaza', 'nombreSituacion', 'acciones'];

  ngOnInit(): void {
    this.cargarPerros();
  }

  async cargarPerros(): Promise<void> {
    this.cargando.set(true);
    try {
      const data: Animal[] = await this._animalService.getPerros();
      this.listaPerros.set(data.filter(animal => this.esEspecie(animal, 'perro')));
    } catch (error: unknown) {
      console.error('Error al cargar los perros:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  abrirEditor(perro: Animal): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalXanimal, {
      width: '90vw',
      maxWidth: '1200px',
      data: perro
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarPerros();
      }
    });
  }

  abrirGestionSalud(perro: Animal): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalGestionSalud, {
      width: '90vw',
      maxWidth: '1200px',
      data: { animal: perro }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarPerros();
      }
    });
  }

  async nuevoPerro(): Promise<void> {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    let especieId: number | undefined = undefined;
    try {
      const especies = await this._animalService.getEspecies();
      const especie = especies.find(e => e.nombre.toLowerCase() === 'perro');
      especieId = especie?.idEspecie ?? especie?.id;
    } catch (e: unknown) {
      console.warn('No se pudo pre-cargar el ID de especie', e);
    }

    const dialogRef = this._dialog.open(ModalXanimal, {
      width: '90vw',
      maxWidth: '1200px',
      data: { especieId }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarPerros();
      }
    });
  }

  private esEspecie(animal: Animal, especie: string): boolean {
    const nombreEspecie = animal.nombreEspecie ?? animal.especie?.nombre ?? '';
    return this.normalizar(nombreEspecie) === this.normalizar(especie);
  }

  private normalizar(valor: string): string {
    return valor.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
