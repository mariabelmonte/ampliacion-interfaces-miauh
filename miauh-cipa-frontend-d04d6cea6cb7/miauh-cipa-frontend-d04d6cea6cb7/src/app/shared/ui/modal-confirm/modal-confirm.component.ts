import { Component, HostBinding, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

export interface ModalConfirmData {
  title: string;
  comment: string;
}

@Component({
    selector: 'app-modal-confirm',
    imports: [MatSelectModule, MatOptionModule, MatToolbarModule, MatIconModule, MatDialogModule, MatButtonModule],
    templateUrl: './modal-confirm.component.html',
    styleUrl: './modal-confirm.component.scss'
})
export class ModalConfirmComponent {
  @HostBinding('class') componentCssClass = '';

  title = '';
  content = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModalConfirmData,
    public dialogRef: MatDialogRef<ModalConfirmComponent, 'aceptar' | undefined>
  ){
    this.title = data.title;
    this.content = data.comment;
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.getElementById('container')?.classList.add(theme);
    }
    this.componentCssClass = localStorage.getItem('theme') ?? '';
  }

  deleteGroup(): void {
    this.dialogRef.close('aceptar');
  }
}
