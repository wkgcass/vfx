import type { FusionButton } from '../../ui/button/FusionButton.js';

export type VDialogButtonProvider<T> = () => T | null;

export class VDialogButton<T> {
  readonly name: string;
  readonly provider: VDialogButtonProvider<T> | null;
  button: FusionButton | null = null;

  constructor(name: string, value: T);
  constructor(name: string, provider: VDialogButtonProvider<T>);
  constructor(name: string);
  constructor(name: string, providerOrValue?: T | VDialogButtonProvider<T>) {
    this.name = name;
    if (providerOrValue === undefined) {
      this.provider = null;
    } else if (typeof providerOrValue === 'function') {
      this.provider = providerOrValue as VDialogButtonProvider<T>;
    } else {
      const value = providerOrValue;
      this.provider = () => value;
    }
  }

  getButton(): FusionButton | null {
    return this.button;
  }
}
