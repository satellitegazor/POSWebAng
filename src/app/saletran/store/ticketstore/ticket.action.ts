import {createAction, props} from '@ngrx/store';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
 
export const ADD_SALE_ITEM = 'addSaleItem';
export const INC_SALE_ITEM_QTY = 'incSaleItemQty';
export const DEC_SALE_ITEM_QTY = 'decSaleItemQty';

export const addSaleItem = createAction(ADD_SALE_ITEM,
    props<{saleItem: SalesTransactionCheckoutItem}>());

export const incSaleitemQty = createAction(INC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());
 
export const getLocationConfigFail = createAction(DEC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());
