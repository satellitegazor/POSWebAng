import { createFeatureSelector, createSelector } from "@ngrx/store";
import { LocationConfigState } from "./locationconfig.state";

export const LOC_CONFIG_STATE = 'sharedLocatonConfigState'
const getLocConfigState = createFeatureSelector<LocationConfigState>(LOC_CONFIG_STATE)

export const getLocationConfigSelector = createSelector(getLocConfigState, 
    (state) => {
    return state ? state.locationCnfg : null;
});