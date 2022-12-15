import { createAction, props } from "@ngrx/store";
import { SaleItem } from "src/app/saletran/models/sale.item";
import { SalesCat } from "src/app/saletran/models/sale.item";
import { Dept } from "src/app/saletran/models/sale.item";
import { SaleItemResultsModel } from "../../models/sale.item.results.model";

export const GET_SALE_ITEMS_MENU_START = '[SaleTran] getItemMenu Start'
export const GET_SALE_ITEMS_MENU_SUCCESS = '[SaleTran] getItemMenu success'
export const GET_SALE_ITEMS_MENU_FAIL = '[SaleTran] getItemMenu fail'

export const getSaleItemsStart = createAction(GET_SALE_ITEMS_MENU_START,
    props<{locationId: number, contractid: number}>());


export const getSaleItemsActionSuccess = createAction(
    GET_SALE_ITEMS_MENU_SUCCESS,
    props<{saleItemRsltMdl: SaleItemResultsModel}>()
)

export const getSaleitemsFail = createAction(GET_SALE_ITEMS_MENU_FAIL);


