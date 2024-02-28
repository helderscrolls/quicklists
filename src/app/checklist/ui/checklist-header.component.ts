import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Checklist, RemoveChecklist } from '../../shared/interfaces/checklist';

@Component({
  standalone: true,
  selector: 'ql-checklist-header',
  template: `
    <header>
      <a routerLink="/home">Back</a>
      <h1>
        {{ checklist.title }}
      </h1>
      <div>
        <button (click)="resetChecklist.emit(checklist.id)">Reset</button>
        <button (click)="addItem.emit()">Add item</button>
      </div>
    </header>
  `,
  styles: [
    `
      button {
        margin-left: 1rem;
      }
    `,
  ],
  imports: [RouterLink],
})
export class ChecklistHeaderComponent {
  @Input({ required: true }) checklist!: Checklist;
  @Output() addItem = new EventEmitter<void>();
  @Output() resetChecklist = new EventEmitter<RemoveChecklist>();
}
