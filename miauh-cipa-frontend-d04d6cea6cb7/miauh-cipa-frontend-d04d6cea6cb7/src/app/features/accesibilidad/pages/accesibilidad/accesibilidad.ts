import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface ChecklistItem {
  // Icono Material usado solo como apoyo visual; el texto mantiene el significado accesible.
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-accesibilidad',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './accesibilidad.html',
  styleUrl: './accesibilidad.scss',
})
export class Accesibilidad {
  // Bloque alineado con los criterios de accesibilidad del PDF RA4.
  readonly accesibilidad: ChecklistItem[] = [
    {
      icon: 'contrast',
      title: 'Contraste, tamanos y espaciados',
      text: 'Paleta revisada, texto base de 16 px, botones de 44 px y estados visibles de foco.',
    },
    {
      icon: 'keyboard',
      title: 'Navegacion por teclado y ARIA',
      text: 'Menu principal navegable con teclado, enlace de salto, landmarks y etiquetas en botones de icono.',
    },
    {
      icon: 'assignment',
      title: 'Formularios accesibles',
      text: 'Campos con etiquetas, errores visibles y acciones descriptivas para lectores de pantalla.',
    },
    {
      icon: 'subtitles',
      title: 'Subtitulos y transcripciones',
      text: 'Esta pantalla documenta una transcripcion equivalente para el recorrido de uso de la aplicacion.',
    },
  ];

  // Bloque alineado con los criterios de usabilidad del PDF RA4.
  readonly usabilidad: ChecklistItem[] = [
    {
      icon: 'web',
      title: 'Cabecera, pie y menus',
      text: 'Cabecera fija, menu principal por secciones, pie informativo y acceso a esta guia.',
    },
    {
      icon: 'travel_explore',
      title: 'Navegacion entre secciones',
      text: 'Rutas claras para dashboard, animales, adoptantes, calendario, transacciones y gestion.',
    },
    {
      icon: 'filter_alt',
      title: 'Busqueda y filtrado',
      text: 'Tablas con buscador, filtros por estado o tipo, ordenacion y paginacion.',
    },
    {
      icon: 'edit_note',
      title: 'Formularios usables',
      text: 'Formularios agrupados por contexto, botones consistentes y validaciones inmediatas.',
    },
  ];
}
