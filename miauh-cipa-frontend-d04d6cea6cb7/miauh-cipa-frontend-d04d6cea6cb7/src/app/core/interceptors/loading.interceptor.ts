import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Mostrar spinner
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Ocultar spinner al terminar (con o sin error)
      loadingService.hide();
    })
  );
};
