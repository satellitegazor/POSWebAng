import {createAction, props} from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { LTC_Customer } from 'src/app/models/customer';
import { SaveTicketResultsModel, TicketSplit } from 'src/app/models/ticket.split';
import { SaveTenderResultModel, SaveTenderResult, TicketTender } from 'src/app/models/ticket.tender';
import { LocationConfig } from '../../../models/location-config';
import { LTC_Associates } from '../../../models/location.associates';
import { SalesTransactionCheckoutItem } from '../../../models/salesTransactionCheckoutItem';
import { ExchCardTndr, SaveExchCardTndrResult } from 'src/app/models/exch.card.tndr';
 
export const ADD_SALE_ITEM = 'addSaleItem';
export const INC_SALE_ITEM_QTY = 'incSaleItemQty';
export const DEC_SALE_ITEM_QTY = 'decSaleItemQty';
export const INIT_TKT_OBJ = 'initTktObj';
export const ADD_TAB_SERIAL_TO_TKT_OBJ = 'addTabSerialToTktObj';
export const RESET_TKT_OBJ = 'resetTktObj';
export const SAVE_TICKET_SPLIT = '[SaveTicket] Start'
export const SAVE_TICKET_SPLIT_SUCCESS = '[SaveTicket] Success'
export const SAVE_TICKET_SPLIT_FAILED = '[SaveTicket] Failure'

export const SAVE_COMPLETE_TICKET_SPLIT = '[SaveCompleteTicket] Start'
export const SAVE_COMPLETE_TICKET_SPLIT_SUCCESS = '[SaveCompleteTicket] Success'
export const SAVE_COMPLETE_TICKET_SPLIT_FAILED = '[SaveCompleteTicket] Failure'

export const ADD_CUST_ID = 'add CustomerId to TktObj';
export const ADD_NEW_CUST = 'add New Customer to TktObj';
export const ADD_TENDER_OBJ = 'addTenderToTktObj';
export const ADD_PINPAD_RESP = 'addPinpadResponse';
export const UPD_SALE_ITEM = 'updSaleItems';
export const UPD_CHK_OUT_TOTALS = 'updCheckoutTotals';
export const UPD_SRVD_BY_ASSOC = 'updateServedByAssociate';
export const UPSERT_ASSOC_TIPS = 'upsertAssocTips';
export const DELETE_SALE_ITEM = 'delSaleitemZeroQty';
export const UPDATE_TAX_EXEMPT = 'updateTaxExempt';
export const UPDATE_ASSOC_IN_ASSOCTIPS = 'updateAssocInAssocTips';

export const SAVE_TENDER_OBJ = 'saveTenderObj';
export const SAVE_TENDER_OBJ_SUCCESS = 'saveTenderObjSuccess';
export const SAVE_TENDER_OBJ_FAILED = 'saveTenderObjFailed';

export const SAVE_PINPAD_RESP = 'savePinpadResponse';
export const SAVE_PINPAD_RESP_SUCCESS = 'savePinpadResponseSuccess';
export const SAVE_PINPAD_RESP_FAILED = 'savePinpadResponseFailed';


export const UPSERT_SALE_ITEM_EXCH_CPN = 'upsertSaleItemExchCpn';
export const UPSERT_SALE_ITEM_VND_CPN = 'upsertSaleItemVndCpn';
export const UPSERT_TRAN_EXCH_CPN = 'upsertTranExchCpn';

export const UPDATE_PARTPAY_DATA = 'updatePartpayData';

export const UPDATE_LOCATION_CONFIG = 'updateLocationConfig';
export const REMOVE_TNDR_SAVE_CODE = "removeTenderWithSaveCode";
export const UPDATE_TENDER_RRN = 'updateTenderRRN';
export const IS_SPLIT_PAY_R5 = 'isSplitPayR5';

export const addSaleItem = createAction(ADD_SALE_ITEM,
    props<{saleItem: SalesTransactionCheckoutItem}>());

export const incSaleitemQty = createAction(INC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());
 
export const decSaleitemQty = createAction(DEC_SALE_ITEM_QTY,
    props<{saleItemId: number, tktDtlId: number}>());

export const delSaleitemZeroQty = createAction(DELETE_SALE_ITEM,
        props<{saleItemId: number, tktDtlId: number}>());    

export const initTktObj = createAction(INIT_TKT_OBJ, 
    props<{locConfig: LocationConfig, individualUID: number}>());

export const addTabSerialToTktObj = createAction(ADD_TAB_SERIAL_TO_TKT_OBJ,
    props<{ tabSerialNum: string, ipAddress: string }>());

export const resetTktObj = createAction(RESET_TKT_OBJ, 
    props<{dummyNumber: number}>());

