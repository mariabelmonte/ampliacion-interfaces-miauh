import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { ApiErrorMessageService } from '../services/api-error-message.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const apiErrorMessage = inject(ApiErrorMessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        snackBar.open(apiErrorMessage.getMessage(error), 'Cerrar', {
          duration: 6000,
          panelClass: ['api-error-snackbar'],
        });
      }

      return throwError(() => error);
    })
  );
};
