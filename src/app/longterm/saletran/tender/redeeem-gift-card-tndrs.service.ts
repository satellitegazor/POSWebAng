import { Injectable } from '@angular/core';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { CPOSWebSvcService } from '../services/cposweb-svc.service';
import { TicketTender } from 'src/app/models/ticket.tender';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { addTender, saveTenderObj } from '../store/ticketstore/ticket.action';

@Injectable({
  providedIn: 'root'
})
export class RedeeemGiftCardTndrsService {

  constructor(private _logonDataSvc: LogonDataService, 
    private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<saleTranDataInterface>) { }

      public redeem(giftCardTenders: TicketTender[]): Observable<void> {
          const redemptionOps = giftCardTenders.map(tender => 
              this._cposWebSvc.GiftCardRedeem(tender.tenderTransactionId, tender.ticketTenderId, 0, tender.inStoreCardNbrTmp, tender.tenderAmount)
              .pipe(
                  tap(response => {
                    let tndrCopy = JSON.parse(JSON.stringify(tender)) as TicketTender;
                    tndrCopy.isAuthorized = true;
                    tndrCopy.authNbr = response.ApprovalCode;
                    tndrCopy.cardEndingNbr = response.CardEndingNbr;
                    tndrCopy.traceId = "false";
                    tndrCopy.tenderAmount = response.TotalApprovedAmount;
                    tndrCopy.inStoreCardNbrTmp = decodeURIComponent(response.ACCT_NUM);
                    tndrCopy.fcTenderAmount = Number(Number(response.TotalApprovedAmount * this._logonDataSvc.getExchangeRate()).toFixed(2));
                  
                    this._store.dispatch(addTender({ tndrObj: tndrCopy }));
                    this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
                  }),
              catchError(error => {
                  console.error(`Error redeeming gift card for tender ID ${tender.ticketTenderId}:`, error);
                  return of(null); // Continue with other redemptions even if one fails
              })
          ));
  
          return forkJoin(redemptionOps).pipe(
              map(() => void 0),   
              catchError(error => {
                  console.error('Error during gift card redemptions:', error);
                  return of(void 0); // Return void observable on error
                  
              })
          );
      }
}
