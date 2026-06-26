import {createAction, props} from '@ngrx/store';
//import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { RovLogonDataService } from '../../rov-logon-data.service';
//import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { AssociateSaleTips } from "../../../models/associate.sale.tips";
import { LTC_Customer } from "../../../models/customer";
import { RSaveTicketResultsModel, ROV_POSTicketSplit, ROV_Ticket } from "../../models/rticket.split";
import { SaveTenderResultModel, SaveTenderResult, TicketTender } from '../../../models/ticket.tender';
import { EventConfig } from '../../models/event.config'
//import { LTC_Associates } from '../../../models/location.associates';
import { Rov_SalesTranCheckoutItem } from "../../models/r-salestran-checkout-item"
import { ExchCardTndr, SaveExchCardTndrResult } from '../../..//models/exch.card.tndr';
import { DailyExchRate } from '../../../models/exchange.rate';
import { InactiveTicketDetailRequest, InactiveTicketDetailResultModel, SaveTicketDetailRequest, SaveTicketDetailResultModel } from '../../../longterm/models/misc.models';
import { RovSaveTicketDetailRequest } from '../../models/models';
 
export const ADD_ROV_SALE_ITEM = 'addRovSaleItem';
export const INC_ROV_SALE_ITEM_QTY = 'incRovSaleItemQty';
export const DEC_ROV_SALE_ITEM_QTY = 'decRovSaleItemQty';
export const ROV_INIT_TKT_OBJ = 'rovInitTktObj';
export const ADD_TAB_SERIAL_TO_ROV_TKT_OBJ = 'addTabSerialToRovTktObj';
export const RESET_ROV_TKT_OBJ = 'resetRovTktObj';
export const SAVE_ROV_TICKET_SPLIT = '[SaveRovTicket] Start'
export const SAVE_ROV_TICKET_SPLIT_SUCCESS = '[SaveRovTicket] Success'
export const SAVE_ROV_TICKET_SPLIT_FAILED = '[SaveRovTicket] Failure'

export const SAVE_COMPLETE_ROV_TICKET_SPLIT = '[SaveCompleteRovTicket] Start'
export const SAVE_COMPLETE_ROV_TICKET_SPLIT_SUCCESS = '[SaveCompleteRovTicket] Success'
export const SAVE_COMPLETE_ROV_TICKET_SPLIT_FAILED = '[SaveCompleteRovTicket] Failure'

export const ADD_ROV_CUST_ID = 'add CustomerId to RovTktObj';
export const ADD_NEW_ROV_CUST = 'add New Customer to RovTktObj';
export const ADD_TENDER_OBJ = 'addTenderToRovTktObj';
export const ADD_PINPAD_RESP = 'addPinpadResponse';
export const APP_REFUND_REASON = 'addRefundReason';
export const UPD_SALE_ITEM = 'updRovSaleItems';
export const UPD_CHK_OUT_TOTALS = 'updRovCheckoutTotals';
export const UPD_SRVD_BY_ASSOC = 'updateRovServedByAssociate';
export const UPSERT_ASSOC_TIPS = 'upsertRovAssocTips';
export const DELETE_SALE_ITEM = 'delRovSaleitemZeroQty';
export const UPDATE_TAX_EXEMPT = 'updateRovTaxExempt';
export const UPDATE_ASSOC_IN_ASSOCTIPS = 'updateRovAssocInAssocTips';

export const SAVE_TENDER_OBJ = 'saveRovTenderObj';
export const SAVE_TENDER_OBJ_SUCCESS = 'saveRovTenderObjSuccess';
export const SAVE_TENDER_OBJ_FAILED = 'saveRovTenderObjFailed';

export const SAVE_TICKET_DETAIL = 'saveRovTicketDetail';
export const SAVE_TICKET_DETAIL_SUCCESS = 'saveRovTicketDetailSuccess';
export const SAVE_TICKET_DETAIL_FAILED = 'saveRovTicketDetailFailed';

export const INACTIVE_TICKET_DETAIL = 'inactiveRovTicketDetail';
export const INACTIVE_TICKET_DETAIL_SUCCESS = 'inactiveRovTicketDetailSuccess';
export const INACTIVE_TICKET_DETAIL_FAILED = 'inactiveRovTicketDetailFailed';

export const DELETE_DECLINED_ROV_TNDR = 'deleteRovDeclinedTender';

export const SAVE_PINPAD_RESP = 'saveRovPinpadResponse';
export const SAVE_PINPAD_RESP_SUCCESS = 'saveRovPinpadResponseSuccess';
export const SAVE_PINPAD_RESP_FAILED = 'saveRovPinpadResponseFailed';


export const UPSERT_SALE_ITEM_EXCH_CPN = 'upsertRovSaleItemExchCpn';
export const UPSERT_SALE_ITEM_VND_CPN = 'upsertRovSaleItemVndCpn';
export const UPSERT_TRAN_EXCH_CPN = 'upsertRovTranExchCpn';

