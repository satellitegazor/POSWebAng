import {createAction, props} from '@ngrx/store';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { LTC_Customer } from 'src/app/models/customer';
import { SaveTicketResultsModel, TicketSplit } from 'src/app/models/ticket.split';
import { TicketTender } from 'src/app/models/ticket.tender';
import { LocationConfig } from '../../models/location-config';
import { LTC_Associates } from '../../models/location.associates';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
 
export const ADD_SALE_ITEM = 'addSaleItem';
export const INC_SALE_ITEM_QTY = 'incSaleItemQty';
export const DEC_SALE_ITEM_QTY = 'decSaleItemQty';
export const INIT_TKT_OBJ = 'initTktObj';
export const SAVE_TICKET_SPLIT = '[SaveTicket] Start'
export const SAVE_TICKET_SPLIT_SUCCESS = '[SaveTicket] Success'
export const SAVE_TICKET_SPLIT_FAILED = '[SaveTicket] Failure'
export const ADD_CUST_ID = 'add CustomerId to TktObj';
export const ADD_NEW_CUST = 'add New Customer to TktObj';
export const ADD_TENDER_OBJ = 'addTenderToTktObj';
export const UPD_SALE_ITEM = 'updSaleItems';
export const UPD_CHK_OUT_TOTALS = 'updCheckoutTotals';
export const ADD_SRVD_BY_ASSOC = 'addServedByAssociate';
export const UPSERT_ASSOC_TIPS = 'upsertAssocTips';

export const addSaleItem = createAction(ADD_SALE_ITEM,
    props<{saleItem: SalesTransactionCheckoutItem}>());

export const incSaleitemQty = createAction(INC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());
 
export const decSaleitemQty = createAction(DEC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());

export const initTktObj = createAction(INIT_TKT_OBJ, 
    props<{locConfig: LocationConfig, individualUID: number}>());

export const saveTicketSplit = createAction(SAVE_TICKET_SPLIT,
    props<{tktObj: TicketSplit}>());

export const saveTicketSplitSuccess = createAction(SAVE_TICKET_SPLIT_SUCCESS,
    props<{rslt: SaveTicketResultsModel}>());

export const saveTicketSplitFailed = createAction(SAVE_TICKET_SPLIT_FAILED,
        props<{rslt: SaveTicketResultsModel}>());

export const addCustomerId = createAction(ADD_CUST_ID, 
    props<{custId: number}>())

export const addNewCustomer = createAction(ADD_CUST_ID, 
    props<{custObj: LTC_Customer}>());

export const addTender = createAction(ADD_TENDER_OBJ,
    props<{tndrObj: TicketTender}>());

export const updateSaleitems = createAction(UPD_SALE_ITEM,
    props<{item: SalesTransactionCheckoutItem}>())

export const updateCheckoutTotals = createAction(UPD_CHK_OUT_TOTALS);

export const addServedByAssociate = createAction(ADD_SRVD_BY_ASSOC, props<{saleItemId:number, indx:number, srvdById: number}>());

export const upsertAssocTips = createAction(UPSERT_ASSOC_TIPS, props<{assocTipsList: AssociateSaleTips[]}>());


