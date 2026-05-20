import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RolUsuario, UsuarioSummary } from '../../../../core/models/usuario.models';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { ModalUser } from '../../dialogs/modal-user/modal-user';
import { paginatorIntlFactory } from '../../../../core/material/paginator-intl';

interface UsuarioTabla extends UsuarioSummary {
  name: string;
  role: RolUsuario;
  active: boolean;
}

interface UsuarioFiltro {
  name?: string;
  email?: string;
  role?: string;
  active?: string;
}

@Component({
  selector: 'app-gestion-usuarios',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatSortModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatDialogModule, MatSelectModule, MatSnackBarModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.scss',
  providers: [{ provide: MatPaginatorIntl, useFactory: paginatorIntlFactory }]
})
export class GestionUsuarios implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  public authService = inject(AuthService);

  form: FormGroup;
  dataSource = new MatTableDataSource<UsuarioTabla>([]);
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'active', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.form = this.fb.group({
      name: [''],
      email: [''],
      role: [''],
      active: ['']
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();

    this.form.valueChanges.subscribe(values => {
      this.dataSource.filter = JSON.stringify(values);
    });
  }

  async cargarUsuarios(): Promise<void> {
    try {
      const res = await this.usuarioService.findAll();
      this.dataSource.data = res
        .map(user => ({
          ...user,
          name: `${user.nombre ?? ''} ${user.apellidos ?? ''}`.trim(),
          role: this.normalizarRol(user.rol),
          active: user.activo ?? true
        }))
        .filter(user => this.puedeVerRol(user.role));
    } catch (e) {
      console.error('Error cargando usuarios', e);
      this.dataSource.data = [];
    } finally {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: UsuarioTabla, filter: string) => {
        const searchTerms = JSON.parse(filter) as UsuarioFiltro;
        const matchName = this.normalizar(data.name || data.nombre).includes(this.normalizar(searchTerms.name));
        const matchEmail = this.normalizar(data.email).includes(this.normalizar(searchTerms.email));
        const matchRole = !searchTerms.role || this.normalizar(data.role || data.rol) === this.normalizar(searchTerms.role);
        const matchActive = searchTerms.active === '' || String(!!(data.active ?? data.activo)) === searchTerms.active;
        return matchName && matchEmail && matchRole && matchActive;
      };
    }
  }

  private normalizar(valor: unknown): string {
    return String(valor ?? '').trim().toLowerCase();
  }

  abrirModalUsuario(data: UsuarioTabla | 0 = 0): void {
    const dialogRef = this.dialog.open(ModalUser, {
      width: '90vw',
      maxWidth: '1200px',
      data: {
        title: data === 0 ? 'Añadir Usuario' : 'Editar Usuario',
        user: data,
        roles: this.rolesDisponibles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.cargarUsuarios();
    });
  }

  async toggleActivo(user: UsuarioTabla): Promise<void> {
    try {
      if (user.active ?? user.activo) {
        await this.usuarioService.desactivar(user.id);
      } else {
        await this.usuarioService.activar(user.id);
      }
      this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
      this.cargarUsuarios();
    } catch (e) {
      console.error('Error actualizando usuario', e);
      this.snackBar.open('No se pudo actualizar el estado', 'Cerrar', { duration: 5000 });
    }
  }

  navegar(path: string): void {
    this.router.navigate([path]);
  }

  get rolesDisponibles(): string[] {
    const roles: RolUsuario[] = ['USER', 'ADMINISTRATOR'];
    if (this.esSuperuserActual()) {
      roles.splice(1, 0, 'SUPERUSER');
    }
    return roles;
  }

  private normalizarRol(rol: unknown): RolUsuario {
    const value = String(rol ?? 'USER').replace(/^ROLE_/, '') as RolUsuario;
    return value;
  }

  private puedeVerRol(rol: RolUsuario): boolean {
    return this.esSuperuserActual() || rol !== 'SUPERUSER';
  }

  private esSuperuserActual(): boolean {
    const user = this.authService.getCurrentUser();
    return this.normalizarRol(user?.rol ?? user?.role) === 'SUPERUSER';
  }
}
