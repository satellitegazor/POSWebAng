import { Store } from "@ngrx/store";
import { forkJoin, Observable, of, take } from "rxjs";
import { catchError, tap, map } from "rxjs/operators";
import { saleTranDataInterface } from "../store/ticketstore/ticket.state";
import { CPOSWebSvcService } from "../services/cposweb-svc.service";
import { getTicketTendersSelector, getTicketTotalToPayUSD, getTicketTotalToPayFC } from "../store/ticketstore/ticket.selector";
import { TicketTender } from "src/app/models/ticket.tender";
import { TenderUtil } from "./tender-util";
import { LogonDataService } from "src/app/global/logon-data-service.service";
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ToastService } from "src/app/services/toast.service";
import { ExchCardTndr } from "src/app/models/exch.card.tndr";
import { GCRedeemInput } from "../services/models/aurus-gift-card-redeem-resp";

export class RedeemGiftCardTenders {

    public redeem(giftCardTenders: TicketTender[], _cposWebSvc: CPOSWebSvcService, _logonDataSvc: LogonDataService): Observable<void> {

        const redemptionOps = giftCardTenders.map(tender => 
        _cposWebSvc.GiftCardRedeem(new GCRedeemInput(tender.tenderTransactionId,
            tender.ticketTenderId,
            Number(tender.tndMaintUserId),
            tender.inStoreCardNbrTmp,
            tender.tenderAmount))
            .pipe(
                tap(response => {
                tender.isAuthorized = true;
                tender.authNbr = response.ApprovalCode;
                tender.cardEndingNbr = response.CardEndingNbr;
                tender.traceId = "false";
                tender.tenderAmount = response.TotalApprovedAmount;
                tender.inStoreCardNbrTmp = response.ACCT_NUM;
                tender.fcTenderAmount = Number(Number(response.TotalApprovedAmount * _logonDataSvc.getExchangeRate()).toFixed(2));
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



    private pinPadResp: ExchCardTndr = {} as ExchCardTndr;
    public redeemOld(_store: Store<saleTranDataInterface>, 
        _cposWebSvc: CPOSWebSvcService,
        _logonDataSvc: LogonDataService,
        _toastSvc: ToastService
        ): boolean {

        forkJoin([
            _store.select(getTicketTotalToPayUSD).pipe(take(1)),
            _store.select(getTicketTotalToPayFC).pipe(take(1)),
            _store.select(getTicketTendersSelector).pipe(take(1))
        ]).subscribe(([totalDC, totalNDC, tndrs]) => {
    
            tndrs = tndrs?.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false) || [] as TicketTender[];

            if(tndrs.length == 0) {
                return;
            }



            // tndrs.forEach(t => {
            //     let tndrCopy = TenderUtil.copyTenderObj(t);
            //     _cposWebSvc.GiftCardRedeem(t.tenderTransactionId, t.ticketTenderId, 0, t.inStoreCardNbrTmp, t.tenderAmount).subscribe({
            //         next: (data) => {   
            //             if (data.rslt.IsSuccessful) {
            //                 tndrCopy.isAuthorized = true;
            //                 tndrCopy.authNbr = data.ApprovalCode;
            //                 tndrCopy.cardEndingNbr = data.CardEndingNbr;
            //                 tndrCopy.traceId = "false";
            //                 tndrCopy.tenderAmount = data.AuthorizedAmount;
            //                 tndrCopy.fcTenderAmount = data.AuthorizedAmount * _logonDataSvc.getExchangeRate();
            //                 _store.dispatch({ type: '[Ticket] Add Tender', tndrObj: tndrCopy });
            //                 _store.dispatch({ type: '[Ticket] Save Tender Obj', tndrObj: tndrCopy });
            //             }
            //         }
            //     });
            // });

            return from(tndrs).pipe(
                concatMap(t => {
                    const tndrCopy = TenderUtil.copyTenderObj(t);
                    _toastSvc.info(`Redeeming Gift Card : ${t.cardEndingNbr} for amount ${t.tenderAmount}... Please wait.`);
                    let dataVal = new GCRedeemInput(
                        tndrCopy.tenderTransactionId,
                        tndrCopy.ticketTenderId,
                        Number(tndrCopy.tndMaintUserId),
                        tndrCopy.inStoreCardNbrTmp,
                        tndrCopy.tenderAmount);
                    return _cposWebSvc
                        .GiftCardRedeem(dataVal)               
                        .pipe(
                            take(1),
                            // attach tender context to the response
                            concatMap(data => {
                                if (data.rslt.IsSuccessful) {
                                    tndrCopy.isAuthorized = true;
                                    tndrCopy.authNbr = data.ApprovalCode;
                                    tndrCopy.cardEndingNbr = data.CardEndingNbr;
                                    tndrCopy.traceId = "false";
                                    tndrCopy.tenderAmount = data.TotalApprovedAmount;
                                    tndrCopy.inStoreCardNbrTmp = data.ACCT_NUM;
                                    tndrCopy.fcTenderAmount =
                                        Number(Number(data.TotalApprovedAmount * _logonDataSvc.getExchangeRate()).toFixed(2));

                                    _store.dispatch({
                                        type: '[Ticket] Add Tender',
                                        tndrObj: tndrCopy
                                    });

                                    _store.dispatch({
                                        type: '[Ticket] Save Tender Obj',
                                        tndrObj: tndrCopy
                                    });
                                }

                                // IMPORTANT: return a completed observable so concatMap continues
                                return [];
                            })
                        );
                })
            ).subscribe();



        });
        return true;
    }
}