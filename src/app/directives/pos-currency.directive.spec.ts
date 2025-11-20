import { PosCurrencyDirective } from './pos-currency.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('PosCurrencyDirective', () => {
  it('should create an instance', () => {
    const el = new ElementRef(document.createElement('input')) as ElementRef<HTMLInputElement>;
    const renderer = jasmine.createSpyObj<Renderer2>('Renderer2', [
      'setProperty',
      'listen',
      'addClass',
      'removeClass',
      'setAttribute',
      'setStyle',
      'removeStyle'
    ]) as unknown as Renderer2;

    const directive = new PosCurrencyDirective(el, renderer);
    expect(directive).toBeTruthy();
  });
});
