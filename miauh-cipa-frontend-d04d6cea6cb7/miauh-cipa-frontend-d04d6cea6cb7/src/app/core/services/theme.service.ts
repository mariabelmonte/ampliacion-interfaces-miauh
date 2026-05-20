import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private overlayContainer = inject(OverlayContainer);
  
  isDark = signal<boolean>(false);

  constructor() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    this.applyTheme(savedTheme);
  }

  toggleTheme() {
    const newTheme = this.isDark() ? 'light-theme' : 'dark-theme';
    this.applyTheme(newTheme);
  }

  setTheme(isDark: boolean) {
    this.applyTheme(isDark ? 'dark-theme' : 'light-theme');
  }

  private applyTheme(theme: string) {
    const root = this.document.documentElement;
    const overlay = this.overlayContainer.getContainerElement();

    root.classList.remove('light-theme', 'dark-theme');
    overlay.classList.remove('light-theme', 'dark-theme');

    root.classList.add(theme);
    overlay.classList.add(theme);

    localStorage.setItem('theme', theme);
    this.isDark.set(theme === 'dark-theme');
  }
}
