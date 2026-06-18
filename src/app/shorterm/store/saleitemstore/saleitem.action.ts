import { createAction, props } from "@ngrx/store";
import { RDeptCategoryResultModels } from "../../models/models";

export const GET_EVENT_SALE_ITEMS_MENU_START = '[SaleTran] getEventItemMenu Start'
export const GET_EVENT_SALE_ITEMS_MENU_SUCCESS = '[SaleTran] getEventItemMenu success'
export const GET_EVENT_SALE_ITEMS_MENU_FAIL = '[SaleTran] getEventItemMenu fail'

export const getEventSaleItemsStart = createAction(GET_EVENT_SALE_ITEMS_MENU_START,
    props<{uid: string, eventId: number, facilityId: number}>());


export const getEventSaleItemsActionSuccess = createAction(
    GET_EVENT_SALE_ITEMS_MENU_SUCCESS,
    props<{ saleItemRsltMdl: RDeptCategoryResultModels }>()
)

export const getEventSaleitemsFail = createAction(GET_EVENT_SALE_ITEMS_MENU_FAIL);


