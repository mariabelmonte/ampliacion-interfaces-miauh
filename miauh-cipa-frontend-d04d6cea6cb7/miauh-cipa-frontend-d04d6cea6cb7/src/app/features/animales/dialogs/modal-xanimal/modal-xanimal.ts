import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { AnimalService } from '../../data-access/animal-api.service';
import { Especie } from '../../models/especie.model';
import { Raza } from '../../models/raza.model';
import { Situacion } from '../../models/situacion.model';
import { Ubicacion } from '../../models/ubicacion.model';
import { Animal, AnimalForm, AnimalPayload } from '../../models/animal.model';
import { TratamientoService } from '../../../tratamientos/data-access/tratamiento-api.service';
import { Tratamiento } from '../../../tratamientos/models/tratamiento.model';
import { ModalGestionSalud } from '../modal-gestion-salud/modal-gestion-salud';

type AnimalDialogData = Partial<Animal & AnimalPayload>;

@Component({
  selector: 'app-modal-xanimal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    A11yModule
  ],
  templateUrl: './modal-xanimal.html',
  styleUrl: './modal-xanimal.scss',
})
export class ModalXanimal implements OnInit {

  private fb: FormBuilder = inject(FormBuilder);
  private _animalService: AnimalService = inject(AnimalService);
  private _tratamientoService: TratamientoService = inject(TratamientoService);
  private _dialog: MatDialog = inject(MatDialog);
  private dialogRef: MatDialogRef<ModalXanimal> = inject(MatDialogRef<ModalXanimal>);
  private destroyRef = inject(DestroyRef);


  /** Datos recibidos al abrir el diálogo (p. ej. especie inicial) */
  protected data = inject<AnimalDialogData>(MAT_DIALOG_DATA);

  // Señales para los listados de los selectores
  especies = signal<Especie[]>([]);
  razas = signal<Raza[]>([]);
  ubicaciones = signal<Ubicacion[]>([]);
  situaciones = signal<Situacion[]>([]);

  public esEdicion = signal<boolean>(false);
  public animalActual = signal<Animal | null>(null);
  public tratamientos = signal<Tratamiento[]>([]);
  public cargandoTratamientos = signal<boolean>(false);
  public columnasTratamientos: string[] = ['tipo', 'medicamento', 'fecha', 'comentarios'];

  /** Estado reactivo para determinar si el animal es un perro y mostrar campos extra */
  esPerro = signal<boolean>(false);

  /** Grupo de formulario fuertemente tipado */
  form: FormGroup<AnimalForm> = this.fb.group<AnimalForm>({
    id: new FormControl(null),
    nombre: new FormControl('', { validators: [Validators.required, Validators.minLength(2)], nonNullable: false }),
    capa: new FormControl('', { validators: [Validators.required], nonNullable: false }),
    sexo: new FormControl('M', { validators: [Validators.required], nonNullable: false }),
    tamanyo: new FormControl('Mediano', { validators: [Validators.required], nonNullable: false }),
    procedencia: new FormControl(''),
    fechaNacimiento: new FormControl(null),
    fechaIngreso: new FormControl(new Date(), { validators: [Validators.required], nonNullable: false }),
    esterilizado: new FormControl(false),
    numeroChip: new FormControl(''),
    comentarios: new FormControl(''),

    especieId: new FormControl(null, { validators: [Validators.required] }),
    razaId: new FormControl(null, { validators: [Validators.required] }),
    ubicacionId: new FormControl(null, { validators: [Validators.required] }),
    situacionId: new FormControl(null, { validators: [Validators.required] }),

    ppp: new FormControl(false)
  });

