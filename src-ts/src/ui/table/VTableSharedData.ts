import type { VTableView } from './VTableView.js';

export class VTableSharedData<S> {
  public readonly tableView: VTableView<S>;
  public rowAdder: number = 0;

  constructor(tableView: VTableView<S>) {
    this.tableView = tableView;
  }
}
