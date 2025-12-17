import { Directive, ElementRef, forwardRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appPosCurrency3]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PosCurrency3Directive),
    multi: true
  }]
})
export class PosCurrency3Directive implements ControlValueAccessor {

  private onChange: (val: number | null) => void = () => { };
  private onTouched: () => void = () => { };
  private units: number = 0; // integer units
  private disabled = false;

  constructor(private el: ElementRef<HTMLInputElement>, private renderer: Renderer2) { }

  writeValue(value: number | null): void {
    if (value == null || isNaN(value)) {
      this.units = 0;
      this.setView();
      return;
    }
    this.units = Math.round(value * 1000);
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
      this.units = Math.floor(this.units / 10);
      this.propagate();
      return;
    }

    // ignore minus, dot, comma typed manually - we only accept digits
    if (/^\d$/.test(key)) {
      e.preventDefault();
      // append digit to the right (shifts previous digits left)
      this.units = this.units * 10 + Number(key);
      // optionally cap length to avoid overflow (e.g. max 12 digits)
      if (this.units > 999999999999) { this.units = 999999999999; }
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
      this.units = this.units * 10 + Number(ch);
      if (this.units > 999999999999) { this.units = 999999999999; break; }
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
    const value = this.units / 1000;
    this.setView();
    // notify angular forms
    this.onChange(Number(value.toFixed(3)));
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
    const valueStr = (this.units / 1000).toFixed(3);
    const display = valueStr + '%';
    this.renderer.setProperty(this.el.nativeElement, 'value', display);
  }
}