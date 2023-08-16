import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Round2DecimalService {

  constructor() { }

  public static round(num: any) {
    let val = Number.parseFloat(num);
    if(!isNaN(val)) {
      return Math.round((val + Number.EPSILON) * 100) / 100;
    }
    else {
      return 0;
    }
  }

}
