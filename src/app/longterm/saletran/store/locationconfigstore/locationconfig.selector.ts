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

        return state && state.locationCnfg && state.locationCnfg != null && state.locationCnfg.allowTips != null ? state.locationCnfg.allowTips : false;
    })

export const getLocCnfgHeaderContextSelector = createSelector(getLocConfigState,
    (state) => {
        const config = state && state.locationCnfg 
            ? state.locationCnfg
            : null;

        return {
            associateName: config ? config.associateName : '',
            associateRole: config ? config.associateRole : '',
            associateRoleDesc: config ? config.associateRoleDesc : '',
            contractNumber: config ? config.contractNumber : '',
            contractUID: config ? config.contractUID : 0,
            facilityName: config ? config.facilityName : '',
            locationName: config ? config.locationName : '',
            facilityNumber: config ? config.facilityNumber : '',
            vendorNumber: config ? config.vendorNumber : '',
            vendorName: config ? config.vendorName : ''

        };
    });