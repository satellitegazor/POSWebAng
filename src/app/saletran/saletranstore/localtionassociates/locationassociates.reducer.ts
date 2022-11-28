import { Action, createReducer, on } from "@ngrx/store";
import { getLocationAssocSuccess } from "./locationassociates.action";
import { initialLocationAssocState, LocationAssocState } from "./locationassociates.state";


 export const _getLocationAssocReducer = createReducer(
    initialLocationAssocState,
    on(getLocationAssocSuccess, (state, action) => { 
        return {
       ...state,
       locAssocs: action.locAssocs
       }; 
    })
);
 
export function GetLocationAssocReducer(state: LocationAssocState, action: Action) {
   return _getLocationAssocReducer(state, action);
}

