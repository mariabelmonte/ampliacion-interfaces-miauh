import { A11yModule } from '@angular/cdk/a11y';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AnimalService } from '../../../animales/data-access/animal-api.service';
import { Animal } from '../../../animales/models/animal.model';
import { TratamientoService } from '../../../tratamientos/data-access/tratamiento-api.service';
import { Tratamiento } from '../../../tratamientos/models/tratamiento.model';
import { GenericMethods } from '../../../../shared/utils/genericmethods';
import {
  CategoriaEvento,
  Evento,
  EventoPayload,
  ModalEventoResult,
  TipoEventoCalendario,
  TipoReferenciaEvento,
} from '../../models/evento.model';

interface ModalEventoData {
  evento: Evento | null;
  fechaSugerida?: string;
}

@Component({
  selector: 'app-modal-evento',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    A11yModule,
  ],
  templateUrl: './modal-evento.html',
  styleUrl: './modal-evento.scss',
})
export class ModalEvento implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ModalEvento, ModalEventoResult | undefined>);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly animalService = inject(AnimalService);
  private readonly tratamientoService = inject(TratamientoService);

  public readonly data = inject<ModalEventoData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    id: [null as number | null],
    titulo: ['', Validators.required],
    fechaHoraInicio: ['', Validators.required],
    fechaHoraFin: ['', Validators.required],
    color: ['#3f51b5'],
    tipoRefeExterna: ['ANIMAL' as TipoReferenciaEvento],
    idRefeExterna: [null as number | null],
    nombreCategoria: ['VISITA' as CategoriaEvento],
    completado: [false],
    tipo: ['EVENTO' as TipoEventoCalendario],
    realizado: [false],
    comentarios: [''],
  });

  animales = signal<Animal[]>([]);
  tratamientos = signal<Tratamiento[]>([]);

  ngOnInit(): void {
    this.cargarReferencias();
    this.inicializarFormulario();
  }

  private inicializarFormulario(): void {
    const defaultDate = this.data.fechaSugerida || new Date().toISOString().split('T')[0];

    if (this.data.evento) {
      const ev = this.data.evento;
      this.form.patchValue({
        ...ev,
        comentarios: ev.comentarios ?? ev.descripcion ?? '',
        fechaHoraInicio: ev.fechaHoraInicio ? ev.fechaHoraInicio.substring(0, 16) : '',
        fechaHoraFin: ev.fechaHoraFin ? ev.fechaHoraFin.substring(0, 16) : '',
      });
    } else {
      this.form.patchValue({
        fechaHoraInicio: `${defaultDate}T09:00`,
        fechaHoraFin: `${defaultDate}T10:00`,
      });
    }

    const tipoCtrl = this.form.get('tipoRefeExterna');
    const idCtrl = this.form.get('idRefeExterna');

    const updateValidators = (tipo: TipoReferenciaEvento | null): void => {
      if (tipo === 'ANIMAL' || tipo === 'TRATAMIENTO') {
        idCtrl?.setValidators(Validators.required);
      } else {
        idCtrl?.clearValidators();
      }
      idCtrl?.updateValueAndValidity();
    };

    updateValidators(tipoCtrl?.value ?? null);
    tipoCtrl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(updateValidators);
  }

  cargarReferencias(): void {
    this.animalService.getAll().then((data) => this.animales.set(data));

    if (this.data.evento?.tipoRefeExterna === 'TRATAMIENTO') {
      this.cargarTratamientos();
    }

    this.form
      .get('tipoRefeExterna')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => {
        if (tipo === 'TRATAMIENTO' && this.tratamientos().length === 0) {
          this.cargarTratamientos();
        }
      });
  }

  private cargarTratamientos(): void {
    this.animalService.getAll()
      .then((animales) => Promise.all(
        animales.map((animal) => this.tratamientoService.getByAnimal(animal.id))
      ))
      .then((tratamientosPorAnimal) => this.tratamientos.set(tratamientosPorAnimal.flat()));
  }

  nombreTratamiento(tratamiento: Tratamiento): string {
    return tratamiento.nombreTipoVacuna
      ?? tratamiento.nombreTipoTest
      ?? tratamiento.nombreTipoDesparasitacion
      ?? tratamiento.informacion
      ?? 'Sin informacion';
  }

  tipoTratamiento(tratamiento: Tratamiento): string {
    if (tratamiento.nombreTipoVacuna) return 'VACUNA';
    if (tratamiento.nombreTipoTest) return 'TEST';
    if (tratamiento.nombreTipoDesparasitacion) return 'DESPARASITACION';
    return tratamiento.tipo ?? 'TRATAMIENTO';
  }

  guardar(): void {
    if (this.form.invalid) return;

    const datos = this.form.getRawValue();
    const evento: EventoPayload = {
      id: datos.id,
      titulo: datos.titulo ?? '',
      descripcion: datos.comentarios ?? '',
      fechaHoraInicio: datos.fechaHoraInicio ?? '',
      fechaHoraFin: datos.fechaHoraFin ?? '',
      color: datos.color ?? '#3f51b5',
      tipoRefeExterna: datos.tipoRefeExterna ?? 'GENERAL',
      idRefeExterna: datos.idRefeExterna,
      nombreCategoria: datos.nombreCategoria ?? 'OTROS',
      completado: datos.completado ?? false,
      tipo: datos.tipo ?? 'EVENTO',
      realizado: datos.realizado ?? false,
      comentarios: datos.comentarios ?? '',
      idReferencia: this.data.evento?.idReferencia,
    };

    this.dialogRef.close({ action: 'save', evento });
  }

  eliminar(): void {
    const id = this.form.get('id')?.value;
    if (!id) return;

    GenericMethods.confirmarBorrado(
      this.dialog,
      'Borrar evento',
      'Seguro que quieres borrar este evento?'
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmado) => {
        if (confirmado) {
          this.dialogRef.close({ action: 'delete', id });
        }
      });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
