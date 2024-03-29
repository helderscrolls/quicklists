import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChecklistService } from '../shared/data-access/checklist.service';
import { ChecklistItem } from '../shared/interfaces/checklist-item';
import { FormModalComponent } from '../shared/ui/form-modal.component';
import { ModalComponent } from '../shared/ui/modal.component';
import { ChecklistItemService } from './data-access/checklist-item.service';
import { ChecklistHeaderComponent } from './ui/checklist-header.component';
import { ChecklistItemListComponent } from './ui/checklist-item-list.component';

@Component({
  standalone: true,
  selector: 'ql-checklist',
  template: `
    @if (checklist(); as checklist) {
    <ql-checklist-header
      [checklist]="checklist"
      (addItem)="checklistItemBeingEdited.set({})"
      (resetChecklist)="checklistItemService.reset$.next($event)"
    />
    }

    <ql-checklist-item-list
      [checklistItems]="items()"
      [checkedItems]="checkedItems()"
      (toggle)="checklistItemService.toggle$.next($event)"
      (edit)="checklistItemBeingEdited.set($event)"
      (delete)="checklistItemService.remove$.next($event)"
    />

    <ql-modal [isOpen]="!!checklistItemBeingEdited()">
      <ng-template>
        <ql-form-modal
          title="Create item"
          [formGroup]="checklistItemForm"
          (save)="
            checklistItemBeingEdited()?.id
              ? checklistItemService.edit$.next({
                  id: checklistItemBeingEdited()!.id!,
                  data: checklistItemForm.getRawValue(),
                })
              : checklistItemService.add$.next({
                  item: checklistItemForm.getRawValue(),
                  checklistId: checklist()?.id!
                })
          "
          (close)="checklistItemBeingEdited.set(null)"
        />
      </ng-template>
    </ql-modal>
  `,
  imports: [
    ChecklistHeaderComponent,
    ModalComponent,
    FormModalComponent,
    ChecklistItemListComponent,
  ],
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService);
  checklistItemService = inject(ChecklistItemService);
  route = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null);

  params = toSignal(this.route.paramMap);

  checklist = computed(() =>
    this.checklistService
      .checklists()
      .find((checklist) => checklist.id === this.params()?.get('id'))
  );

  items = computed(() =>
    this.checklistItemService
      .checklistItems()
      .filter((item) => item.checklistId === this.params()?.get('id'))
  );

  checkedItems = computed(
    () =>
      this.checklistItemService.checklistItems().filter((item) => item.checked)
        .length
  );

  checklistItemForm = this.formBuilder.nonNullable.group({
    title: [''],
  });

  constructor() {
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();

      if (!checklistItem) {
        this.checklistItemForm.reset();
      } else {
        this.checklistItemForm.patchValue({
          title: checklistItem.title,
        });
      }
    });
  }
}
