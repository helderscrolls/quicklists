import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Checklist } from '../../shared/interfaces/checklist';

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
      </li>
      } @empty {
      <p>Click the add button to create your first checklist!</p>
      }
    </ul>
  `,
  imports: [RouterLink],
})
export class ChecklistListComponent {
  @Input({ required: true }) checklists!: Checklist[];
}
