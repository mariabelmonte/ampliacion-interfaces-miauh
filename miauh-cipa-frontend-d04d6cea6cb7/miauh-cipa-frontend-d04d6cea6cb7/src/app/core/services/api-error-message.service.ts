import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

type ApiErrorBody = {
  message?: unknown;
  messages?: unknown;
  error?: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class ApiErrorMessageService {
  getMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Ha ocurrido un error inesperado';
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa la conexión e inténtalo de nuevo.';
    }

    const body = error.error as ApiErrorBody | string | null;

    if (typeof body === 'string' && body.trim()) {
      return body.trim();
    }

    if (body && typeof body === 'object') {
      const messages = this.asMessages(body.messages);
      if (messages.length) {
        return messages.join('\n');
      }

      const message = this.asText(body.message);
      if (message) {
        return message;
      }

      const fallbackError = this.asText(body.error);
      if (fallbackError) {
        return fallbackError;
      }
    }

    return this.getFallbackByStatus(error.status);
  }

  private asMessages(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => this.asText(item))
      .filter((item): item is string => Boolean(item));
  }

  private asText(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  private getFallbackByStatus(status: number): string {
    if (status === 401) {
      return 'La sesión no es válida o ha caducado.';
    }

    if (status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }

    if (status === 404) {
      return 'No se encontró el recurso solicitado.';
    }

    if (status >= 500) {
      return 'Ha ocurrido un error en el servidor. Inténtalo más tarde.';
    }

    return 'No se pudo completar la operación.';
  }
}