export const UPDATE_PARTPAY_DATA = 'updateRovPartpayData';

export const UPDATE_LOCATION_CONFIG = 'updateRovEventConfig';
export const REMOVE_TNDR_SAVE_CODE = "removeRovTenderWithSaveCode";
export const UPDATE_TENDER_RRN = 'updateRovTenderRRN';
export const IS_SPLIT_PAY_R5 = 'isRovSplitPayR5';

export const LOAD_TICKET = '[RovEventConfig] Load Ticket'
export const LOAD_TICKET_SUCCESS = '[RovEventConfig] Load Ticket Success'
export const LOAD_TICKET_FAIL = '[RovEventConfig] Load Ticket Fail'

export const LOAD_INPROGRESS_TENDERS = '[RovEventConfig] Load InProgress Tenders'
export const LOAD_INPROGRESS_TENDERS_SUCCESS = '[RovEventConfig] Load InProgress Tenders Success'
export const LOAD_INPROGRESS_TENDERS_FAIL = '[RovEventConfig] Load InProgress Tenders Fail'

export const addRovSaleItem = createAction(ADD_ROV_SALE_ITEM,
    props<{saleItem: Rov_SalesTranCheckoutItem, defCurrSymbl: string, dailyExchRateObj: DailyExchRate}>());

export const incRovSaleitemQty = createAction(INC_ROV_SALE_ITEM_QTY,
    props<{ deptUID: number, tktDtlId: number, defCurrSymbl: string, dailyExchRateObj: DailyExchRate }>());
 
export const decRovSaleitemQty = createAction(DEC_ROV_SALE_ITEM_QTY,
    props<{ deptUID: number, tktDtlId: number, defCurrSymbl: string, dailyExchRateObj: DailyExchRate }>());

export const delRovSaleitemZeroQty = createAction(DELETE_SALE_ITEM,
    props<{ deptUID: number, tktDtlId: number, defCurrSymbl: string, dailyExchRateObj: DailyExchRate }>());    

export const rovInitTktObj = createAction(ROV_INIT_TKT_OBJ, 
    props<{eventConfig: EventConfig, individualUID: number}>());

export const addTabSerialToRovTktObj = createAction(ADD_TAB_SERIAL_TO_ROV_TKT_OBJ,
    props<{ tabSerialNum: string, ipAddress: string }>());

export const resetRovTktObj = createAction(RESET_ROV_TKT_OBJ, 
    props<{ eventConfig: EventConfig }>());

export const saveRovTicketForGuestCheck = createAction(SAVE_ROV_TICKET_SPLIT,
    props<{tktObj: ROV_POSTicketSplit}>());

export const saveRovTicketForGuestCheckSuccess = createAction(SAVE_ROV_TICKET_SPLIT_SUCCESS,
    props<{rslt: RSaveTicketResultsModel}>());

export const saveRovTicketForGuestCheckFailed = createAction(SAVE_ROV_TICKET_SPLIT_FAILED,
        props<{rslt: RSaveTicketResultsModel}>());

export const saveCompleteRovTicketSplit = createAction(SAVE_COMPLETE_ROV_TICKET_SPLIT,
    props<{tktObj: ROV_POSTicketSplit}>());

export const saveCompleteRovTicketSplitSuccess = createAction(SAVE_COMPLETE_ROV_TICKET_SPLIT_SUCCESS,
    props<{rslt: RSaveTicketResultsModel}>());

export const saveCompleteRovTicketSplitFailed = createAction(SAVE_COMPLETE_ROV_TICKET_SPLIT_FAILED,
        props<{rslt: RSaveTicketResultsModel}>());
        
export const saveRovTenderObj = createAction(SAVE_TENDER_OBJ,
    props<{tndrObj: TicketTender}>());
export const saveRovTenderObjSuccess = createAction(SAVE_TENDER_OBJ_SUCCESS,
    props<{data: SaveTenderResultModel, tndrObj?: TicketTender}>());
export const saveRovTenderObjFailed = createAction(SAVE_TENDER_OBJ_FAILED,
    props<{data: SaveTenderResultModel}>());

export const saveRovTicketDetail = createAction(SAVE_TICKET_DETAIL,
    props<{uid: number, appType: number, request: SaveTicketDetailRequest}>());
export const saveRovTicketDetailSuccess = createAction(SAVE_TICKET_DETAIL_SUCCESS,
    props<{data: SaveTicketDetailResultModel, request: SaveTicketDetailRequest}>());
export const saveRovTicketDetailFailed = createAction(SAVE_TICKET_DETAIL_FAILED,
    props<{error: any}>());

export const inactiveRovTicketDetail = createAction(INACTIVE_TICKET_DETAIL,
    props<{uid: number, request: InactiveTicketDetailRequest}>());
