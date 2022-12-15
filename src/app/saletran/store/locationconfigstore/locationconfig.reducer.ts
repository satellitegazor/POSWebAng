import { Action, createReducer, on } from "@ngrx/store";
import { getLocationConfigSuccess } from "./locationconfig.action";
import { initialLocationConfigState, LocationConfigState } from "./locationconfig.state";


 export const _getLocationConfigReducer = createReducer(
    initialLocationConfigState,
    on(getLocationConfigSuccess, (state, action) => { 
        return {
       ...state,
       locationCnfg: action.locationCnfg
       }; 
    })
);
 
export function GetLocationConfigReducer(state: LocationConfigState, action: Action) {
   return _getLocationConfigReducer(state, action);
}

