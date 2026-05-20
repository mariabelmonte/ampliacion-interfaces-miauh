import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AdoptanteService } from '../../data-access/adoptante-api.service';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-modal-adoptante',
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, A11yModule
  ],
  templateUrl: './modal-adoptante.html',
  styleUrl: './modal-adoptante.scss',
})
export class ModalAdoptante implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _adoptanteService = inject(AdoptanteService);
  private readonly _dialogRef = inject(MatDialogRef<ModalAdoptante>);
  public data = inject(MAT_DIALOG_DATA);

  public esEdicion = signal<boolean>(false);
  public form: FormGroup = this._fb.group({
    id: [null],
    identificacion: ['', [Validators.required, Validators.pattern('^[0-9]{8}[A-Z]$')]],
    nombre: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefonoAdoptante: ['', [Validators.required]],
    telefonoSecundario: [''],
    // Dirección anidada según estructura del backend
    direccion: this._fb.group({
      id: [null],
      via: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      bloque: [''],
      piso: [''],
      puerta: [''],
      codigoPostal: ['', [Validators.required, Validators.minLength(5)]],
      pais: ['', [Validators.required]],
      municipio: ['', [Validators.required]],
      provincia: ['', [Validators.required]]
    }),
    observaciones: ['']
  });

  async ngOnInit(): Promise<void> {
    if (this.data && this.data.id) {
      this.esEdicion.set(true);
      try {
        const fullData = await this._adoptanteService.getById(this.data.id);
        this.form.patchValue(fullData);
      } catch (error) {
        console.error('Error fetching adoptante details:', error);
        // Fallback to data passed if fetch fails
        this.form.patchValue(this.data);
      }
    }
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      await this._adoptanteService.save(this.form.getRawValue());
      this._dialogRef.close(true);
    } catch (error) {
      console.error('Error al guardar adoptante:', error);
    }
  }

  cancelar(): void {
    this._dialogRef.close(false);
  }
}
