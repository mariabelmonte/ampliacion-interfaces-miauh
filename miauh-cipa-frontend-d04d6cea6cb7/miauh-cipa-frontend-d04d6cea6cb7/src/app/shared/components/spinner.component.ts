import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loading-shade">
        <mat-spinner diameter="60" color="primary"></mat-spinner>
        <p class="loading-text">Cargando...</p>
      </div>
    }
  `
})
export class SpinnerComponent {
  public loadingService = inject(LoadingService);
}
