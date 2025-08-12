import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [],
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.css'
})
export class ConfirmDeleteComponent {
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
currentImageIndex: any;


  confirm()
  {
    this.onConfirm.emit();
  }

  cancel()
  {
    this.onCancel.emit();
  }

}
