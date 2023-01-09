import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { SalesTranService } from "../../services/sales-tran.service";
import { saveTicketSplit, saveTicketSplitSuccess, saveTicketSplitFailed } from "./ticket.action";
import { tktObjInterface } from "./ticket.state";

@Injectable()
export class TicketObjectEffects {
    constructor(private action$: Actions, private saleTranSvc: SalesTranService, private store: Store<tktObjInterface>) {    }

    saveTicketSplitEffect$ = createEffect(() => {
        return this.action$.pipe(
            ofType(saveTicketSplit),
            mergeMap((action) => {
                return this.saleTranSvc.saveTicketSplit(action.tktObj).pipe(
                    map(rslt => {
                        return saveTicketSplitSuccess({rslt});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to load LocationConfig. Please logoff and logon again";
                        return of(saveTicketSplitFailed(errResp));
                    })                        
                )
            })
        )
    });

}