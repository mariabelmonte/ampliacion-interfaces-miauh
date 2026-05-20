import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  public show(): void {
    this._isLoading.set(true);
  }

  public hide(): void {
    this._isLoading.set(false);
  }
}
