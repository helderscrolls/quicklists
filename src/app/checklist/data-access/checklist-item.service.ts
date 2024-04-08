import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { Subject, map, merge } from 'rxjs';
import { StorageService } from '../../shared/data-access/storage.service';
import { RemoveChecklist } from '../../shared/interfaces/checklist';
import {
  AddChecklistItem,
  ChecklistItem,
  EditChecklistItem,
  RemoveChecklistItem,
} from '../../shared/interfaces/checklist-item';

export interface ChecklistItemsState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistItemService {
  private storageService = inject(StorageService);

  // state
  private state = signal<ChecklistItemsState>({
    checklistItems: [],
    loaded: false,
  });

  // selectors
  loaded = computed(() => this.state().loaded);
  checklistItems = computed(() => this.state().checklistItems);

  // sources
  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();
  add$ = new Subject<AddChecklistItem>();
  remove$ = new Subject<RemoveChecklistItem>();
  edit$ = new Subject<EditChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklist>();

  constructor() {
    // reducers
    const nextState$ = merge(
      this.checklistItemsLoaded$.pipe(
        map((checklistItems) => ({
          checklistItems,
          loaded: true,
        }))
      )
    );

    connect(this.state)
      .with(nextState$)
      .with(this.add$, (state, checklistItem) => ({
        checklistItems: [
          ...state.checklistItems,
          {
            ...checklistItem.item,
            id: Date.now().toString(),
            checklistId: checklistItem.checklistId,
            checked: false,
          },
        ],
      }))
      .with(this.edit$, (state, update) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === update.id ? { ...item, title: update.data.title } : item
        ),
      }))
      .with(this.remove$, (state, id) => ({
        checklistItems: state.checklistItems.filter((item) => item.id !== id),
      }))
      .with(this.toggle$, (state, checklistItemId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.id === checklistItemId
            ? { ...item, checked: !item.checked }
            : item
        ),
      }))
      .with(this.reset$, (state, checklistId) => ({
        checklistItems: state.checklistItems.map((item) =>
          item.checklistId === checklistId ? { ...item, checked: false } : item
        ),
      }))
      .with(this.checklistRemoved$, (state, checklistId) => ({
        checklistItems: state.checklistItems.filter(
          (item) => item.checklistId !== checklistId
        ),
      }));

    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    });
  }
}
