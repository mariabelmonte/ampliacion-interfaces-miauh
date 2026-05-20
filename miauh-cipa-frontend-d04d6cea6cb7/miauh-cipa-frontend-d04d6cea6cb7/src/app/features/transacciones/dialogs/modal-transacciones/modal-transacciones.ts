import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TransaccionService } from '../../data-access/transaccion-api.service';
import { Adoptante } from '../../../adoptantes/models/adoptantes.model';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';
import { Animal } from '../../../animales/models/animal.model';
import { Transaccion } from '../../models/transaccion.model';

interface ModalTransaccionData {
  tipo: 'ADOPCION' | 'ACOGIDA';
  item?: Transaccion & {
    fechaAdopcion?: Date | string;
    telefono?: string;
  };
}

@Component({
  selector: 'app-modal-transacciones',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, A11yModule],
  templateUrl: './modal-transacciones.html',
  styleUrl: './modal-transacciones.scss',
})
export class ModalTransacciones implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _service = inject(TransaccionService);
  private readonly _dialogRef = inject(MatDialogRef<ModalTransacciones, boolean>);
  public data = inject<ModalTransaccionData>(MAT_DIALOG_DATA);
  public showSpinner = signal<boolean>(false);

  public animalesDisponibles = signal<Animal[]>([]);
  public adoptantes = signal<Adoptante[]>([]);
  public titulo = signal<string>('');

  public form: FormGroup = this._fb.group({
    id: [null],
    adoptante: [null, [Validators.required]],
    animal: [null, [Validators.required]],
    fechaInicio: [new Date(), [Validators.required]],
    fechaFin: [null],
    observaciones: ['', [Validators.maxLength(255)]]
  });

  async ngOnInit(): Promise<void> {
    this.showSpinner.set(true);
    this.titulo.set(this.data.item ? `Editar ${this.data.tipo}` : `Nueva ${this.data.tipo}`);

    try {
      const [anis, adops] = await Promise.all([
        this._service.getAnimalesDisponibles(),
        this._service.getAdoptantes()
      ]);

      this.animalesDisponibles.set(anis);
      this.adoptantes.set(adops);

      if (this.data.item) {
        const item = this.data.item;

        const fechaInicioNormalizada = item.fechaInicio || item.fechaAdopcion;
        const fechaFinNormalizada = item.fechaFin || item.fechaSalida;

        this.form.patchValue({
          id: item.id,
          adoptante: item.idAdoptante,
          animal: item.idAnimal,
          fechaInicio: this.toDateInputValue(fechaInicioNormalizada),
          fechaFin: this.toDateInputValue(fechaFinNormalizada),
          observaciones: item.observaciones
        });
      }
    } catch (error) {
      console.error("Error al precargar datos del modal", error);
    } finally {
      this.showSpinner.set(false);
    }
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      // Llamamos al servicio pasando el tipo que recibimos en el MAT_DIALOG_DATA
      await this._service.guardarTransaccion(this.form.value, this.data.tipo);

      // Si todo va bien, cerramos devolviendo true para que la lista se refresque
      this._dialogRef.close(true);

      // Opcional: Podrías meter aquí un SnackBar de "Guardado con éxito"
    } catch (error) {
      console.error("Error al guardar la transacción:", error);
      // Aquí podrías gestionar el error (ej: el animal ya no está disponible)
    }
  }

  private toDateInputValue(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value.substring(0, 10);

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
