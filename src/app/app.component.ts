import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, Subject, takeUntil } from 'rxjs';
import { getTktObjSelector } from './longterm/saletran/store/ticketstore/ticket.selector';
import { saleTranDataInterface } from './longterm/saletran/store/ticketstore/ticket.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(
    private route: Router,
    private _store: Store<saleTranDataInterface>) {

  }
  
  vlogout() {

    this.route.navigate(['/vlogon']);
  }
  Region: String = 'Europe';
  title = 'CPOSWeb';
  TicketNumber: number = 0

  public ngOnInit(): void {
    this._store.pipe(
      select(getTktObjSelector),
      map((tktObj) => tktObj?.ticketNumber ?? 0),
      takeUntil(this._destroy$)
    ).subscribe((ticketNumber) => {
      this.TicketNumber = ticketNumber;
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  DisplayAlertMsg(msg: string) {

  }
}
