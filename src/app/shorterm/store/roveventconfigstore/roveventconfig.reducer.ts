import { Action, createReducer, on } from "@ngrx/store";
import { getEventConfigSuccess, setEventConfig, updateEventConfigPostLogon } from ".roveventconfig.action";
import { initialROVEventConfigState, ROVEventConfigState } from "./roveventconfig.state";

const mergeNonNull = <T extends Record<string, any>>(existingObj: T, incomingObj: Partial<T>): T => {
    const mergedObj = { ...existingObj } as T;

    Object.keys(incomingObj || {}).forEach((key) => {
        const incomingValue = (incomingObj as any)[key];
        if (incomingValue !== null && incomingValue !== undefined) {
            (mergedObj as any)[key] = incomingValue;
        }
    });

    return mergedObj;
};

export const _getEventConfigReducer = createReducer(
    initialROVEventConfigState,
    on(getEventConfigSuccess, (state, action) => {
        const primaryConfig = action.eventCnfg 
            ? action.eventCnfg
            : null;

        return {
            ...state,
            eventCnfg: primaryConfig
        };
    }),
    on(setEventConfig, (state, action) => {
        if (!action.eventConfig) {
            return state;
        }

        return {
            ...state,
            eventCnfg: state.eventCnfg
                ? mergeNonNull(state.eventCnfg as any, action.eventConfig as any)
                : action.eventConfig
        };
    }),
    on(updateEventConfigPostLogon, (state, action) => {
        if (!state.eventCnfg) {
            return state;
        }

        return {
            ...state,
            eventCnfg: {
                ...state.eventCnfg,
                associateName: action.associateName,
                associateRole: action.associateRole,
                associateRoleDesc: action.associateRoleDesc,
                contractNumber: action.contractNumber,
                contractUID: action.contractUID,
                facilityName: action.facilityName,
                eventName: action.eventName,
                facilityNumber: action.facilityNumber,
                vendorNumber: action.vendorNumber,
                vendorName: action.vendorName
            }
        };
    })
);

export function GetEventConfigReducer(state: ROVEventConfigState, action: Action) {
    return _getEventConfigReducer(state, action);
}
