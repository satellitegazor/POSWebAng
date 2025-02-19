import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, Subscription, delay, of } from 'rxjs';
import { LocalStorageService } from '../global/local-storage.service';
import { Router } from '@angular/router';

@Injectable()
export class InactiveLogoutInterceptor implements HttpInterceptor {
  
  tokenSubscription = new Subscription();
  
  constructor(private _localStorageSvc: LocalStorageService, private _router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.expirationCounter(300000);
    return next.handle(request);
  }

  expirationCounter(timeOut: number) {

    this.tokenSubscription.unsubscribe();
    this.tokenSubscription = of(null).pipe(delay(timeOut)).subscribe((expired) => {
      let appType = this._localStorageSvc.getItemData('apptype');

      if(appType == 'longterm') {
        this._router.navigateByUrl('/vlogon');
      }
      else if(appType == 'shortterm') {
        this._router.navigateByUrl('/rlogon');
      } 
      else if(appType == 'sbm') {
        this._router.navigateByUrl('/logon');
      }
    })
  }
}
