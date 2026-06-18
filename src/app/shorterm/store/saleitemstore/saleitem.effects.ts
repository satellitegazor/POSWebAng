import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EmptyError } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';

import { RovApiService } from "../../short-term.service";
import { 
    getEventSaleItemsActionSuccess, getEventSaleItemsStart, getEventSaleitemsFail
} from "./saleitem.action";
import { SaleItemsState } from './saleitem.state';
import { getSaleItemListSelector } from './saleitem.selector';


@Injectable()
export class SaleItemEffects {

    constructor(private action$: Actions, private rovApiSvc: RovApiService, private store: Store<SaleItemsState>) { }

    loadSaleItems$ = createEffect(() => {
        return this.action$.pipe(
            ofType(getEventSaleItemsStart),
            exhaustMap((action) => {
                    return this.rovApiSvc.getConcessionMenuItem(action.uid, action.eventId, action.facilityId, true)
                        .pipe(map(saleItemRsltMdl => getEventSaleItemsActionSuccess({saleItemRsltMdl})))
                            
                        //     (data) => {
                        //     var saleItems = data.itemButtonMenuResults;
                        //     return getSaleItemsActionSuccess({saleItems});
                        // }

                }
            )
        )
    });
}
