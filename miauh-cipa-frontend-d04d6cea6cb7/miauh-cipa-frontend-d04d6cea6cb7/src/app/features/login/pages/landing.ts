import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LoginRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  public _theme = inject(ThemeService);

  isDark = this._theme.isDark;
  form1!: FormGroup;
  showSpinner = signal(false);
  hidePassword = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this.buildForm();

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  buildForm(): void {
    this.form1 = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async enviarCredenciales(): Promise<void> {
    if (this.form1.invalid) return;

    this.showSpinner.set(true);
    this.errorMessage.set('');

    try {
      await this.authService.login(this.form1.value as LoginRequest);

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
      this.router.navigateByUrl(returnUrl);
    } catch (error: unknown) {
      console.error('Error de autenticacion:', error);
      this.errorMessage.set('Email o contraseña incorrectos');
    } finally {
      this.showSpinner.set(false);
    }
  }
}
