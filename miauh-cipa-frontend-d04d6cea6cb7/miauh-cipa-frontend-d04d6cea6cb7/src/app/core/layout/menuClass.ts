import { RolUsuario } from '../models/usuario.models';
import { FoodNode } from './treemenu/footnode';

export interface MenuUser {
  rol?: RolUsuario | 'ADMINISTRADOR' | string;
  role?: RolUsuario | 'ADMINISTRADOR' | string;
}

export class MenuClass {
  private readonly menu: FoodNode[];

  constructor(private readonly user: MenuUser | null) {
    this.menu = [
      { id: '1', name: 'Dashboard', active: true, route: 'dashboard', expanded: false, icon: 'dashboard' },
      { id: '2', name: 'Perros', active: true, route: 'perros', expanded: false, icon: 'pets' },
      { id: '3', name: 'Gatos', active: true, route: 'gatos', expanded: false, icon: 'pets' },
      { id: '4', name: 'Otros Animales', active: true, route: 'animales', expanded: false, icon: 'cruelty_free' },
      { id: '5', name: 'Adoptantes', active: true, route: 'adoptantes', expanded: false, icon: 'groups' },
      { id: '7', name: 'Adopciones', active: true, route: 'transacciones', expanded: false, icon: 'volunteer_activism' },
      { id: '8', name: 'Calendario', active: true, route: 'calendario', expanded: false, icon: 'event' },
      // Entrada visible para que el profesorado encuentre rapido las evidencias RA4.
      { id: '8.1', name: 'Accesibilidad', active: true, route: 'accesibilidad', expanded: false, icon: 'accessibility_new' },
    ];

    if (this.canSeeAdvancedManagement()) {
      this.menu.push({
        id: '9',
        name: 'Gestion protectora',
        active: true,
        route: '#',
        expanded: false,
        icon: 'admin_panel_settings',
        children: [
          {
            id: '9.1',
            name: 'Gestion de usuarios',
            active: true,
            route: 'gestion-usuarios',
            expanded: false,
            icon: 'manage_accounts',
          },
          {
            id: '9.2',
            name: 'Gestion de tratamientos',
            active: true,
            route: 'gestion-tratamientos',
            expanded: false,
            icon: 'vaccines',
          },
        ],
      });
    }
  }

  seleccionarMenu(): FoodNode[] {
    return [...this.menu].sort((a, b) => a.id.localeCompare(b.id));
  }

  private canSeeAdvancedManagement(): boolean {
    const role = this.user?.rol || this.user?.role;
    return role === 'ADMINISTRATOR' || role === 'SUPERUSER' || role === 'ADMINISTRADOR';
  }
}
