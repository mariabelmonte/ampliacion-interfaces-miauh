import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TablaXanimal } from '../../components/tabla-xanimal/tabla-xanimal';
import { ModalXanimal } from '../../dialogs/modal-xanimal/modal-xanimal';
import { ModalGestionSalud } from '../../dialogs/modal-gestion-salud/modal-gestion-salud';
import { Animal } from '../../models/animal.model';
import { AnimalService } from '../../data-access/animal-api.service';
import { AnimalesStore } from '../../state/animales.store';

@Component({
  selector: 'app-animales',
  standalone: true,
  imports: [TablaXanimal, MatDialogModule],
  templateUrl: './animales.html',
  styleUrl: './animales.scss',
})
export class Animales implements OnInit {
  private _animalService: AnimalService = inject(AnimalService);
  private _dialog: MatDialog = inject(MatDialog);
  public store = inject(AnimalesStore);

  modalAbierto = signal<boolean>(false);
  columnasAnimal: string[] = ['nombre', 'nombreRaza', 'nombreEspecie', 'nombreSituacion', 'acciones'];

  ngOnInit(): void {
    this.cargarAnimales();
  }

  async cargarAnimales(): Promise<void> {
    this.store.setLoading(true);
    try {
      const data: Animal[] = await this._animalService.getAll();
      this.store.setListaAnimales(data);
    } catch (error: unknown) {
      console.error('Error al cargar los animales:', error);
    } finally {
      this.store.setLoading(false);
    }
  }

  abrirEditor(animal: Animal): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalXanimal, {
      width: '90vw',
      maxWidth: '1200px',
      data: animal
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarAnimales();
      }
    });
  }

  abrirGestionSalud(animal: Animal): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalGestionSalud, {
      width: '90vw',
      maxWidth: '1200px',
      data: { animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarAnimales();
      }
    });
  }

  nuevoAnimal(): void {
    if (this.modalAbierto()) return;
    this.modalAbierto.set(true);

    const dialogRef = this._dialog.open(ModalXanimal, {
      width: '90vw',
      maxWidth: '1200px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.modalAbierto.set(false);
      if (result) {
        this.cargarAnimales();
      }
    });
  }
}
