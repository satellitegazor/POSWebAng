import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { SalesTranService } from "../../services/sales-tran.service";
import { getLocationAssocStart, getLocationAssocSuccess, getLocationAssocFail } from "./locationassociates.action";
import { LocationAssocState } from "./locationassociates.state";

 
@Injectable()
export class LocationAssocEffects {
    constructor(private action$: Actions, private locCnfgSvc: SalesTranService, private store: Store<LocationAssocState>) {    }

    loadLocationAssoc$ = createEffect(() => {
        return this.action$.pipe(
            ofType(getLocationAssocStart),
            exhaustMap((action) => {
                return this.locCnfgSvc.getLocationAssociates(action.locationId, action.individualUID).pipe(
                    map(locAssocs => {
                        return getLocationAssocSuccess({locAssocs});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to load LocationAssoc. Please logoff and logon again";
                        return of(getLocationAssocFail(errResp));
                    })                        
                )
            })
        )
    });

}