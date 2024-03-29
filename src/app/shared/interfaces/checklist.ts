export interface Checklist {
  id: string;
  title: string;
  itemsCount: number;
}

export type AddChecklist = Omit<Checklist, 'id' | 'itemsCount'>;
export type EditChecklist = { id: Checklist['id']; data: AddChecklist };
export type RemoveChecklist = Checklist['id'];
