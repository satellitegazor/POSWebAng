import { HTTP_INTERCEPTORS, HttpEvent, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { TokenStorageService } from './token-storage.service';
import { Observable } from 'rxjs';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private token: TokenStorageService, private tokenExtractor: HttpXsrfTokenExtractor) {}

  private actions: string[] = ['POST', 'PUT', 'DELETE', 'GET', 'OPTIONS'];

  intercept(req: HttpRequest<any>, newReq: HttpHandler): Observable<HttpEvent<any>> {

    //const token = this.tokenExtractor.getToken(); 
    //if (token != null) {
    //  req.headers.set('__RequestVerificationToken', token);
    //}

    //let authreq = req;
    //const tokenHdr = this.token.getToken();
    //if (tokenHdr != null) {
    //  authreq = req.clone({headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + tokenHdr)});
    //}
    //return next.handle(authreq);

      let tokenInfo = localStorage.getItem('jwtToken');

      if (tokenInfo) {
          req = req.clone({
              setHeaders: {
                  Authorization: 'Bearer ' + tokenInfo,
                  'Content-Type': 'application/json;charset=utf-8'
              }
          });
      }
      return newReq.handle(req);
  }
}

export const authinterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
];