export const saveTicketForGuestCheck = createAction(SAVE_TICKET_SPLIT,
    props<{tktObj: TicketSplit}>());

export const saveTicketForGuestCheckSuccess = createAction(SAVE_TICKET_SPLIT_SUCCESS,
    props<{rslt: SaveTicketResultsModel}>());

export const saveTicketForGuestCheckFailed = createAction(SAVE_TICKET_SPLIT_FAILED,
        props<{rslt: SaveTicketResultsModel}>());

export const saveCompleteTicketSplit = createAction(SAVE_COMPLETE_TICKET_SPLIT,
    props<{tktObj: TicketSplit}>());

export const saveCompleteTicketSplitSuccess = createAction(SAVE_COMPLETE_TICKET_SPLIT_SUCCESS,
    props<{rslt: SaveTicketResultsModel}>());

export const saveCompleteTicketSplitFailed = createAction(SAVE_COMPLETE_TICKET_SPLIT_FAILED,
        props<{rslt: SaveTicketResultsModel}>());
        
export const saveTenderObj = createAction(SAVE_TENDER_OBJ,
    props<{tndrObj: TicketTender}>());
export const saveTenderObjSuccess = createAction(SAVE_TENDER_OBJ_SUCCESS,
    props<{data: SaveTenderResultModel}>());
export const saveTenderObjFailed = createAction(SAVE_TENDER_OBJ_FAILED,
    props<{data: SaveTenderResultModel}>());

export const savePinpadResponse = createAction(SAVE_PINPAD_RESP,
    props<{respObj: ExchCardTndr}>());
export const savePinpadResponseSuccess = createAction(SAVE_PINPAD_RESP,
    props<{respObj: SaveExchCardTndrResult}>());
export const savePinpadResponseFailed = createAction(SAVE_PINPAD_RESP,
    props<{msg: string}>());

export const addCustomerId = createAction(ADD_CUST_ID, 
    props<{custId: number}>())

export const addNewCustomer = createAction(ADD_CUST_ID, 
    props<{custObj: LTC_Customer}>());

export const addTender = createAction(ADD_TENDER_OBJ,
    props<{tndrObj: TicketTender}>());

export const addPinpadResp = createAction(ADD_PINPAD_RESP,
    props<{respObj: ExchCardTndr}>());

export const updateTenderRRN = createAction(UPDATE_TENDER_RRN,
    props<{oldRRN: string, newRRN: string}>());

export const updateSaleitems = createAction(UPD_SALE_ITEM,
    props<{item: SalesTransactionCheckoutItem}>());

export const removeTndrWithSaveCode = createAction(REMOVE_TNDR_SAVE_CODE,
    props<{tndrCode: string}>());

export const markTendersComplete = createAction('SAVE_COMPLETE_TENDER',
    props<{status: number}>());

export const markTicketComplete = createAction('SAVE_COMPLETE_TICKET',
    props<{status: number}>());

export const updateCheckoutTotals = createAction(UPD_CHK_OUT_TOTALS, props<{logonDataSvc: LogonDataService}>());

export const updateServedByAssociate = createAction(UPD_SRVD_BY_ASSOC, props<{saleItemId:number, indx:number, indLocId: number, srvdByAssociateName: string}>());

export const updateAssocInAssocTips = createAction(UPDATE_ASSOC_IN_ASSOCTIPS, props<{saleItemId: number, indLocId: number}>());

export const upsertAssocTips = createAction(UPSERT_ASSOC_TIPS, props<{assocTipsList: AssociateSaleTips[], totalTipAmtDC: number, totalTipAmtNDC: number}>());

export const updateTaxExempt = createAction(UPDATE_TAX_EXEMPT, props<{taxExempt: boolean}>());

export const upsertSaleItemExchCpn = createAction(UPSERT_SALE_ITEM_EXCH_CPN, props<{logonDataSvc: LogonDataService, saleItemId: number, tktDtlId: number, cpnPct: number, cpnAmt: number}>());
export const upsertSaleItemVndCpn = createAction(UPSERT_SALE_ITEM_VND_CPN, props<{logonDataSvc: LogonDataService, saleItemId: number, tktDtlId: number, cpnPct: number, cpnAmt: number}>());
export const upsertTranExchCpn = createAction(UPSERT_TRAN_EXCH_CPN, props<{logonDataSvc: LogonDataService, cpnPct: number, cpnAmt: number}>());

export const updatePartPayData = createAction(UPDATE_PARTPAY_DATA, props<{partPayFlag: boolean, partPayAmountDC: number, partPayAmountNDC: number}>());

export const isSplitPayR5 = createAction(IS_SPLIT_PAY_R5, props<{isSplitPayR5: boolean}>());

//export const updateLocationConfig = createAction(UPDATE_LOCATION_CONFIG, props<{}>)