  /**
   * Inicializa el componente cargando los catálogos base.
   */
  async ngOnInit(): Promise<void> {
    // 1. Cargar catálogos base
    await this.cargarCatalogos();

    // 2. Configurar lógica reactiva para cambios de especie
    this.escucharCambiosEspecie();

    // 3. Cargar datos iniciales (si es edición o pre-selección)
    const animal = this.data ?? {};
    const id = animal.id ?? animal.id ?? null;
    const especieId = this.obtenerIdEspecie(animal);

    if (id) {
      const animalCompleto = await this._animalService.getById(Number(id));
      this.esEdicion.set(true);
      this.animalActual.set(animalCompleto);
      await this.rellenarFormulario(animalCompleto);
      await this.cargarHistorialClinico(Number(id));

      if (this.obtenerIdEspecie(animalCompleto)) {
        this.form.get('especieId')?.disable();
      }
    } else if (especieId) {
      this.esEdicion.set(false);
      // Al ser nuevo con especie pre-fijada, parcheamos y desactivamos
      this.form.patchValue({ especieId }, { emitEvent: false });
      this.form.get('especieId')?.disable();
      await this.onEspecieChange(Number(especieId));
    }
  }

  /**
   * Suscripción reactiva a los cambios en el control especieId.
   */
  private escucharCambiosEspecie(): void {
    this.form.get('especieId')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (especieId) => {
        console.log('Cambio detectado en especieId:', especieId);
        if (especieId) {
          await this.onEspecieChange(Number(especieId));
        } else {
          this.razas.set([]);
          this.esPerro.set(false);
        }
      });
  }

  /**
   * Carga masiva de los catálogos necesarios para los selectores del formulario.
   */
  private async cargarCatalogos(): Promise<void> {
    try {
      const [esp, ubi, sit] = await Promise.all([
        this._animalService.getEspecies(),
        this._animalService.getUbicaciones(),
        this._animalService.getSituaciones()
      ]);
      this.especies.set(esp);
      this.ubicaciones.set(ubi);
      this.situaciones.set(sit);
    } catch (e) {
      console.error('Error cargando catálogos en el modal:', e);
    }
  }

  private normalizarTexto(texto: string): string {
    return texto.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private obtenerIdEspecie(animal: AnimalDialogData): number | null {
    if (animal.especieId) {
      return animal.especieId;
    }
    if (animal.especie?.idEspecie) {
      return animal.especie.idEspecie;
    }
    if (animal.especie?.id) {
      return animal.especie.id;
    }
    const nombre = this.normalizarTexto(animal.nombreEspecie ?? animal.especie?.nombre ?? '');
    const found = this.especies().find(e => this.normalizarTexto(e.nombre) === nombre);
    return found ? (found.idEspecie ?? found.id) : null;
  }

  private obtenerIdRaza(animal: AnimalDialogData): number | null {
    if (animal.razaId) {
      return animal.razaId;
    }
    if (animal.raza?.idRaza) {
      return animal.raza.idRaza;
    }
    if (animal.raza?.id) {
      return animal.raza.id;
    }
    const nombre = this.normalizarTexto(animal.nombreRaza ?? animal.raza?.nombre ?? '');
    const found = this.razas().find(r => this.normalizarTexto(r.nombre) === nombre);
    return found ? (found.idRaza ?? found.id) : null;
  }

  private obtenerIdSituacion(animal: AnimalDialogData): number | null {
    if (animal.situacionId) {
      return animal.situacionId;
    }
    if (animal.situacion?.id) {
      return animal.situacion.id;
    }
    const nombre = this.normalizarTexto(animal.nombreSituacion ?? animal.situacion?.nombre ?? '');
    return this.situaciones().find(s => this.normalizarTexto(s.nombre) === nombre)?.id ?? null;
  }

  private obtenerIdUbicacion(animal: AnimalDialogData): number | null {
    if (animal.ubicacionId) {
      return animal.ubicacionId;
    }
    if (animal.ubicacion?.id) {
      return animal.ubicacion.id;
    }
    const nombre = this.normalizarTexto(animal.nombreUbicacion ?? animal.ubicacion?.nombre ?? '');
    return this.ubicaciones().find(u => this.normalizarTexto(u.nombre) === nombre)?.id ?? null;
  }

  /**
   * Reacciona al cambio de especie para cargar sus razas específicas y activar lógica de PPP.
   * @param especieId ID de la especie seleccionada.
   */
  async onEspecieChange(especieId: number): Promise<void> {
    if (!especieId) return;
    console.log('Cargando razas para especie:', especieId);

    const especie = this.especies().find(e => (e.idEspecie == especieId || e.id == especieId));
    const esCanino = especie?.nombre.toLowerCase() === 'perro';
    this.esPerro.set(esCanino);

    try {
      const rzs = await this._animalService.getRazasByEspecie(especieId);
      this.razas.set(rzs);
      this.form.get('razaId')?.setValue(null);
    } catch (e) {
      console.error('Error cargando razas para la especie:', e);
    }
  }

  /**
   * Rellena el formulario con los datos del animal.
   * @param animal Datos del animal a editar.
   */
  private async rellenarFormulario(animal: AnimalDialogData): Promise<void> {
    const especieId = this.obtenerIdEspecie(animal);
    const ubicacionId = this.obtenerIdUbicacion(animal);
    const situacionId = this.obtenerIdSituacion(animal);
    const id = animal.id ?? animal.id ?? null;

    // Si hay especie, cargamos sus razas antes de parchear para que el razaId sea válido
    if (especieId) {
      const rzs = await this._animalService.getRazasByEspecie(especieId);
      this.razas.set(rzs);

      const especie = this.especies().find(e => (e.idEspecie === especieId || e.id === especieId));
      this.esPerro.set(especie?.nombre.toLowerCase() === 'perro');
    }

    const razaId = this.obtenerIdRaza(animal);

    // Parcheamos el formulario. Usamos emitEvent: false para no disparar la lógica reactiva
    // que resetearía el razaId a null durante la carga inicial.
    this.form.patchValue({
      id,
      nombre: animal.nombre,
      capa: animal.capa,
      sexo: animal.sexo,
      tamanyo: animal.tamanyo,
      procedencia: animal.procedencia,
      fechaNacimiento: animal.fechaNacimiento,
      fechaIngreso: animal.fechaIngreso,
      esterilizado: animal.esterilizado,
      numeroChip: animal.numeroChip,
      comentarios: animal.comentarios,
      especieId,
      razaId,
      ubicacionId,
      situacionId,
      ppp: animal.ppp
    }, { emitEvent: false });
  }

  async cargarHistorialClinico(id: number): Promise<void> {
    this.cargandoTratamientos.set(true);
    try {
      const tratamientos = await this._tratamientoService.getByAnimal(id);
      this.tratamientos.set(tratamientos);
    } catch (error) {
      console.error('Error cargando historial clínico:', error);
      this.tratamientos.set([]);
    } finally {
      this.cargandoTratamientos.set(false);
    }
  }

  abrirGestionSalud(): void {
    const animal = this.animalActual();
    if (!animal) return;

    const dialogRef = this._dialog.open(ModalGestionSalud, {
      width: '90vw',
      maxWidth: '1200px',
      data: { animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorialClinico(animal.id);
      }
    });
  }

  tipoTratamiento(tratamiento: Tratamiento): string {
    if (tratamiento.nombreTipoVacuna) return 'VACUNA';
    if (tratamiento.nombreTipoTest) return 'TEST';
    if (tratamiento.nombreTipoDesparasitacion) return 'DESPARASITACION';
    return tratamiento.tipo ?? 'TRATAMIENTO';
  }

  nombreTratamiento(tratamiento: Tratamiento): string {
    return tratamiento.nombreTipoVacuna
      ?? tratamiento.nombreTipoTest
      ?? tratamiento.nombreTipoDesparasitacion
      ?? tratamiento.informacion
      ?? 'Sin informacion';
  }

  notasTratamiento(tratamiento: Tratamiento): string {
    return tratamiento.medicacion ?? tratamiento.informacion ?? 'Sin observaciones';
  }

  /**
 * Procesa el guardado del formulario si los datos son válidos.
 */
  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.valid) {
      // El animalDto llevará el id si es edición, o null si es nuevo.
      // Usamos getRawValue para incluir valores de controles deshabilitados.
      const animalDto = this.form.getRawValue();
      if (!this.esPerro()) {
        animalDto.ppp = null;
      }

      try {
        await this._animalService.saveAnimal(animalDto);
        this.dialogRef.close(true);
      } catch (e) {
        console.error('Error en el guardado inteligente:', e);
      }
    }
  }

}
