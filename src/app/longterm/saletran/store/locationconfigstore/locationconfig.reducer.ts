import { Action, createReducer, on } from "@ngrx/store";
import { getLocationConfigSuccess, setLocationConfig, updateLocationConfigPostLogon } from "./locationconfig.action";
import { initialLocationConfigState, LocationConfigState } from "./locationconfig.state";

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

export const _getLocationConfigReducer = createReducer(
    initialLocationConfigState,
    on(getLocationConfigSuccess, (state, action) => {
        const primaryConfig = action.locationCnfg 
            ? action.locationCnfg
            : null;

        return {
            ...state,
            locationCnfg: primaryConfig
        };
    }),
    on(setLocationConfig, (state, action) => {
        if (!action.locationConfig) {
            return state;
        }

        return {
            ...state,
            locationCnfg: state.locationCnfg
                ? mergeNonNull(state.locationCnfg as any, action.locationConfig as any)
                : action.locationConfig
        };
    }),
    on(updateLocationConfigPostLogon, (state, action) => {
        if (!state.locationCnfg) {
            return state;
        }

        return {
            ...state,
            locationCnfg: {
                ...state.locationCnfg,
                associateName: action.associateName,
                associateRole: action.associateRole,
                associateRoleDesc: action.associateRoleDesc,
                contractNumber: action.contractNumber,
                contractUID: action.contractUID,
                facilityName: action.facilityName,
                locationName: action.locationName,
                facilityNumber: action.facilityNumber,
                vendorNumber: action.vendorNumber,
                vendorName: action.vendorName
            }
        };
    })
);

export function GetLocationConfigReducer(state: LocationConfigState, action: Action) {
    return _getLocationConfigReducer(state, action);
}
