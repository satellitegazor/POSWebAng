import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, concatMap, exhaustMap, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { RovApiService } from "../../short-term.service";
import { getEventConfigStart, getEventConfigSuccess, getEventConfigFail } from "./roveventconfig.action";
import { ROVEventConfigState } from "./roveventconfig.state";
import { EventConfig } from "../../models/event.config";

@Injectable()
export class EventConfigEffects {
    constructor(private action$: Actions, private rovApiSvc: RovApiService, private store: Store<ROVEventConfigState>) { }

    loadEventConfig$ = createEffect(() => {
        return this.action$.pipe(
            ofType(getEventConfigStart),
            exhaustMap((action) => {
                return this.rovApiSvc.GetEventConfig(action.eventId, action.individualUID.toString()).pipe(
                    map(eventCnfgMdl => {
                        return getEventConfigSuccess({ eventConfig: eventCnfgMdl?.config ?? new EventConfig()});
                    }),
                    catchError((errResp) => {
                        const errMessage = errResp + "Unable to load EventConfig. Please logoff and logon again";
                        return of(getEventConfigFail({ errMessage: errMessage }));
                    })
                )
            }),


        )
    });



}



