import { Injectable } from '@angular/core';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { CPOSWebSvcService } from '../services/cposweb-svc.service';
import { TicketTender } from 'src/app/models/ticket.tender';
import { catchError, concatMap, delay, forkJoin, from, map, Observable, of, switchMap, tap, toArray } from 'rxjs';
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { addTender, saveTenderObj } from '../store/ticketstore/ticket.action';
import { ToastService } from 'src/app/services/toast.service';
import { GCRedeemInput } from '../services/models/aurus-gift-card-redeem-resp';

@Injectable({
  providedIn: 'root'
})
export class RedeeemGiftCardTndrsService {

  constructor(private _logonDataSvc: LogonDataService, 
    private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<saleTranDataInterface>,
    private _toastSvc: ToastService) { }

      public redeem(giftCardTenders: TicketTender[]): Observable<void> {

        if (giftCardTenders.length === 0) {
            this._toastSvc.info('No gift card tenders to redeem.');
            return of(void 0);
        }
        this._toastSvc.info("Initiating Gift Card Redeem, please wait...");

        return from(giftCardTenders).pipe(
            concatMap((tender, index) => 
            (index > 0 ? of(null).pipe(delay(500)) : of(null)).pipe(
              switchMap(() => 
          this._cposWebSvc.GiftCardRedeem(new GCRedeemInput(tender.tenderTransactionId,
          tender.ticketTenderId,
          Number(tender.tndMaintUserId),
          tender.inStoreCardNbrTmp,
          tender.tenderAmount)
                ).pipe(
                  tap(response => {
                    const tndrCopy = { ...tender } as TicketTender;
                    tndrCopy.isAuthorized = true;
                    tndrCopy.authNbr = response.ApprovalCode;
                    tndrCopy.cardEndingNbr = response.CardEndingNbr;
                    tndrCopy.traceId = "false";
                    tndrCopy.tenderAmount = response.TotalApprovedAmount;
                    tndrCopy.inStoreCardNbrTmp = response.ACCT_NUM;
                    tndrCopy.fcTenderAmount = Number(Number(response.TotalApprovedAmount * this._logonDataSvc.getExchangeRate()).toCPOSFixed(2));

                    this._toastSvc.success(`Gift Card Redeemed Successfully: Card Ending Nbr ${response.CardEndingNbr}, Approved Amount ${tndrCopy.tenderAmount}`);

                    this._store.dispatch(addTender({ tndrObj: tndrCopy }));
                    this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
                  }),
                  catchError(error => {
                    this._toastSvc.error(`Error redeeming gift card for tender ID ${tender.ticketTenderId}: ${error.message || error}`);
                    return of(null); // Continue with other redemptions even if one fails
                  })
                )
              )
            )
          ),
          toArray(),
          map(() => void 0), // Return void observable
          catchError(error => {
            this._toastSvc.error(`Error during gift card redemptions: ${error.message || error}`);
            return of(void 0); // Return void observable on error
          })
        );
          
      }
}
