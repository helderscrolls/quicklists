import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { connect } from 'ngxtension/connect';
import { EMPTY, Subject, catchError, map, merge } from 'rxjs';
import { ChecklistItemService } from '../../checklist/data-access/checklist-item.service';
import {
  AddChecklist,
  Checklist,
  EditChecklist,
} from '../interfaces/checklist';
import { StorageService } from './storage.service';

export interface ChecklistsState {
  checklists: Checklist[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistService {
  private storageService = inject(StorageService);
  private checklistItemService = inject(ChecklistItemService);

  // state
  private state = signal<ChecklistsState>({
    checklists: [],
    loaded: false,
    error: null,
  });

  // selectors
  loaded = computed(() => this.state().loaded);
  checklists = computed(() => this.state().checklists);

  // sources
  private checklistsLoaded$ = this.storageService.loadChecklists().pipe(
    catchError((err) => {
      this.error$.next(err);
      return EMPTY;
    })
  );
  private error$ = new Subject<string>();
  add$ = new Subject<AddChecklist>();
  remove$ = this.checklistItemService.checklistRemoved$;
  edit$ = new Subject<EditChecklist>();

  constructor() {
    // reducers
    const nextState$ = merge(
      this.checklistsLoaded$.pipe(
        map((checklists) => ({ checklists, loaded: true }))
      ),
      this.error$.pipe(map((error) => ({ error })))
    );

    connect(this.state)
      .with(nextState$)
      .with(this.add$, (state, checklist) => ({
        checklists: [...state.checklists, this.addIdToChecklist(checklist)],
      }))
      .with(this.remove$, (state, id) => ({
        checklists: state.checklists.filter((checklist) => checklist.id !== id),
      }))
      .with(this.edit$, (state, update) => ({
        checklists: state.checklists.map((checklist) =>
          checklist.id === update.id
            ? { ...checklist, title: update.data.title }
            : checklist
        ),
      }));

    //effects
    effect(() => {
      if (this.loaded()) {
        this.storageService.saveChecklists(this.checklists());
      }
    });

    effect(
      () => {
        const checklistItems = this.checklistItemService.checklistItems();
        this.state.update((state) => ({
          ...state,
          checklists: state.checklists.map((checklist) => ({
            ...checklist,
            itemsCount: checklistItems.filter(
              (item) => item.checklistId === checklist.id
            ).length,
          })),
        }));
      },
      { allowSignalWrites: true }
    );
  }

  private addIdToChecklist(checklist: AddChecklist) {
    return {
      ...checklist,
      id: this.generateSlug(checklist.title),
      itemsCount: 0,
    };
  }

  private generateSlug(title: string) {
    // NOTE: This is a simplistic slug generator and will not handle things like special characters.
    let slug = title.toLowerCase().replace(/\s+/g, '-');

    // Check if the slug already exists
    const matchingSlugs = this.checklists().find(
      (checklist) => checklist.id === slug
    );

    // If the title is already being used, add a string to make the slug unique
    if (matchingSlugs) {
      slug = slug + Date.now().toString();
    }

    return slug;
  }
}
