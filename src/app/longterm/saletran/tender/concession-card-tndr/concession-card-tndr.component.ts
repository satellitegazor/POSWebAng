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
import { TenderType } from '../../../models/tender.type';
import { addPinpadResp, addTender, markTendersComplete, markTicketComplete, saveCompleteTicketSplit, savePinpadResponse, saveTenderObj, updateTenderRRN } from '../../store/ticketstore/ticket.action';
import { UtilService } from 'src/app/services/util.service';
//import { VfoneCaptureTran } from '../../services/models/capture-tran.model';
import { forkJoin } from 'rxjs';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { TenderUtil } from '../tender-util';

@Component({
  selector: 'app-concession-card-tndr',
  imports: [],
  templateUrl: './concession-card-tndr.component.html',
  styleUrl: './concession-card-tndr.component.css'
})
export class ConcessionCardTndrComponent implements AfterViewInit {

  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;

  constructor(
    private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _utilSvc: UtilService) {
    // Initialization logic can go here if needed
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  private subscription: Subscription = {} as Subscription;
  tenderAmountDC: number = 0;
  tenderAmountNDC: number = 0;
  private _tndrObj: TicketTender = {} as TicketTender;

  ngOnInit(): void {

    if (typeof this._tndrObj === 'undefined' || this._tndrObj == null) {
      this._tndrObj = {} as TicketTender;
    }

    this.dcCurrSymbl = this._logonDataSvc.getLocationConfig().defaultCurrency;
    this.ndcCurrSymbl = this._logonDataSvc.getLocationConfig().currCode;

    forkJoin([
      this._store.select(getRemainingBal).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))

    ]).subscribe(([tenderBal, queryParams]) => {

      this._tndrObj.tenderAmount = tenderBal.amountDC
      this._tndrObj.fcTenderAmount = tenderBal.amountNDC;

      this.tenderAmountDC = tenderBal.amountDC;
      this.tenderAmountNDC = tenderBal.amountNDC;

      this._tndrObj.tenderTypeCode = queryParams['code'];

    });

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      this._tktObj = data;
    });

    //console.log("filling tender object with data ");
    this._tndrObj.tndMaintUserId = this._logonDataSvc.getLocationConfig().individualUID.toString();
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderStatus = TenderStatusType.Complete; // Assuming 1 is the
    this._tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
    this._tndrObj.rrn = this._utilSvc.getUniqueRRN();
    this._tndrObj.tenderTypeDesc = "";
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._tndrObj.ticketTenderId = 0;
    this._tndrObj.authNbr = '';

    let tndrCopy = JSON.parse(JSON.stringify(this._tndrObj))
    this._store.dispatch(addTender({ tndrObj: tndrCopy }));
    //this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
    
  }

  ngAfterViewInit(): void {

    //let exchNum = this._logonDataSvc.getLocationConfig().facilityNumber.substring(0, 4);
    //let IsRefund = this._logonDataSvc.getTenderTypes().types.find((t: TenderType) => t.tenderTypeCode == this._tndrObj.tenderTypeCode)?.isRefundType || false;

    // new Promise(f => setTimeout(f, 500));
    // this._tndrObj = JSON.parse(JSON.stringify(this._tktObj.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))

    //let newRRN = this._utilSvc.getUniqueRRN();
    
    // this._cposWebSvc.captureCardTran(newRRN, exchNum, this._tndrObj.tenderAmount, IsRefund).subscribe({
    //   next: (data) => {
    //     this._store.dispatch(updateTenderRRN({ oldRRN: this._tndrObj.rrn, newRRN: newRRN }));
    //     this._tndrObj.rrn = newRRN;
    //     this._captureTranResponse = data;
    //     //console.log("CaptureCardTran response: ", data);

    //     if (this._captureTranResponse.rslt?.IsSuccessful) {
    //       if (this._captureTranResponse.Result.toLowerCase().includes("approval") || this._captureTranResponse.Result.toLowerCase().includes("approved")) {

    //         //console.log("Transaction approved, proceeding with tender addition.");
    //         if (this.btnApprove) {
    //           this.btnApprove.nativeElement.click();
    //         }
    //         else {
    //           console.error("btnApprove element not found.");
    //         }
    //       }
    //       else {
    //         let btn = document.getElementById('btnDecline') as HTMLButtonElement;
    //         if (this.btnDecline) {
    //           //console.log("Transaction declined, proceeding with decline action.");
    //           this.btnDecline.nativeElement.click();
    //         }
    //         else {
    //           console.error("btnDecline element not found.");
    //         }
    //       }
    //     }
    //     else {
    //       console.error("Transaction failed: ", this._captureTranResponse.rslt.ReturnMsg);
    //       if (this.btnDecline) {
    //         this.btnDecline.nativeElement.click();
    //       }
    //       else {
    //         console.error("btnDecline 2 element not found.");
    //       }
    //     }
    //   },
    //   error: (err) => {
    //     console.error("Error capturing card transaction: ", err);
    //     if (this.btnDecline) {
    //       this.btnDecline.nativeElement.click();
    //     }
    //     else {
    //       console.error("btnDecline 3 element not found.");
    //     }
    //   }
    // });
  }

  ngOnDestroy(): void {

  }

  async btnApproveClick(evt: Event) {
    
    this._tndrObj = JSON.parse(JSON.stringify(this._tktObj.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))

    console.log("btnApproveClick Tender Object before update: ", this._tndrObj);

    this._tndrObj.tenderStatus = TenderStatusType.Complete; 
    this._tndrObj.isAuthorized = true;
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;


    let tndrCopy = JSON.parse(JSON.stringify(this._tndrObj))
    this._store.dispatch(addTender({ tndrObj: tndrCopy }));
    this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

    if (tktObjData != null && 
      TenderUtil.IsTicketComplete(tktObjData, this._logonDataSvc.getAllowPartPay())) {

      this._store.dispatch(markTendersComplete({ status: 4 }));
      this._store.dispatch(markTicketComplete({ status: 2 }));
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
}
