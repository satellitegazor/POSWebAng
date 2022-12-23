import {createAction, props} from '@ngrx/store';
import { SaveTicketResultsModel, TicketSplit } from 'src/app/models/ticket.split';
import { LocationConfigModel } from '../../models/location-config';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
 
export const ADD_SALE_ITEM = 'addSaleItem';
export const INC_SALE_ITEM_QTY = 'incSaleItemQty';
export const DEC_SALE_ITEM_QTY = 'decSaleItemQty';
export const INIT_TKT_OBJ = 'initTktObj';
export const SAVE_TICKET_SPLIT = '[SaveTicket] Start'
export const SAVE_TICKET_SPLIT_SUCCESS = '[SaveTicket] Success'
export const SAVE_TICKET_SPLIT_FAILED = '[SaveTicket] Failure'

export const addSaleItem = createAction(ADD_SALE_ITEM,
    props<{saleItem: SalesTransactionCheckoutItem}>());

export const incSaleitemQty = createAction(INC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());
 
export const decSaleitemQty = createAction(DEC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());

export const initTktObj = createAction(INIT_TKT_OBJ, 
    props<{locConfig: LocationConfigModel}>());

export const saveTicketSplit = createAction(SAVE_TICKET_SPLIT,
    props<{tktObj: TicketSplit}>());

export const saveTicketSplitSuccess = createAction(SAVE_TICKET_SPLIT_SUCCESS,
    props<{rslt: SaveTicketResultsModel}>());

export const saveTicketSplitFailed = createAction(SAVE_TICKET_SPLIT_FAILED,
        props<{rslt: SaveTicketResultsModel}>());
        