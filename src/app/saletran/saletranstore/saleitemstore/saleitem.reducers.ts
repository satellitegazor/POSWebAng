import { state } from "@angular/animations";
import { Action, createReducer, on } from "@ngrx/store";
import { SaleItem, SaleItemInterface } from "src/app/saletran/models/sale.item";
import { SalesCat } from "src/app/saletran/models/sale.item";
import { Dept } from "src/app/saletran/models/sale.item";
import { getSaleItemsActionSuccess } from "./saleitem.action";
import { initialSaleItemState, SaleItemsState } from "./saleitem.state";

//import { getSaleItemsAction, getSaleItemsActionSuccess } from "../actions/saleitem.action";



 export const _getSaleItemReducer = createReducer(
     initialSaleItemState,
     on(getSaleItemsActionSuccess, (state, action) => { 
         return {
        ...state,
        saleItemRsltsMdl: action.saleItemRsltMdl
        }; 
     })
 );
 
export function GetSaleItemMenuReducer(state: SaleItemsState, action: Action) {
    return _getSaleItemReducer(state, action);
}