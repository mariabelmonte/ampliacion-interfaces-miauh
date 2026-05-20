import { Component, input, output } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Evento } from '../../models/evento.model';

@Component({
  selector: 'app-tareas-pendientes',
  standalone: true,
  imports: [DatePipe, CommonModule, MatIconModule],
  templateUrl: './tareas-pendientes.html',
  styleUrl: './tareas-pendientes.scss',
})
export class TareasPendientes {
  /** Lista de eventos recibida desde el padre */
  tareas = input<Evento[]>([]);

  /** Emite el evento que el usuario marca o desmarca como completado */
  onComplete = output<Evento>();

  completarEvento(evento: Evento): void {
    if (evento.id !== undefined) {
      this.onComplete.emit(evento);
    }
  }
}
