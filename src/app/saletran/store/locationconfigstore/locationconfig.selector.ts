import { createFeatureSelector, createSelector } from "@ngrx/store";
import { LocationConfigState } from "./locationconfig.state";

export const LOC_CONFIG_STATE = 'LocatonConfigState'
const getLocConfigState = createFeatureSelector<LocationConfigState>(LOC_CONFIG_STATE)

export const getLocationConfigSelector = createSelector(getLocConfigState, 
    (state) => {
    return state ? state.locationCnfg : null;
});

export const getLocCnfgIsAllowTipsSelector = createSelector(getLocConfigState,
    (state) => {
        if(state.locationCnfg == null)
            return;

        return state && state.locationCnfg && state.locationCnfg.configs && state.locationCnfg.configs.length > 0 ? state.locationCnfg.configs[0].allowTips : false;
    })