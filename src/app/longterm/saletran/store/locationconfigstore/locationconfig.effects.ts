import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { PosApiService } from "../../services/pos-api-service";
import { getLocationConfigStart, getLocationConfigSuccess, getLocationConfigFail} from "./locationconfig.action";
import { LocationConfigState } from "./locationconfig.state";

@Injectable()
export class LocationConfigEffects {
    constructor(private action$: Actions, private salesTranSvc: PosApiService, private store: Store<LocationConfigState>) { }

    loadLocationConfig$ = createEffect(() => {
        return this.action$.pipe(
            ofType(getLocationConfigStart),
            exhaustMap((action) => {
                return this.salesTranSvc.getLocationConfig(action.locationId, action.individualUID).pipe(
                    map(locCnfgMdl => {
                        return getLocationConfigSuccess({ locationCnfg: locCnfgMdl.configs[0] });
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to load LocationConfig. Please logoff and logon again";
                        return of(getLocationConfigFail({errMessage: errMessage}));
                    })
                )
            }),


        )
    });



}



