import { state } from "@angular/animations";
import { Action, createReducer, on } from "@ngrx/store";
import { getEventSaleItemsActionSuccess } from "./saleitem.action";
import { initialSaleItemState, SaleItemsState } from "./saleitem.state";

//import { getSaleItemsAction, getSaleItemsActionSuccess } from "../actions/saleitem.action";



 export const _getSaleItemReducer = createReducer(
     initialSaleItemState,
     on(getEventSaleItemsActionSuccess, (state, action) => { 
         return {
        ...state,
        saleItemRsltsMdl: action.saleItemRsltMdl
        }; 
     })
 );
 
export function GetSaleItemMenuReducer(state: SaleItemsState, action: Action) {
    return _getSaleItemReducer(state, action);
}