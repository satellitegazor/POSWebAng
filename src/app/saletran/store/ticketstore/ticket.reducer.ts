import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { GlobalConstants } from "src/app/global/global.constants";
import { SalesTransactionCheckoutItem } from "../../models/salesTransactionCheckoutItem";
import { addSaleItem, incSaleitemQty, decSaleitemQty, initTktObj } from "./ticket.action";

import { tktObjInitialState, tktObjInterface } from "./ticket.state"; 

  export const _tktObjReducer = createReducer(
    tktObjInitialState,
     on(initTktObj, (state, action) => {
         return {
            ...state,
            tktObj: {
               ...state.tktObj,
               locationUID: action.locConfig.configs[0].locationUID,
               cliTimeVar: GlobalConstants.GetClientTimeVariance(),
               individualUID: action.locConfig.configs[0].individualUID,
            }
         }
     }),
     on(addSaleItem, (state, action) => { 
         var dt = [action.saleItem];      
         return {
        ...state,
         tktObj: {...state.tktObj, 
            tktList: [...state.tktObj?.tktList, 
               ...state.tktObj.tktList.concat(dt)] }
        }; 
     }),
     on(incSaleitemQty, (state, action) => {
         var saleItemObj = state.tktObj.tktList.filter(k=> k.salesItemUID == action.saleItemId && k.ticketDetailId == action.tktDtlId)[0];
         ++saleItemObj.quantity;
         var updatedSaleitems = state.tktObj.tktList.map(item => item.salesItemUID != action.saleItemId && item.ticketDetailId != action.tktDtlId ? saleItemObj : item);

         return {
            ...state,
            tktObj: {
               ...state.tktObj,
               tktList: updatedSaleitems            
            }
         }
     }),

     on(decSaleitemQty, (state, action) => {
      var saleItemObj = state.tktObj.tktList.filter(k=> k.salesItemUID == action.saleItemId && k.ticketDetailId == action.tktDtlId)[0];
      --saleItemObj.quantity;
      var updatedSaleitems = state.tktObj.tktList.map(item => item.salesItemUID != action.saleItemId && item.ticketDetailId != action.tktDtlId ? saleItemObj : item);
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedSaleitems            
         }
      }
  }),

 );
 
 

export function TktObjReducer(state: tktObjInterface, action: Action) {
   return _tktObjReducer(state, action);
   // switch(action.type) {
   //    case 'addSaleItem':
   //       return [...state,  tktObjInitialState.tktObj : {
   //          ...state.tktObj, 
   //       }]
   //       break;
   // }
}

