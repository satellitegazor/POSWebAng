import {createAction} from '@ngrx/store';
 
export const addSaleItem = createAction('addSaleItem');
export const removeSaleItem = createAction('removeSaleItem');
export const updSaleItemQty = createAction('updSaleItemQty');