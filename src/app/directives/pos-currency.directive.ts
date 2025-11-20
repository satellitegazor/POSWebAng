import { Directive, ElementRef, forwardRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appPosCurrency]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PosCurrencyDirective),
    multi: true
  }]
})
export class PosCurrencyDirective implements ControlValueAccessor {

  @Input('appPosCurrency') currencySymbol: string = '$'; // usage: appPosCurrency or [appPosCurrency]="'€'"
  private onChange: (val: number | null) => void = () => { };
  private onTouched: () => void = () => { };
  private cents: number = 0; // integer cents
  private disabled = false;

  constructor(private el: ElementRef<HTMLInputElement>, private renderer: Renderer2) { }

  writeValue(value: number | null): void {
    if (value == null || isNaN(value)) {
      this.cents = 0;
      this.setView();
      return;
    }
    this.cents = Math.round(value * 100);
    this.setView();
  }

  registerOnChange(fn: (val: number | null) => void): void { 
    console.log('PosCurrencyDirective registerOnChange');
    this.onChange = fn; 
  }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled); }

  // intercept digit keys and backspace; ignore other printable chars
  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;

    const input = this.el.nativeElement;
    const key = e.key;

    // allow navigation & control keys
    const allow = ['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Escape'];
    if (allow.includes(key) || (e.ctrlKey || e.metaKey)) {
      return;
    }

    if (key === 'Backspace') {
      e.preventDefault();
      this.cents = Math.floor(this.cents / 10);
      this.propagate();
      return;
    }

    // ignore minus, dot, comma typed manually - we only accept digits
    if (/^\d$/.test(key)) {
      e.preventDefault();
      // append digit to the right (shifts previous digits left)
      this.cents = this.cents * 10 + Number(key);
      // optionally cap length to avoid overflow (e.g. max 12 digits)
      if (this.cents > 999999999999) { this.cents = 999999999999; }
      this.propagate();
      return;
    }

    // block any other key input
    e.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    if (this.disabled) return;
    e.preventDefault();
    const text = e.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '');
    if (!digits) return;
    // treat pasted digits as a sequence of typed digits
    for (const ch of digits) {
      this.cents = this.cents * 10 + Number(ch);
      if (this.cents > 999999999999) { this.cents = 999999999999; break; }
    }
    this.propagate();
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
    // optionally format again
    this.setView();
  }

  private propagate() {
    const value = this.cents / 100;
    this.setView();
    // notify angular forms
    this.onChange(Number(value.toFixed(2)));
    // also dispatch native events so (input)/(change) handlers fire
    try {
      const inputEl = this.el.nativeElement;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (err) {
      // ignore
    }
  }

  private setView() {
    const valueStr = (this.cents / 100).toFixed(2);
    const display = this.currencySymbol ? `${this.currencySymbol}${valueStr}` : valueStr;
    this.renderer.setProperty(this.el.nativeElement, 'value', display);
  }
}