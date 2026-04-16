import { Injectable } from '@angular/core';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { PosApiService, Conus_GC_Balance_Model } from '../../../services/pos-api-service';
import { TicketTender } from 'src/app/models/ticket.tender';
import { catchError, concatMap, delay, finalize, from, map, Observable, of, switchMap, tap, toArray } from 'rxjs';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { addTender, saveTenderObj } from '../../store/ticketstore/ticket.action';
import { ToastService } from 'src/app/services/toast.service';
import { UiBlockService } from 'src/app/services/ui-block.service';
import { GlobalConstants } from 'src/app/global/global.constants';
import { CPOSAppType } from 'src/app/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class ConusRedeemGCwithAurusAPI {

  constructor(
    private _logonDataSvc: LogonDataService,
    private _salesTranSvc: PosApiService,
    private _store: Store<saleTranDataInterface>,
    private _toastSvc: ToastService,
    private _uiBlockSvc: UiBlockService) { }

  public redeem(giftCardTenders: TicketTender[]): Observable<void> {

    const regionCodeMap = new Map<string, number>([
      ['CON', 0],
      ['OCONE', 1],
      ['OCONP', 2],
    ]);

    if (giftCardTenders.length === 0) {
      this._toastSvc.info('No gift card tenders to redeem.');
      return of(void 0);
    }

    const guid = GlobalConstants.POST_GUID;
    const uid = this._logonDataSvc.getLTVendorLogonData().individualUID;
    const facilityNumber = this._logonDataSvc.getLTVendorLogonData().facilityNumber;

    this._toastSvc.info('Initiating Gift Card Redeem, please wait...');
    this._uiBlockSvc.block('Processing gift card redemption. Please wait...');

    return from(giftCardTenders).pipe(
      concatMap((tender, index) =>
        (index > 0 ? of(null).pipe(delay(500)) : of(null)).pipe(
          switchMap(() =>
            this._salesTranSvc.aurusGiftCardRedeemForConus(
              guid,
              uid,
              facilityNumber,
              tender.tenderAmount,
              tender.inStoreCardNbrTmp,
              tender.gcExpiryYear,
              tender.gcExpiryMonth,
              tender.ticketTenderId,
              tender.tenderTransactionId,
              regionCodeMap.get(sessionStorage.getItem('rgnCode') || 'CON') || 0,
              CPOSAppType.LongTerm
            ).pipe(
              tap((response: Conus_GC_Balance_Model) => {
                if (!response.results.success) {
                  this._toastSvc.error(
                    `Gift Card Redemption Failed: ${response.results.returnMsg}.<br/>Please complete the transaction using another tender method.`
                  );
                  return;
                }
                const tndrCopy = { ...tender } as TicketTender;
                tndrCopy.isAuthorized = true;
                tndrCopy.authNbr = response.stAuth;

                this._toastSvc.success(`Gift Card Redeemed Successfully: Auth ${response.stAuth}`);

                this._store.dispatch(addTender({ tndrObj: tndrCopy }));
                this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
              }),
              catchError(error => {
                this._toastSvc.error(
                  `Error redeeming gift card for tender ID ${tender.ticketTenderId}: ${error.message || error}`
                );
                return of(null); // Continue with remaining tenders even if one fails
              })
            )
          )
        )
      ),
      toArray(),
      map(() => void 0),
      catchError(error => {
        this._toastSvc.error(`Error during gift card redemptions: ${error.message || error}`);
        return of(void 0);
      }),
      finalize(() => this._uiBlockSvc.unblock())
    );
  }
}
