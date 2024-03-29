import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Checklist, RemoveChecklist } from '../../shared/interfaces/checklist';
import { CustomPluralPipe } from '../../shared/pipes/plural.pipe';

@Component({
  standalone: true,
  selector: 'ql-checklist-list',
  template: `
    <ul>
      @for (checklist of checklists; track checklist.id) {
      <li>
        <a routerLink="/checklist/{{ checklist.id }}">
          {{ checklist.title }}
        </a>

        <p>
          {{ checklist.itemsCount }} item{{ checklist.itemsCount | plural }}
        </p>
        <div>
          <button (click)="edit.emit(checklist)">Edit</button>
          <button (click)="delete.emit(checklist.id)">Delete</button>
        </div>
      </li>
      } @empty {
      <p>Click the add button to create your first checklist!</p>
      }
    </ul>
  `,
  styles: [
    `
      ul {
        padding: 0;
        margin: 0;
      }
      li {
        font-size: 1.5em;
        display: flex;
        justify-content: space-between;
        background: var(--color-light);
        list-style-type: none;
        margin-bottom: 1rem;
        padding: 1rem;

        button {
          margin-left: 1rem;
        }
      }
    `,
  ],
  imports: [RouterLink, CustomPluralPipe],
})
export class ChecklistListComponent {
  @Input({ required: true }) checklists!: Checklist[];
  @Output() delete = new EventEmitter<RemoveChecklist>();
  @Output() edit = new EventEmitter<Checklist>();
}
