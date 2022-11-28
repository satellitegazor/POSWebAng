import { Injectable } from "@angular/core";
import { createEffect, Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { LogonSvc } from "../logon/logonsvc.service";
import { getLoginFail, getLoginStart, getLoginSuccess } from "./auth.action"; 
import { AuthState } from "./auth.state";
import { catchError, concatMap, exhaustMap, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from "rxjs";

@Injectable()
export class LoginAuthEffects {
    constructor(private action$: Actions, private loginSvc: LogonSvc, private store: Store<AuthState>) {}

    loadAuthLogin$ = createEffect(() => {
        return this.action$.pipe(
            ofType(getLoginStart),
            exhaustMap((action) => {
                return this.loginSvc.logonUser(action.logonMdl).pipe(
                    map(authMdl => {
                        return getLoginSuccess({authMdl});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to load LocationConfig. Please logoff and logon again";
                        return of(getLoginFail(errResp));
                    })  
                )
            })
        )
    });

}