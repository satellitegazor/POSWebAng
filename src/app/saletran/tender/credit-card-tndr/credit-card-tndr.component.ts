import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { select, Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TicketSplit } from 'src/app/models/ticket.split';
import { filter, firstValueFrom, Subscription, take } from 'rxjs';
import { getRemainingBal, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { TenderType } from '../../models/tender.type';
import { addPinpadResp, addTender, saveCompleteTicketSplit, savePinpadResponse, saveTenderObj, updateTenderRRN } from '../../store/ticketstore/ticket.action';
import { UtilService } from 'src/app/services/util.service';
//import { VfoneCaptureTran } from '../../services/models/capture-tran.model';
import { forkJoin } from 'rxjs';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';

@Component({
  selector: 'app-credit-card-tndr',
  imports: [],
  templateUrl: './credit-card-tndr.component.html',
  styleUrl: './credit-card-tndr.component.css'
})
export class CreditCardTndrComponent implements AfterViewInit {
  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;

  constructor(private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _utilSvc: UtilService) {
    // Initialization logic can go here if needed
  }

  private _tktObj: TicketSplit = {} as TicketSplit;

  private _captureTranResponse: ExchCardTndr = {} as ExchCardTndr;
  private subscription: Subscription = {} as Subscription;

  private _tndrObj: TicketTender = {} as TicketTender;

  ngOnInit(): void {

    if (typeof this._tndrObj === 'undefined' || this._tndrObj == null) {
      this._tndrObj = {} as TicketTender;
    }


  // this.subscription = forkJoin([
  //   this._store.pipe(select(getRemainingBal)),
  //   this._store.pipe(select(getTktObjSelector)),
    
  // ]).pipe(
  //   filter(([bal, tktObj]) => !!bal && !!tktObj)
  // ).subscribe(([bal, tktObj]) => {
  //   //console.log('All data loaded:', { bal, tktObj });
  //     this._tktObj = tktObj != null ? tktObj : {} as TicketSplit;
  //     this._tndrObj.tenderAmount = bal.amountDC
  //     this._tndrObj.fcTenderAmount = bal.amountNDC;    
  //     //console.log("Tender Amount: ", this._tndrObj.tenderAmount);
  // });


    this.activatedRoute.queryParams.subscribe(params => {
      this._tndrObj.tenderTypeCode = params['code'];
    })

    this._store.select(getRemainingBal).subscribe(data => {
      this._tndrObj.tenderAmount = data.amountDC
      this._tndrObj.fcTenderAmount = data.amountNDC;
      //console.log("selector getRemainingBal Tender Amount: ", this._tndrObj.tenderAmount);
    })

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      //console.log("getTktObjSelector data: ", data);
      this._tktObj = data;
    })

    //console.log("filling tender object with data ");
    this._tndrObj.tndMaintUserId = this._logonDataSvc.getLocationConfig().individualUID.toString();
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderStatus = TenderStatusType.InProgress; // Assuming 1 is the
    this._tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
    this._tndrObj.rrn = this._utilSvc.getUniqueRRN();
    this._tndrObj.tenderTypeDesc = "pinpad";
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._tndrObj.ticketTenderId = 0;

    let tndrCopy = JSON.parse(JSON.stringify(this._tndrObj))
    this._store.dispatch(addTender({ tndrObj: tndrCopy }));
    this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
    
    this.dcCurrSymbl = this._logonDataSvc.getLocationConfig().defaultCurrency;
    this.ndcCurrSymbl = this._logonDataSvc.getLocationConfig().currCode;
  }

  ngAfterViewInit(): void {

    let exchNum = this._logonDataSvc.getLocationConfig().facilityNumber.substring(0, 4);
    let IsRefund = this._logonDataSvc.getTenderTypes().types.find((t: TenderType) => t.tenderTypeCode == this._tndrObj.tenderTypeCode)?.isRefundType || false;

    new Promise(f => setTimeout(f, 500));
    this._tndrObj = JSON.parse(JSON.stringify(this._tktObj.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))

    let newRRN = this._utilSvc.getUniqueRRN();

    this._cposWebSvc.captureCardTran(newRRN, exchNum, this._tndrObj.tenderAmount, IsRefund).subscribe({
      next: (data) => {
        this._store.dispatch(updateTenderRRN({ oldRRN: this._tndrObj.rrn, newRRN: newRRN }));
        this._tndrObj.rrn = newRRN;
        this._captureTranResponse = data;
        //console.log("CaptureCardTran response: ", data);

        if (this._captureTranResponse.rslt?.IsSuccessful) {
          if (this._captureTranResponse.Result.toLowerCase().includes("approval") || this._captureTranResponse.Result.toLowerCase().includes("approved")) {

            //console.log("Transaction approved, proceeding with tender addition.");
            if (this.btnApprove) {
              this.btnApprove.nativeElement.click();
            }
            else {
              console.error("btnApprove element not found.");
            }
          }
          else {
            let btn = document.getElementById('btnDecline') as HTMLButtonElement;
            if (this.btnDecline) {
              //console.log("Transaction declined, proceeding with decline action.");
              this.btnDecline.nativeElement.click();
            }
            else {
              console.error("btnDecline element not found.");
            }
          }
        }
        else {
          console.error("Transaction failed: ", this._captureTranResponse.rslt.ReturnMsg);
          if (this.btnDecline) {
            this.btnDecline.nativeElement.click();
          }
          else {
            console.error("btnDecline 2 element not found.");
          }
        }
      },
      error: (err) => {
        console.error("Error capturing card transaction: ", err);
        if (this.btnDecline) {
          this.btnDecline.nativeElement.click();
        }
        else {
          console.error("btnDecline 3 element not found.");
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
  }

  async btnApproveClick(evt: Event) {
    
    new Promise(f => setTimeout(f, 500));
    //console.log("btnApprove clicked");

    this._tndrObj = JSON.parse(JSON.stringify(this._tktObj.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))

    console.log("btnApproveClick Tender Object before update: ", this._tndrObj);

    this._tndrObj.tenderStatus = TenderStatusType.Complete; // Assuming 2 is the status for approved tender
    this._tndrObj.authNbr = this._captureTranResponse.AUTH_CODE;
    this._tndrObj.tenderAmount = this._captureTranResponse.APPROVED_AMOUNT;
    this._tndrObj.cardEndingNbr = this._captureTranResponse.ACCT_NUM.slice(-4);;
    this._tndrObj.tenderTypeDesc = "pinpad";
    this._tndrObj.inStoreCardNbrTmp = this._captureTranResponse.ACCT_NUM;
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;

    let tndrCopy = JSON.parse(JSON.stringify(this._tndrObj))
    this._store.dispatch(addTender({ tndrObj: tndrCopy }));
    this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
    this._store.dispatch(addPinpadResp({ respObj: this._captureTranResponse }));
    this._store.dispatch(savePinpadResponse({ respObj: this._captureTranResponse }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

    if (tktObjData != null && this.IsTicketComplete(tktObjData)) {
      this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData }));
      this.route.navigate(['/savetktsuccess']);
    }
    else {
      this.route.navigate(['/checkout']);
    }
  }

  btnDeclineClick(evt: Event) {
    this.route.navigate(['/checkout']);
  }

  btnCancelClick(evt: Event) {
    //console.log("btnCancel clicked");
  }

  private IsTicketComplete(tktObj: TicketSplit): boolean {

    if (tktObj.tktList.length == 0) {
      //console.log("Ticket is empty, cannot be completed.");
      return false;
    }

    if (tktObj.ticketTenderList.length == 0) {
      //console.log("No tenders found for the ticket, cannot be completed.");
      return false;
    }
    let ticketTotal = 0;

    for (const key in tktObj.tktList) {
      ticketTotal += parseFloat((tktObj.tktList[key].lineItemDollarDisplayAmount).toFixed(2));
    }

    for (const key in tktObj.associateTips) {
      ticketTotal += parseFloat((tktObj.associateTips[key].tipAmount).toFixed(2));
    }

    let allowPartPay = this._logonDataSvc.getAllowPartPay();

    let tenderTotals = 0;
    tktObj.ticketTenderList.forEach((tender) => {
      tenderTotals += parseFloat((tender.tenderAmount).toFixed(2));
    })

    if ((allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals) || Number(ticketTotal).toFixed(2) == Number(tenderTotals).toFixed(2)) {
      //console.log("Ticket is complete with total: " + ticketTotal + " and tender total: " + tenderTotals);
      return true;
    }
    else {
      //console.log("Ticket is not complete. Ticket total: " + ticketTotal + ", Tender total: " + tenderTotals);
      return false;
    }
  }
}
