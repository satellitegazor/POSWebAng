import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EmptyError } from 'rxjs';
import { catchError, concatMap, exhaustMap, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { SaleItem } from '../../../models/sale.item';
import { SaleItemResultsModel } from '../../../models/sale.item.results.model';
import { SalesTranService } from '../../services/sales-tran.service';
import { 
    getSaleItemsActionSuccess, getSaleItemsStart, getSaleitemsFail
} from "./saleitem.action";
import { SaleItemsState } from './saleitem.state';
import { getSaleItemListSelector } from './saleitem.selector';


@Injectable()
export class SaleItemEffects {

    constructor(private action$: Actions, private saleItemSvc: SalesTranService, private store: Store<SaleItemsState>) { }

    loadSaleItems$ = createEffect(() => {
        return this.action$.pipe(
            ofType(getSaleItemsStart),
            exhaustMap((action) => {
                    return this.saleItemSvc.getSaleItemListFromDB(action.locationId, action.contractid)
                        .pipe(map(saleItemRsltMdl => getSaleItemsActionSuccess({saleItemRsltMdl})))
                            
                        //     (data) => {
                        //     var saleItems = data.itemButtonMenuResults;
                        //     return getSaleItemsActionSuccess({saleItems});
                        // }

                }
            )
        )
    });
}
