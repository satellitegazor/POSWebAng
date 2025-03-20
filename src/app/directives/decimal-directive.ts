import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appdecimal]'
})
export class DecimalDirective {
  @Input() decimalSeparator: string = '.';
  @Input() thousandSeparator: string = ',';

  private readonly allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', this.decimalSeparator];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.allowedKeys.indexOf(event.key) !== -1 ||
        (event.key >= '0' && event.key <= '9') ||
        (event.ctrlKey === true && (event.key === 'a' || event.key === 'c' || event.key === 'x' || event.key === 'v'))) {
      return;
    } else {
      event.preventDefault();
    }
  }

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    let value = event.target.value;
    
    // Remove non-numeric characters except decimal separator
    value = value.replace(new RegExp(`[^0-9${this.decimalSeparator}]`, 'g'), '');

    // Allow only one decimal separator
    const decimalSeparatorCount = (value.split(this.decimalSeparator).length - 1);
    if (decimalSeparatorCount > 1) {
      value = value.substring(0, value.lastIndexOf(this.decimalSeparator));
    }

    // Handle leading decimal
    if (value.startsWith(this.decimalSeparator)) {
      value = '0' + value;
    }

    // Format with thousand separators
    if (value && !isNaN(parseFloat(value))) {
      const parts = value.split(this.decimalSeparator);
      if(parts.length > 1) {
        if(parts[1].length > 2) {
            parts[0] = parts[0] + parts[1].substring(0, 1);
            parts[1] = parts[1].substring(1)
        }
      }
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
      value = parts.join(this.decimalSeparator);
    }
    
    event.target.value = value;
    this.el.nativeElement.value = value; // Update the displayed value
  }

  @HostListener('blur', ['$event'])
  onBlur(event: any) {
    let value = event.target.value;
    if (value.endsWith(this.decimalSeparator)) {
      value = value.slice(0, -1);
    }
    event.target.value = value;
    this.el.nativeElement.value = value;
  }
}

// import { Directive, HostListener, ElementRef, Input } from '@angular/core';

// @Directive({
//   selector: '[appDecimal]'
// })
// export class DecimalDirective {
//   @Input() decimalSeparator: string = '.';
//   @Input() thousandSeparator: string = ',';

//   private readonly allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', this.decimalSeparator];

//   constructor(private el: ElementRef) {}

//   @HostListener('keydown', ['$event'])
//   onKeyDown(event: KeyboardEvent) {
//     if (this.allowedKeys.indexOf(event.key) !== -1 ||
//         (event.key >= '0' && event.key <= '9') ||
//         (event.ctrlKey === true && (event.key === 'a' || event.key === 'c' || event.key === 'x' || event.key === 'v'))) {
//       return;
//     } else {
//       event.preventDefault();
//     }
//   }

//   @HostListener('input', ['$event'])
//   onInputChange(event: any) {
//     let value = event.target.value;
    
//     // Remove non-numeric characters except decimal separator
//     value = value.replace(new RegExp(`[^0-9${this.decimalSeparator}]`, 'g'), '');

//     // Allow only one decimal separator
//     const decimalSeparatorCount = (value.split(this.decimalSeparator).length - 1);
//     if (decimalSeparatorCount > 1) {
//       value = value.substring(0, value.lastIndexOf(this.decimalSeparator));
//     }

//     // Handle leading decimal
//     if (value.startsWith(this.decimalSeparator)) {
//       value = '0' + value;
//     }

//     // Format with thousand separators
//     if (value && !isNaN(parseFloat(value))) {
//       const parts = value.split(this.decimalSeparator);
//       parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandSeparator);
//       value = parts.join(this.decimalSeparator);
//     }
    
//     event.target.value = value;
//     this.el.nativeElement.value = value; // Update the displayed value
//   }

//   @HostListener('blur', ['$event'])
//   onBlur(event: any) {
//     let value = event.target.value;
//     if (value.endsWith(this.decimalSeparator)) {
//       value = value.slice(0, -1);
//     }
//     event.target.value = value;
//     this.el.nativeElement.value = value;
//   }
// }


/////////////////////////////////////////////////////////////////////////////////////////////////

// import { Directive, HostListener, ElementRef, Input } from '@angular/core';

// @Directive({
//   selector: '[appDecimal]'
// })
// export class DecimalDirective {

//   @Input() decimalSeparator: string = '.';
//   @Input() precision: number = 2;

//   private regex: RegExp;

//   constructor(private el: ElementRef) {
//     this.regex = new RegExp(`^[-]?\\d*(\\${this.decimalSeparator}\\d{0,${this.precision}})?$`);
//   }

//   @HostListener('input', ['$event'])
//   onInputChange(event: Event) {
//     const initialValue = this.el.nativeElement.value;
//     let newValue = initialValue.replace(/[^0-9.-]/g, '').replace(/(\..*)\./g, '$1');

//     if (newValue !== '-' && !this.regex.test(newValue)) {
//       newValue = initialValue;
//     }

//     this.el.nativeElement.value = newValue;

//     if (initialValue !== this.el.nativeElement.value) {
//       event.stopPropagation();
//     }
//   }
// }