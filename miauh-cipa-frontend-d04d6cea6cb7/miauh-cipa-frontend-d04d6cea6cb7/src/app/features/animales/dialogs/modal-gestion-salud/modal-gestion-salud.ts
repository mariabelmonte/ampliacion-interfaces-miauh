import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule } from '@angular/material/core';
import { A11yModule } from '@angular/cdk/a11y';
import { TipoTratamientoOption, TratamientoService } from '../../../tratamientos/data-access/tratamiento-api.service';
import { Animal } from '../../models/animal.model';
import { TipoRegistroSalud, SaludForm, SaludPayload } from '../../../tratamientos/models/tratamiento.model';


@Component({
  selector: 'app-modal-gestion-salud',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule, MatButtonModule,
    MatDatepickerModule, MatNativeDateModule, MatIconModule, MatRadioModule, A11yModule
  ],
  templateUrl: './modal-gestion-salud.html',
})
export class ModalGestionSalud implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ModalGestionSalud>, { optional: true });
  private tratamientoService = inject(TratamientoService);
  public data = inject<{ animal: Animal }>(MAT_DIALOG_DATA, { optional: true }); // Recibe { animal: Animal }

  public tipoRegistro = signal<TipoRegistroSalud>('TRATAMIENTO');
  public guardando = signal(false);

  public vacunas = signal<TipoTratamientoOption[]>([]);
  public tests = signal<TipoTratamientoOption[]>([]);
  public desparasitaciones = signal<TipoTratamientoOption[]>([]);

  // Formulario principal
  public form = this.fb.group<SaludForm>({
    idAnimal: this.fb.control(null, Validators.required),
    fecha: this.fb.control(new Date(), Validators.required),
    informacion: this.fb.control(''),

    vacuna: this.fb.group({
      idTipoVacuna: [null as number | null]
    }),
    test: this.fb.group({
      idTipoTest: [null as number | null],
      resultado: [false]
    }),
    desparasitacion: this.fb.group({
      idTipoDesparasitacion: [null as number | null],
      medicacion: ['']
    })
  });

  ngOnInit() {
    if (this.data?.animal) {
      const idAnimal = this.data.animal.id ?? null;
      this.form.patchValue({ idAnimal });
      if (idAnimal) {
        this.cargarTiposTratamiento(idAnimal);
      }
    }
    this.cambiarTipo('TRATAMIENTO');
  }

  public cambiarTipo(tipo: TipoRegistroSalud): void {
    this.tipoRegistro.set(tipo);
    const informacion = this.form.controls.informacion;
    const vacuna = this.form.controls.vacuna.controls.idTipoVacuna;
    const test = this.form.controls.test.controls.idTipoTest;
    const desparasitacion = this.form.controls.desparasitacion.controls.idTipoDesparasitacion;
    const medicacion = this.form.controls.desparasitacion.controls.medicacion;

    informacion.clearValidators();
    vacuna.clearValidators();
    test.clearValidators();
    desparasitacion.clearValidators();
    medicacion.clearValidators();

    if (tipo === 'TRATAMIENTO') {
      informacion.setValidators([Validators.required]);
    }
    if (tipo === 'VACUNA') {
      vacuna.setValidators([Validators.required]);
    }
    if (tipo === 'TEST') {
      test.setValidators([Validators.required]);
    }
    if (tipo === 'DESPARASITACION') {
      desparasitacion.setValidators([Validators.required]);
      medicacion.setValidators([Validators.required, Validators.maxLength(100)]);
    }

    informacion.updateValueAndValidity();
    vacuna.updateValueAndValidity();
    test.updateValueAndValidity();
    desparasitacion.updateValueAndValidity();
    medicacion.updateValueAndValidity();
  }

  public get vacunasDisponibles(): TipoTratamientoOption[] {
    return this.vacunas();
  }

  public get testsDisponibles(): TipoTratamientoOption[] {
    return this.tests();
  }

  public campoInformacionRequerido(): boolean {
    return this.form.controls.informacion.hasError('required');
  }

  private async cargarTiposTratamiento(idAnimal: number): Promise<void> {
    try {
      const [vacunas, tests, desparasitaciones] = await Promise.all([
        this.tratamientoService.getTiposVacunaByAnimal(idAnimal),
        this.tratamientoService.getTiposTestByAnimal(idAnimal),
        this.tratamientoService.getTiposDesparasitacionByAnimal(idAnimal)
      ]);
      this.vacunas.set(vacunas);
      this.tests.set(tests);
      this.desparasitaciones.set(desparasitaciones);
    } catch (error) {
      console.error('Error al cargar tipos de tratamiento:', error);
    }
  }

  private crearPayload(): SaludPayload {
    const raw = this.form.getRawValue();
    const tipo = this.tipoRegistro();

    return {
      tipo,
      idAnimal: raw.idAnimal,
      fecha: raw.fecha as Date,
      informacion: tipo === 'TRATAMIENTO' ? raw.informacion : null,
      vacuna: tipo === 'VACUNA' ? raw.vacuna : null,
      test: tipo === 'TEST' ? raw.test : null,
      desparasitacion: tipo === 'DESPARASITACION' ? raw.desparasitacion : null
    };
  }

  public async guardar(): Promise<void> {
    if (this.form.invalid) return;

    this.guardando.set(true);
    try {
      await this.tratamientoService.saveSalud(this.crearPayload());
      this.dialogRef?.close(true);
    } catch (error) {
      console.error('Error al guardar el registro de salud:', error);
    } finally {
      this.guardando.set(false);
    }
  }
}
