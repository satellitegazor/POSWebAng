import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, State, Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { SalesTranService } from "../../services/sales-tran.service";
import { saveTicketForGuestCheck, saveTicketForGuestCheckSuccess, saveTicketForGuestCheckFailed, saveCompleteTicketSplit, saveCompleteTicketSplitSuccess, saveCompleteTicketSplitFailed, saveTenderObj, saveTenderObjSuccess, saveTenderObjFailed, savePinpadResponse, savePinpadResponseFailed, savePinpadResponseSuccess } from "./ticket.action";
import { saleTranDataInterface } from "./ticket.state";
import { getTktObjSelector } from './ticket.selector';
import { CPOSAppType } from "src/app/services/util.service";


@Injectable()
export class TicketObjectEffects {
    constructor(private action$: Actions, private saleTranSvc: SalesTranService, private store: Store<saleTranDataInterface>) {    }

    saveTicketForGuestCheckEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveTicketForGuestCheck),
            mergeMap((action) => {

                return this.saleTranSvc.saveTicketForGuestCheck(action.tktObj).pipe(
                    map(rslt => {
                        return saveTicketForGuestCheckSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveTicketForGuestCheckFailed(errResp));
                    })                        
                )
            })
        )
    });

    saveCompleteTicketSplitEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveCompleteTicketSplit),
            mergeMap((action) => {

                return this.saleTranSvc.saveCompleteTicketSplit(action.tktObj).pipe(
                    map(rslt => {
                        return saveCompleteTicketSplitSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveCompleteTicketSplitFailed(errResp));
                    })                        
                )
            })
        )
    });
    saveTenderEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveTenderObj),
            mergeMap((action) => {

                return this.saleTranSvc.saveTenderObj(action.tndrObj).pipe(
                    map(data => {
                        //console.log("saveTenderObj success ");
                        return saveTenderObjSuccess({data});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveTenderObjFailed(errResp));
                    })                        
                )
            })
        )
    });
    savePinpadResponseEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(savePinpadResponse),
            withLatestFrom(this.store.pipe(select(getTktObjSelector))),
            exhaustMap(([action, tktObj]) => {
                if (tktObj && tktObj.VMTndr) {
                    return this.saleTranSvc.saveFDMSTenderObj(tktObj.VMTndr, tktObj.transactionID, CPOSAppType.LongTerm, tktObj.individualUID).pipe(
                        map(resp => {
                            //console.log("savePinpadResponse success ");
                            return savePinpadResponseSuccess({respObj: resp.data});
                        }),
                        catchError((errResp) => {
                            const errMessage = errResp + "Unable to save pinpad response. Please logoff and logon again";
                            return of(savePinpadResponseFailed(errResp));
                        })
                    );
                } else {
                    return of(savePinpadResponseFailed({msg: "No valid ticket object found to save pinpad response."}));
                }
            })
        );
    });

}