import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AnimalService } from '../../data-access/animal-api.service';
import { TablaXanimal } from '../../components/tabla-xanimal/tabla-xanimal';
import { ModalXanimal } from '../../dialogs/modal-xanimal/modal-xanimal';
import { ModalGestionSalud } from '../../dialogs/modal-gestion-salud/modal-gestion-salud';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-gatos',
  standalone: true,
  imports: [TablaXanimal, MatDialogModule],
  templateUrl: './gatos.html',
  styleUrl: './gatos.scss',
})
export class Gato implements OnInit {
  private _animalService: AnimalService = inject(AnimalService);
  private _dialog: MatDialog = inject(MatDialog);

  public listaGatos = signal<Animal[]>([]);
  public cargando = signal<boolean>(false);
  public modalAbierto = signal<boolean>(false);

  public columnasGato: string[] = ['imagen', 'nombre', 'nombreRaza', 'nombreSituacion', 'acciones'];

  ngOnInit(): void {
    this.cargarGatos();
  }

  async cargarGatos(): Promise<void> {
    this.cargando.set(true);
    try {
      const data: Animal[] = await this._animalService.getGatos();
      this.listaGatos.set(data.filter(animal => this.esEspecie(animal, 'gato')));
    } catch (error: unknown) {
      console.error('Error al cargar los gatos:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  abrirEditor(gato: Animal): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalXanimal, {
      width: '90vw',
      maxWidth: '1200px',
      data: gato
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarGatos();
      }
    });
  }

  abrirGestionSalud(gato: Animal): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalGestionSalud, {
      width: '90vw',
      maxWidth: '1200px',
      data: { animal: gato }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarGatos();
      }
    });
  }

  async nuevoGato(): Promise<void> {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    let especieId: number | undefined = undefined;
    try {
      const especies = await this._animalService.getEspecies();
      const especie = especies.find(e => e.nombre.toLowerCase() === 'gato');
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
        this.cargarGatos();
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
