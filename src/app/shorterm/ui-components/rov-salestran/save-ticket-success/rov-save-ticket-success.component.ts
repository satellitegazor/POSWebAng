import { Component, OnInit, OnDestroy } from '@angular/core';
import { RovSaleTranDataInterface } from '../../../store/ticketstore/rticket.state';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { RovLogonDataService } from "../../../rov-logon-data.service";
import { resetRovTktObj, saveRovTicketForGuestCheckSuccess } from '../../../store/ticketstore/rticket.action';
import { RSaveTicketResultsModel } from '../../../models/rticket.split';
import { getRSavedTicketResult } from '../../../store/ticketstore/rticket.selector';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PinValidateComponent } from '../../pin-validate/pin-validate.component';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorLoginResultsModel } from '../../../../models/vendor.login.results.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-rov-save-ticket-success',
    templateUrl: './rov-save-ticket-success.component.html',
    styleUrls: ['./rov-save-ticket-success.component.css'],
    imports : [PinValidateComponent, CommonModule, FormsModule]
})
export class RovSaveTicketSuccessComponent implements OnInit, OnDestroy {

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    container: 'body',
    size: 'lg'
  };

  
  private _hasOpenedTicketStatusDialog = false;
  private _destroy$ = new Subject<void>();
  private _selectorSubscription: any;


  constructor(private _store: Store<RovSaleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: RovLogonDataService,
    private _modalService: NgbModal){

  }

  saveTktRsltMdl: RSaveTicketResultsModel = {} as RSaveTicketResultsModel;

  tktSaveResultMessage: string = '';
  businessFunctionCode: string = '';

  ngOnInit(): void {

    let evtConfig = this._logonDataSvc.getRovEventConfig();
    this.businessFunctionCode = evtConfig.busFuncCode;

    // Only subscribe to selector when this component is actively displayed
    this._selectorSubscription = this._store.select(getRSavedTicketResult)
      .pipe(
        takeUntil(this._destroy$)
      )
      .subscribe(data => {
        this.saveTktRsltMdl = data;
        this.tktSaveResultMessage = this.saveTktRsltMdl.ticketNumber > 0 ? ('Ticket save Successful')  : 'Ticket saving...';

      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the store selector when component is destroyed
    this._destroy$.next();
    this._destroy$.complete();
  }

  ReceiptOption(optn: string) {

    sessionStorage.setItem('inProgTranId', '0');
    sessionStorage.setItem('inProgTranTabSerialNum', '');

    let evtConfig = this._logonDataSvc.getRovEventConfig();
    this._logonDataSvc.setTranIsRefund(false);
    
    this._store.dispatch(resetRovTktObj({ eventConfig: evtConfig }));

    if(evtConfig.pinReqdForSalesTran) {
      const modalRef = this._modalService.open(PinValidateComponent);
      modalRef.result.then((loginResult?: VendorLoginResultsModel) => {
        if (loginResult?.isAuthorized) {
          this.route.navigate(['/ritemsel']);
        }
      }).catch(() => undefined);
    }
    else {
      this.route.navigate(['/ritemsel'])
    }
  }
}
