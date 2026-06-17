import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiBlockService {
  private _blockCount = 0;
  private _isBlockedSubject = new BehaviorSubject<boolean>(false);
  private _messageSubject = new BehaviorSubject<string>('Please wait...');

  readonly isBlocked$ = this._isBlockedSubject.asObservable();
  readonly message$ = this._messageSubject.asObservable();

  public block(message: string = 'Please wait...'): void {
    this._blockCount += 1;
    this._messageSubject.next(message);
    if (this._blockCount > 0) {
      this._isBlockedSubject.next(true);
    }
  }

  public unblock(): void {
    this._blockCount = Math.max(0, this._blockCount - 1);
    if (this._blockCount === 0) {
      this._isBlockedSubject.next(false);
      this._messageSubject.next('Please wait...');
    }
  }
}
