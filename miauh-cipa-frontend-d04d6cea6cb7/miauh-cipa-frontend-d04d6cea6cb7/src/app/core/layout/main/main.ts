import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';

import { OverlayContainer } from '@angular/cdk/overlay';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { UserService } from '../../services/user.service';
import { ThemeService } from '../../services/theme.service';
import { MenuClass } from '../menuClass';
import { FoodNode } from '../treemenu/footnode';
import { SpinnerComponent } from '../../../shared/components/spinner.component';
import { Userfull } from '../../../shared/models/user.model';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, MatBadgeModule, MatTooltipModule, MatSidenavModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, RouterOutlet, MatTreeModule, MatSlideToggleModule, SpinnerComponent],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit {
  public router = inject(Router);
  public snackBar = inject(MatSnackBar);
  public _auth = inject(AuthService);
  public _user = inject(UserService);
  public _http = inject(HttpService);
  public _theme = inject(ThemeService);

  isDark = this._theme.isDark;
  keyView = signal<boolean>(false);
  userView = signal<boolean>(false);
  user = signal<Userfull | null>(null);
  menuData = signal<FoodNode[]>([]);

  iniciarVista = true;
  isDrawerOpen = true;
  year = new Date().getFullYear();

  // API requerida por mat-tree para detectar nodos hijos sin recalcular plantillas.
  childrenAccessor = (node: FoodNode) => node.children ?? [];
  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;

  public onSetTheme(e: MatSlideToggleChange): void {
    this._theme.setTheme(e.checked);
  }

  ngOnInit(): void {
    this.getUser();
  }

  // Carga el usuario antes del menu para mostrar solo las secciones permitidas por rol.
  async getUser(): Promise<void> {
    try {
      const response = await this._user.fetchUser();

      if (!response) {
        this.snackBar.open('Error al obtener el usuario', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/login']);
        return;
      }

      this.user.set(response);
      this.loadMenu();
      this.userView.set(true);

    } catch (error) {
      console.error("Error crítico en getUser:", error);
      if (error instanceof HttpErrorResponse && [401, 403].includes(error.status)) {
        this.snackBar.open('La sesión no es válida. Inicia sesión de nuevo.', 'Cerrar', { duration: 5000 });
        this._auth.logout();
        return;
      }

      this.snackBar.open('Error de conexión con el servidor', 'Cerrar', { duration: 5000 });
    }
  }

  // El menu depende del rol del usuario, por eso se genera cuando ya existe sesion.
  loadMenu(): void {
    const menu = new MenuClass(this.user());
    this.menuData.set(menu.seleccionarMenu());
    this.keyView.set(true);
  }

  // Punto unico de navegacion desde el arbol lateral.
  navegar(node: FoodNode): void {
    if (node.name === 'Cerrar sesión') {
      this.logout();
    } else if (node.route) {
      this.router.navigateByUrl('/' + node.route);
    }
  }

  // Marca visualmente y semanticamente la ruta activa con aria-current="page".
  isRouteActive(node: FoodNode): boolean {
    return !!node.route && this.router.url.replace('/', '') === node.route;
  }

  // Refuerzo de teclado para activar opciones con Enter o Espacio.
  onMenuKeydown(event: KeyboardEvent, node: FoodNode): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.navegar(node);
  }

  goToCentral(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this._auth.logout();
  }

}
