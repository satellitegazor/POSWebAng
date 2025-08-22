import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[appTwoDigitDecimalDirective]',
    standalone: false
})
export class TwoDigitDecimalDirectiveDirective {

private regex: RegExp = new RegExp(/^\d*\.?\d{0,2}$/g);
private specialkeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor(private el: ElementRef) { 
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    //console.log(this.el.nativeElement.value);

    if(this.specialkeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : event.key, current.slice(position)].join('');
    if(next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
