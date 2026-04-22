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
logonUserRoleType: string = '';

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

  gotoMainMenu() {
    this.route.navigate(['/mainmenu']);
  }

  Region: String = 'Europe';
  title = 'CPOSWeb';
  TicketNumber: number = 0
  isUiBlocked: boolean = false;
  uiBlockMessage: string = 'Please wait...';
  isUserLoggedIn: boolean = false;
  VendorNumber: any;
  facilityNumber: any;

  get centerHeadingTitle(): string {
    const path = (this.route.url || '').split('?')[0].toLowerCase();

    switch (true) {
      case path.includes('/rptsettlement'):
        return 'Settlement Report';
      case path.includes('/rptsalestran'):
        return 'Sales Transaction Report';
      case path.includes('/rptmenu'):
        return 'Reports Menu';
      case path.includes('/rptbaldue'):
        return 'Balance Due Tickets Report';
      case path.includes('/rptcncld'):
        return 'Cancelled Tickets Report';
      case path.includes('/rptnosale'):
        return 'No Sale Report';
      case path.includes('/ltktrcpt'):
        return 'Ticket Receipt';
      case path.includes('/rptpricelist'):
        return 'Price List Report';
      case path.includes('/rptcashdrw'):
        return 'Cash Drawer Report';
      default:
        return 'Point of Sale';
    }
  }

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
      this.VendorName = headerContext.vendorName;
      this.LocationName = headerContext.locationName;
      this.logonUserName = headerContext.associateName;
      this.logonUserRole = headerContext.associateRoleDesc;
      this.logonUserRoleType = headerContext.associateRole;
      this.isUserLoggedIn = !!headerContext.associateName;
      this.VendorNumber = headerContext.vendorNumber;
      this.facilityNumber = headerContext.facilityNumber;
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
