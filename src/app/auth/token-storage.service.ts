import { Injectable } from '@angular/core'; 
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() { }
  signOut(): void {
    window.sessionStorage.clear();
  }
  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
  public getToken(): string {
    var k = sessionStorage.getItem(TOKEN_KEY) ;
    return k == null ? "" : k;
  }
  public saveUser(user: string): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  public getUser(): any {
    var k = sessionStorage.getItem(USER_KEY);
    if(k != null)
      return JSON.parse(k)
    else
      return null;

  }
}
