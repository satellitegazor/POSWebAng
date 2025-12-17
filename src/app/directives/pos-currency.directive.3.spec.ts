import { PosCurrency3Directive } from './pos-currency.directive.3';
import { ElementRef, Renderer2 } from '@angular/core';

describe('PosCurrency3Directive', () => {
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

    const directive = new PosCurrency3Directive(el, renderer);
    expect(directive).toBeTruthy();
  });
});
