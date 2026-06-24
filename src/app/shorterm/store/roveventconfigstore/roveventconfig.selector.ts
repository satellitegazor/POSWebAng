import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ROVEventConfigState } from "./roveventconfig.state";

export const ROV_EVENT_CONFIG_STATE = 'RovEventConfigState'
const getEventConfigState = createFeatureSelector<ROVEventConfigState>(ROV_EVENT_CONFIG_STATE)

export const getEventConfigSelector = createSelector(getEventConfigState,
    (state) => {
        return state ? state.eventConfig : null;
    });


export const getEventConfigHeaderContextSelector = createSelector(getEventConfigState,
    (state) => {
        const config = state && state.eventConfig
            ? state.eventConfig
            : null;

        return {
            associateName: config ? config.associateName : '',
            associateRole: config ? config.associateRole : '',
            associateRoleDesc: config ? config.associateRoleDesc : '',
            contractNumber: config ? config.contractNumber : '',
            contractUID: config ? config.contractUID : 0,
            facilityName: config ? config.facilityName : '',
            eventName: config ? config.eventName : '',
            facilityNumber: config ? config.facilityNumber : '',
            vendorNumber: config ? config.vendorNumber : '',
            vendorName: config ? config.vendorName : ''

        };
    });