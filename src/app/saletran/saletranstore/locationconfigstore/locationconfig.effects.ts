import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { SalesTranService } from "../../services/sales-tran.service";
import { getLocationConfigStart, getLocationConfigSuccess, getLocationConfigFail } from "./locationconfig.action";
import { LocationConfigState } from "./locationconfig.state";
 
@Injectable()
export class LocationConfigEffects {
    constructor(private action$: Actions, private locCnfgSvc: SalesTranService, private store: Store<LocationConfigState>) {    }

    loadLocationConfig$ = createEffect(() => {
        return this.action$.pipe(
            ofType(getLocationConfigStart),
            exhaustMap((action) => {
                return this.locCnfgSvc.getLocationConfig(action.locationId, action.individualUID).pipe(
                    map(locationCnfg => {
                        return getLocationConfigSuccess({locationCnfg});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to load LocationConfig. Please logoff and logon again";
                        return of(getLocationConfigFail(errResp));
                    })                        
                )
            }),


        )
    });

}