export class LoadingItem {
  readonly weight: number;
  readonly name: string;
  readonly loadFunc: () => boolean;

  constructor(weight: number, name: string, loadFunc: () => void);
  constructor(weight: number, name: string, loadFunc: () => boolean);
  constructor(weight: number, name: string, loadFunc: () => void | boolean) {
    this.weight = weight;
    this.name = name;
    const wrapped: () => boolean = () => {
      const result = loadFunc();
      // If the function returned undefined (void), treat as true (Runnable path).
      return typeof result === 'boolean' ? result : true;
    };
    this.loadFunc = wrapped;
  }
}
