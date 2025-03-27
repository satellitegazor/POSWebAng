import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, State, Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, mergeMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { SalesTranService } from "../../services/sales-tran.service";
import { saveTicketSplit, saveTicketSplitSuccess, saveTicketSplitFailed, saveCompleteTicketSplit, saveCompleteTicketSplitSuccess, saveCompleteTicketSplitFailed } from "./ticket.action";
import { saleTranDataInterface } from "./ticket.state";
import { getTktObjSelector } from './ticket.selector';

@Injectable()
export class TicketObjectEffects {
    constructor(private action$: Actions, private saleTranSvc: SalesTranService, private store: Store<saleTranDataInterface>) {    }

    saveTicketSplitEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveTicketSplit),
            mergeMap((action) => {

                return this.saleTranSvc.saveTicketSplit(action.tktObj).pipe(
                    map(rslt => {
                        return saveTicketSplitSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to save ticket data. Please logoff and logon again";
                        return of(saveTicketSplitFailed(errResp));
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

}