export const inactiveRovTicketDetailSuccess = createAction(INACTIVE_TICKET_DETAIL_SUCCESS,
    props<{data: InactiveTicketDetailResultModel, request: InactiveTicketDetailRequest}>());
export const inactiveRovTicketDetailFailed = createAction(INACTIVE_TICKET_DETAIL_FAILED,
    props<{error: any}>());

export const deleteDeclinedRovTenderFromStore = createAction(DELETE_DECLINED_ROV_TNDR, props<{rrn: string}>());

export const saveRovPinpadResponse = createAction(SAVE_PINPAD_RESP,
    props<{respObj: ExchCardTndr}>());
export const saveRovPinpadResponseSuccess = createAction(SAVE_PINPAD_RESP_SUCCESS,
    props<{respObj: SaveExchCardTndrResult}>());
export const saveRovPinpadResponseFailed = createAction(SAVE_PINPAD_RESP_FAILED,
    props<{msg: string}>());

export const addRovCustomerId = createAction(ADD_ROV_CUST_ID, 
    props<{custId: number}>());

export const addNewRovCustomer = createAction(ADD_NEW_ROV_CUST, 
    props<{custObj: LTC_Customer}>());

export const addRovTender = createAction(ADD_TENDER_OBJ,
    props<{tndrObj: TicketTender}>());

export const addRovPinpadResp = createAction(ADD_PINPAD_RESP,
    props<{respObj: ExchCardTndr}>());

export const updateRovTenderRRN = createAction(UPDATE_TENDER_RRN,
    props<{oldRRN: string, newRRN: string}>());

export const updateRovSaleitems = createAction(UPD_SALE_ITEM,
    props<{item: Rov_SalesTranCheckoutItem}>());

export const removeRovTndrWithSaveCode = createAction(REMOVE_TNDR_SAVE_CODE,
    props<{tndrCode: string}>());

export const markRovTendersComplete = createAction('SAVE_COMPLETE_TENDER',
    props<{status: number}>());

export const markRovTicketComplete = createAction('SAVE_COMPLETE_TICKET',
    props<{status: number}>());

export const updateRovCheckoutTotals = createAction(UPD_CHK_OUT_TOTALS, props<{logonDataSvc: RovLogonDataService}>());


export const updateRovTaxExempt = createAction(UPDATE_TAX_EXEMPT, props<{taxExempt: boolean}>());

export const upsertRovSaleItemExchCpn = createAction(UPSERT_SALE_ITEM_EXCH_CPN, props<{logonDataSvc: RovLogonDataService, saleItemId: number, tktDtlId: number, cpnPct: number, cpnAmt: number}>());
export const upsertRovSaleItemVndCpn = createAction(UPSERT_SALE_ITEM_VND_CPN, props<{logonDataSvc: RovLogonDataService, saleItemId: number, tktDtlId: number, cpnPct: number, cpnAmt: number}>());
export const upsertRovTranExchCpn = createAction(UPSERT_TRAN_EXCH_CPN, props<{logonDataSvc: RovLogonDataService, cpnPct: number, cpnAmt: number}>());

export const updateRovPartPayData = createAction(UPDATE_PARTPAY_DATA, props<{partPayFlag: boolean, partPayAmountDC: number, partPayAmountNDC: number}>());

export const isSplitPayRovR5 = createAction(IS_SPLIT_PAY_R5, props<{isSplitPayR5: boolean}>());

export const loadRovTicket = createAction(LOAD_TICKET,
    props<{ tranId: number, eventId: number, indivId: number }>());

export const loadRovTicketSuccess = createAction(LOAD_TICKET_SUCCESS,
    props<{ tktObj: ROV_Ticket }>());

export const loadRovTicketFail = createAction(LOAD_TICKET_FAIL,
    props<{ errMessage: String }>());

export const loadRovInProgressTenders = createAction(LOAD_INPROGRESS_TENDERS,
    props<{ tranId: number, appType: number, tenderStatus: number, uid: number }>());

export const loadRovInProgressTendersSuccess = createAction(LOAD_INPROGRESS_TENDERS_SUCCESS,
    props<{ tenders: TicketTender[] }>());

export const loadRovInProgressTendersFail = createAction(LOAD_INPROGRESS_TENDERS_FAIL,
    props<{ errMessage: String }>());

export const updateRovShipHandling = createAction('updateShipHandling', props<{dfltCurrSymbl: string,shipHandlingAmountDC: number, shipHandlingTaxDC: number, shipHandlingAmountNDC: number, shipHandlingTaxNDC: number}>());

export const addRovRefundReason = createAction(APP_REFUND_REASON, props<{ refundCode: string, refundReason: string}>());

//export const updateEventConfig = createAction(UPDATE_LOCATION_CONFIG, props<{}>)