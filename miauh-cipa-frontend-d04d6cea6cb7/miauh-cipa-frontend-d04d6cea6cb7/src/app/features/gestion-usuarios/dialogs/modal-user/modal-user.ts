import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RolUsuario, UsuarioCreate, UsuarioDetail } from '../../../../core/models/usuario.models';
import { UsuarioService } from '../../../../core/services/usuario.service';

interface ModalUserData {
  title: string;
  user?: Partial<UsuarioDetail> & { name?: string; role?: RolUsuario; active?: boolean };
  roles?: RolUsuario[];
}

@Component({
  selector: 'app-modal-user',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatSlideToggleModule,
    MatIconModule, MatToolbarModule, A11yModule],
  templateUrl: './modal-user.html',
  styleUrl: './modal-user.scss',
})
export class ModalUser {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private dialogRef = inject(MatDialogRef<ModalUser, boolean>);

  form: FormGroup;
  title: string;
  roles: RolUsuario[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ModalUserData) {
    this.title = data.title;
    const user = data.user || {};
    this.roles = data.roles?.length ? data.roles : ['USER', 'ADMINISTRATOR'];

    this.form = this.fb.group({
      id: [user.id || null],
      nombre: [user.nombre || this.splitName(user.name).nombre, [Validators.required]],
      apellidos: [user.apellidos || this.splitName(user.name).apellidos, [Validators.required]],
      email: [user.email || '', [Validators.required, Validators.email]],
      password: ['', user.id ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]],
      rol: [user.rol || user.role || 'USER', [Validators.required]],
      activo: [user.activo ?? user.active ?? true]
    });
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) return;

    try {
      const userData = this.form.value as UsuarioCreate | UsuarioDetail;
      await this.usuarioService.save(userData);
      this.dialogRef.close(true);
    } catch (e) {
      console.error('Error al guardar usuario', e);
    }
  }

  private splitName(name?: string): { nombre: string; apellidos: string } {
    const parts = (name ?? '').trim().split(' ').filter(Boolean);
    return {
      nombre: parts.shift() ?? '',
      apellidos: parts.join(' ')
    };
  }
}
