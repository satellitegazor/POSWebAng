import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  public getUniqueRRN(): string {  
    const date = new Date();
    const year = date.getFullYear().toString(); // Last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
  }

  public tenderCodePageMap = new Map<string, string>([
    ['btnSplitPay', 'splitpay'],
    ['CK', 'cashcheck'],
    ['CA', 'cashcheck'],
    ['XC', 'pinpadtran'],
    ['XR', 'pinpadtran'],
    ['GC', 'gcinquiry'],
    ['CC', 'cctender'],
    ['EG', 'eaglecash'],
    ['MS', 'pinpadtran']
  ]);

  public currencySymbols = new Map<string, string>([
    ['USD', '$'],
    ['EUR', '€'],
    ['GBP', '£'],
    ['JPY', '¥'],
    ['KRW', '₩'],
    ['TRY', '₺'],
    ['PLN', 'zł'],
  ]);

  public tenderCodeDescMap = new Map<string, string>([
    ['CK', 'Check'],
    ['CA', 'Cash'],
    ['XC', 'Credit Card'],
    ['XR', 'Credit Card Refund'],
    ['GC', 'Exchange Gift Card'],
    ['CC', 'Concession Credit Card'],
    ['EG', 'Eagle Cash'],
    ['MS', 'Military Star Card'],
  ]);

  public cardBinRanges = new Map<string, string[]>([
    ['Visa', ['4']],
    ['MasterCard', ['51', '52', '53', '54', '55', '22', '23', '24', '25', '26', '27']],
    ['American Express', ['34', '37']],
    ['650155', ['Military Star']],
    ['Discover', ['6011', '622126', '622925', '644', '645', '646', '647', '648', '649', '65']],
    ['JCB', ['3528', '3589']],
    ['Diners Club', ['300', '301', '302', '303', '304', '305', '36', '38']],
  ]);
}

export class CPOSAppType {
  static readonly LongTerm = 2; // Example value, adjust as needed
  static readonly ShortTerm = 1; // Example value, adjust as needed
  // Add other app types as necessary
}
