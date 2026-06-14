import { Node } from './Node.js';
import { Property } from './Property.js';

export class TextField extends Node {
  readonly textProperty = new Property<string>('');
  readonly focusedProperty = new Property<boolean>(false);

  constructor(text: string = '') {
    super(document.createElement('input'));
    const input = this.el as HTMLInputElement;
    input.type = 'text';
    input.value = text;
    this.textProperty.set(text);

    input.addEventListener('input', () => {
      this.textProperty.set(input.value);
    });
    input.addEventListener('focus', () => {
      this.focusedProperty.set(true);
    });
    input.addEventListener('blur', () => {
      this.focusedProperty.set(false);
    });

    this.el.style.outline = 'none';
    this.el.style.border = '1px solid transparent';
    this.el.style.background = 'transparent';
    this.el.style.fontFamily = 'inherit';
    this.el.style.fontSize = 'inherit';
    this.el.style.color = 'inherit';
    this.el.style.padding = '0 4px';
    this.el.style.boxSizing = 'border-box';
  }

  getText(): string {
    return (this.el as HTMLInputElement).value;
  }

  setText(t: string): void {
    (this.el as HTMLInputElement).value = t;
    this.textProperty.set(t);
  }

  isFocused(): boolean {
    return this.focusedProperty.get();
  }

  setEditable(editable: boolean): void {
    (this.el as HTMLInputElement).readOnly = !editable;
  }

  setPromptText(prompt: string): void {
    (this.el as HTMLInputElement).placeholder = prompt;
  }

  requestFocus(): void {
    (this.el as HTMLInputElement).focus();
  }
}
