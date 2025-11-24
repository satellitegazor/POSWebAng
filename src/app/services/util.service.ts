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
    ['XC', 'pinpadtran'],
    ['XR', 'pinpadtran'],
    ['GC', 'pinpadtran'],
    ['CC', 'tender'],
    ['EG', 'eaglecash'],
    ['MS', 'pinpadtran']
  ]);
}

export class CPOSAppType {
  static readonly LongTerm = 2; // Example value, adjust as needed
  static readonly ShortTerm = 1; // Example value, adjust as needed
  // Add other app types as necessary
}
