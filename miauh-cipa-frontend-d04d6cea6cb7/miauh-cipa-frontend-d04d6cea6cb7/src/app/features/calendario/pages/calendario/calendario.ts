import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';

// FullCalendar Imports
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateClickArg } from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

// Material Imports
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// MIAUH Architecture Imports
import { CalendarioStore } from '../../state/calendario.store';
import { CalendarioApiService } from '../../data-access/calendario-api.service';
import { TareasPendientes } from '../../components/tareas-pendientes/tareas-pendientes';
import { Evento, ModalEventoResult } from '../../models/evento.model';
import { ModalEvento } from '../../dialogs/modal-evento/modal-evento';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TareasPendientes
  ],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.scss']
})
export class Calendario implements OnInit, AfterViewInit, OnDestroy {
  // Inyección de dependencias
  public store = inject(CalendarioStore);
  private api = inject(CalendarioApiService);
  private dialog = inject(MatDialog);

  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;
  @ViewChild('calendarWrapper') calendarWrapper?: ElementRef<HTMLElement>;

  private resizeObserver?: ResizeObserver;
  private updateSizeTimer?: ReturnType<typeof setTimeout>;

  /**
   * Transforma los eventos del Store al formato EventInput de FullCalendar
   */
  calendarEvents = computed<EventInput[]>(() =>
    this.store.eventos().map(ev => ({
      id: ev.id?.toString(),
      title: ev.titulo,
      start: ev.fechaHoraInicio,
      end: ev.fechaHoraFin,
      backgroundColor: ev.color,
      borderColor: ev.color,
      className: ev.completado ? 'event-completed' : '',
      extendedProps: { ...ev }
    }))
  );

  /**
   * Configuración de FullCalendar (se recalcula cuando cambian los eventos)
   */
  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana'
    },
    events: this.calendarEvents(),
    dateClick: (info: DateClickArg) => this.onDateClick(info),
    eventClick: (info: EventClickArg) => this.onEventClick(info),
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    aspectRatio: 2.1,
    height: '100%',
    handleWindowResize: true
  }));

  ngOnInit(): void {
    this.initData();
  }

  ngAfterViewInit(): void {
    this.scheduleCalendarResize();

    const wrapper = this.calendarWrapper?.nativeElement;
    if (!wrapper) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleCalendarResize();
    });
    this.resizeObserver.observe(wrapper);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();

    if (this.updateSizeTimer) {
      clearTimeout(this.updateSizeTimer);
    }
  }

  private scheduleCalendarResize(): void {
    if (this.updateSizeTimer) {
      clearTimeout(this.updateSizeTimer);
    }

    this.updateSizeTimer = setTimeout(() => {
      this.calendarComponent?.getApi().updateSize();
    }, 120);
  }

  /**
   * Carga inicial de eventos desde el API
   */
  private initData(): void {
    this.store.setLoading(true);
    this.api.getEventos().subscribe({
      next: (eventos: Evento[]) => {
        this.store.setEventos(eventos);
        this.store.setLoading(false);
      },
      error: (err: unknown) => {
        console.error('Error cargando eventos:', err);
        this.store.setLoading(false);
      }
    });
  }

  alternarTarea(evento: Evento): void {
    if (!evento.completado) {
      this.api.patchCompletado(evento.id).subscribe({
        next: () => this.store.marcarComoCompletado(evento.id)
      });
      return;
    }

    this.api.updateEvento({ ...evento, completado: false }).subscribe(updated => {
      this.store.actualizarEvento(updated);
    });
  }

  private onDateClick(info: DateClickArg): void {
    this.abrirModalEvento(null, info.dateStr);
  }

  private onEventClick(info: EventClickArg): void {
    const evento = info.event.extendedProps as Evento;
    this.abrirModalEvento(evento);
  }

  abrirModalEvento(evento: Evento | null = null, fechaSugerida?: string): void {
    const dialogRef = this.dialog.open(ModalEvento, {
      width: '90vw',
      maxWidth: '1200px',
      data: { evento, fechaSugerida }
    });

    dialogRef.afterClosed().subscribe((result: ModalEventoResult | undefined) => {
      if (!result) return;

      if (result.action === 'delete') {
        this.api.deleteEvento(result.id).subscribe(() => {
          this.store.eliminarEvento(result.id);
        });
      } else {
        const evento = result.evento;
        if (evento.id) {
          this.api.updateEvento(evento).subscribe(updated => {
            this.store.actualizarEvento(updated);
          });
        } else {
          this.api.saveEvento(evento).subscribe(newEv => {
            this.store.agregarEvento(newEv);
          });
        }
      }
    });
  }
}
