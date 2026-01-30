import { Store } from "@ngrx/store";
import { forkJoin, take } from "rxjs";
import { saleTranDataInterface } from "../store/ticketstore/ticket.state";
import { CPOSWebSvcService } from "../services/cposweb-svc.service";
import { getTicketTendersSelector, getTicketTotalToPayDC, getTicketTotalToPayNDC } from "../store/ticketstore/ticket.selector";
import { TicketTender } from "src/app/models/ticket.tender";
import { TenderUtil } from "./tender-util";
import { LogonDataService } from "src/app/global/logon-data-service.service";
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ToastService } from "src/app/services/toast.service";

export class RedeemGiftCardTenders {
    public static redeem(_store: Store<saleTranDataInterface>, 
        _cposWebSvc: CPOSWebSvcService,
        _logonDataSvc: LogonDataService,
        _toastSvc: ToastService
        ): boolean {

        forkJoin([
            _store.select(getTicketTotalToPayDC).pipe(take(1)),
            _store.select(getTicketTotalToPayNDC).pipe(take(1)),
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

            from(tndrs).pipe(
                concatMap(t => {
                    const tndrCopy = TenderUtil.copyTenderObj(t);
                    _toastSvc.info(`Redeeming Gift Card : ${t.cardEndingNbr} for amount ${t.tenderAmount}... Please wait.`);
                    return _cposWebSvc
                        .GiftCardRedeem(
                            t.tenderTransactionId,
                            t.ticketTenderId,
                            0,
                            t.inStoreCardNbrTmp,
                            t.tenderAmount
                        )
                        .pipe(
                            take(1),
                            // attach tender context to the response
                            concatMap(data => {
                                if (data.rslt.IsSuccessful) {
                                    tndrCopy.isAuthorized = true;
                                    tndrCopy.authNbr = data.ApprovalCode;
                                    tndrCopy.cardEndingNbr = data.CardEndingNbr;
                                    tndrCopy.traceId = "false";
                                    tndrCopy.tenderAmount = data.AuthorizedAmount;
                                    tndrCopy.fcTenderAmount =
                                        Number(Number(data.AuthorizedAmount * _logonDataSvc.getExchangeRate()).toFixed(2));

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