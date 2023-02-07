import { formatNumber } from '@angular/common';
import { Directive, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[myCurrencyInput]',
   providers: [
     {
       provide: NG_VALUE_ACCESSOR,
       useExisting: forwardRef(() => CurrencyInputDirective),
       multi:true
     }
   ]
})
export class CurrencyInputDirective implements ControlValueAccessor {

  // private el: HTMLInputElement;

  // ngOnInit(): void {
  //   this.el.value = this.el.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // }

  // constructor(private elementRef: ElementRef) {
  //   this.el = this.elementRef.nativeElement;
  // }

  // @HostListener("focus", ["$event.target.value"])
  // onFocus(value: any) {
  //   this.el.value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // }

  // @HostListener("blur", ["$event.target.value"])
  // onBlur(value: any) {
  //   this.el.value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  // }




  locale = 'en';
  decimalMarker: string = '';
  private _value: string | null = '';

  constructor(private element: ElementRef<HTMLInputElement>) {

  }

  get value(): string | null {
    return this._value;
  }

  @Input('value')
  set value(value: string | null) {
    this._value = value;
    this.formatValue(value);
  }

  @HostListener('blur')
  _onBlur() {
    this.formatValue(this._value);
    this.valorChange.emit(parseFloat(this._value ? this._value : ''));
  }

  writeValue(value: any): void {
    this._value = value;
    this.formatValue(this._value);
  }

  _onChange(value: any): void {}

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
  
  }

  setDisabledState?(isDisabled: boolean): void {
    
  }

  isLastCharacterDecimalSeparator(value: any) {
    return isNaN(value[value.length - 1]);
  }

  private formatValue(value: string | null) {

    if (value === null) {
      this.element.nativeElement.value = '';
    }

    if (this.isLastCharacterDecimalSeparator(value?.toString())) {
      this.element.nativeElement.value = value ? value : '';
      return;
    }

    const [thousandSeparator, decimalMarker] = formatNumber(1000.99, this.locale)
    this.decimalMarker = decimalMarker;

    let [integer, decimal] = (value ? value : '').toString().split('.');

    if (!integer) { integer = '0'; }
    if (!decimal) { decimal = '00'; }

    this.element.nativeElement.value = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

    if(decimal) {
      this.element.nativeElement.value = this.element.nativeElement.value.concat(decimalMarker, decimal);
    }
  }

  private unFormatValue() {
    const value = this.element.nativeElement.value;

    if(this.isLastCharacterDecimalSeparator(value)) {
      return;
    }
    const regExp = new RegExp('[^\\d${this.decimalMarker}-]', 'g');

    let [integer, decimal] = value.replace(regExp, '').split(this.decimalMarker);

    if(!integer) { integer = '0';}
    if(!decimal) { decimal = '00';}

    this._value = integer.concat('.', decimal);
    if(value) {
      this.element.nativeElement.value = this._value;
    }
    else {
      this.element.nativeElement.value = '';
    }
  }

  @Input('currencyInput') set valor(valor: number) {
    if(!valor) { valor = 0;}
    this.formatValue(valor.toString())
  }

  @Output('currencyInputChange') valorChange = new EventEmitter<number>();
  @Input('objeto') objeto: any;
  @Input('propiedad') propiedad: string = '';
}
