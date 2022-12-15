import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { SalesTransactionCheckoutItem } from "../../models/salesTransactionCheckoutItem";
import { addSaleItem } from "./ticket.action";

import { tktObjInitialState, tktObjInterface } from "./ticket.state"; 

  export const _tktObjReducer = createReducer(
    tktObjInitialState,
     on(addSaleItem, (state, action) => { 
         var dt = [action.saleItem];      
         return {
        ...state,
         tktObj: {...state.tktObj, 
            tktList: [...state.tktObj?.tktList, 
               ...state.tktObj.tktList.concat(dt)] }
        }; 
     })
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

