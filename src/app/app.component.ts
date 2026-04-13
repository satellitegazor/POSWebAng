import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map, Subject, takeUntil } from 'rxjs';
import { getTktObjSelector } from './longterm/saletran/store/ticketstore/ticket.selector';
import { saleTranDataInterface } from './longterm/saletran/store/ticketstore/ticket.state';
import { LogonDataService } from './global/logon-data-service.service';
import { UiBlockService } from './services/ui-block.service';
import { getLocCnfgHeaderContextSelector } from './longterm/saletran/store/locationconfigstore/locationconfig.selector';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
VendorName: any;
LocationName: any;
logonUserName: any;
logonUserRole: any;

  constructor(
    private route: Router,
    private _store: Store<saleTranDataInterface>,
    private _logonDataSvc: LogonDataService,
    private _uiBlockSvc: UiBlockService) {

  }
  
  vlogout() {
    this._logonDataSvc.clearTenderTypes();
    this.route.navigate(['/vlogon']);
  }
  Region: String = 'Europe';
  title = 'CPOSWeb';
  TicketNumber: number = 0
  isUiBlocked: boolean = false;
  uiBlockMessage: string = 'Please wait...';

  public ngOnInit(): void {
    this._store.pipe(
      select(getTktObjSelector),
      map((tktObj) => tktObj?.ticketNumber ?? 0),
      takeUntil(this._destroy$)
    ).subscribe((ticketNumber) => {
      this.TicketNumber = ticketNumber;
    });

    this._uiBlockSvc.isBlocked$.pipe(takeUntil(this._destroy$)).subscribe((isBlocked) => {
      this.isUiBlocked = isBlocked;
    });

    this._uiBlockSvc.message$.pipe(takeUntil(this._destroy$)).subscribe((message) => {
      this.uiBlockMessage = message;
    });

    this._store.pipe(
      select(getLocCnfgHeaderContextSelector),
      takeUntil(this._destroy$)
    ).subscribe((headerContext) => {
      this.VendorName = headerContext.associateName;
      this.LocationName = headerContext.locationName;
      this.logonUserName = headerContext.associateName;
      this.logonUserRole = headerContext.associateRole;
    });



  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  DisplayAlertMsg(msg: string) {
    alert(msg);
  }
}
