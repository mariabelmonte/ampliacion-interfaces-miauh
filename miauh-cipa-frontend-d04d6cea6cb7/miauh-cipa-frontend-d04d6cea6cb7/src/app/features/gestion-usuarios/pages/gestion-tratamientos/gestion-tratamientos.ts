import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { AnimalService } from '../../../animales/data-access/animal-api.service';
import { Especie } from '../../../animales/models/especie.model';
import { GestionTratamientosService } from '../../data-access/gestion-tratamientos.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-gestion-tratamientos',
  standalone: true,
  imports: [
    MatIcon,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './gestion-tratamientos.html',
  styleUrl: './gestion-tratamientos.scss',
})
export class GestionTratamientos implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _animalService = inject(AnimalService);
  private readonly _gestionTratamientosService = inject(GestionTratamientosService);
  private readonly _snackBar = inject(MatSnackBar);

  public stepBotones = signal<boolean>(true);
  public stepVacuna = signal<boolean>(false);
  public stepDesparacitacion = signal<boolean>(false);
  public stepTest = signal<boolean>(false);

  public especies = signal<Especie[]>([]);

  public vacunaForm!: FormGroup;
  public desparasitacionForm!: FormGroup;
  public testForm!: FormGroup;

  ngOnInit(): void {
    this.initForms();
    this.loadEspecies();
  }

  private initForms(): void {
    this.vacunaForm = this._fb.group({
      nombre: ['', [Validators.required]],
      idEspecies: [[], [Validators.required]]
    });

    this.desparasitacionForm = this._fb.group({
      nombre: ['', [Validators.required]]
    });

    this.testForm = this._fb.group({
      nombre: ['', [Validators.required]],
      idEspecies: [[], [Validators.required]]
    });
  }

  private async loadEspecies(): Promise<void> {
    try {
      const data = await this._animalService.getEspecies();
      this.especies.set(data);
    } catch (error) {
      console.error('Error al cargar especies', error);
    }
  }

  public getEspecieId(especie: Especie): number {
    return especie.id ?? especie.idEspecie!;
  }

  public showStep(step: 'botones' | 'vacuna' | 'desparasitacion' | 'test'): void {
    this.stepBotones.set(step === 'botones');
    this.stepVacuna.set(step === 'vacuna');
    this.stepDesparacitacion.set(step === 'desparasitacion');
    this.stepTest.set(step === 'test');
  }

  public async saveVacuna(): Promise<void> {
    if (this.vacunaForm.invalid) return;
    try {
      await this._gestionTratamientosService.saveVacuna(this.buildTipoTratamientoPayload(this.vacunaForm));
      this._snackBar.open('Vacuna guardada correctamente', 'Cerrar', { duration: 3000 });
      this.vacunaForm.reset();
      this.showStep('botones');
    } catch (error) {
      this._snackBar.open('Error al guardar la vacuna', 'Cerrar', { duration: 3000 });
    }
  }

  public async saveDesparasitacion(): Promise<void> {
    if (this.desparasitacionForm.invalid) return;
    try {
      await this._gestionTratamientosService.saveDesparacitacion(this.desparasitacionForm.value);
      this._snackBar.open('Desparasitación guardada correctamente', 'Cerrar', { duration: 3000 });
      this.desparasitacionForm.reset();
      this.showStep('botones');
    } catch (error) {
      this._snackBar.open('Error al guardar la desparasitación', 'Cerrar', { duration: 3000 });
    }
  }

  public async saveTest(): Promise<void> {
    if (this.testForm.invalid) return;
    try {
      await this._gestionTratamientosService.saveTest(this.buildTipoTratamientoPayload(this.testForm));
      this._snackBar.open('Test guardado correctamente', 'Cerrar', { duration: 3000 });
      this.testForm.reset();
      this.showStep('botones');
    } catch (error) {
      this._snackBar.open('Error al guardar el test', 'Cerrar', { duration: 3000 });
    }
  }

  private buildTipoTratamientoPayload(form: FormGroup): { nombre: string; idEspecies: number[] } {
    const { nombre, idEspecies } = form.getRawValue();

    return {
      nombre,
      idEspecies: (idEspecies ?? []).filter((id: number | null | undefined): id is number => id != null)
    };
  }
}
