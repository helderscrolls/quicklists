import { Component, signal } from '@angular/core';
import { Checklist } from '../shared/interfaces/checklist';
import { ModalComponent } from '../shared/ui/modal.component';

@Component({
  standalone: true,
  selector: 'ql-home',
  template: `
    <header>
      <h1>Quicklists</h1>
      <button (click)="checklistBeingEdited.set({})">Add Checklist</button>
    </header>

    <ql-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template> You can't see mee... yet </ng-template>
    </ql-modal>
  `,
  imports: [ModalComponent],
})
export default class HomeComponent {
  checklistBeingEdited = signal<Partial<Checklist> | null>(null);
}
