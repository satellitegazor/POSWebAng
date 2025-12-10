import { createFeatureSelector, createSelector } from "@ngrx/store";
import { LocationAssocState } from "./locationassociates.state";

export const LOC_Assoc_STATE = 'sharedLocatonAssocState'
const getLocAssocState = createFeatureSelector<LocationAssocState>(LOC_Assoc_STATE)

export const getLocationAssocSelector = createSelector(getLocAssocState, 
    (state) => {
    return state ? state.locAssocs : null;
});