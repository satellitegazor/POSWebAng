import { createAction, props } from "@ngrx/store";
import { LTC_LocationAssociatesResultsModel } from "../../models/location.associates";


export const GET_LOCATION_Assoc_START = '[LocationAssoc] getLocAssoc Start'
export const GET_LOCATION_Assoc_SUCCESS = '[LocationAssoc] getLocAssoc success'
export const GET_LOCATION_Assoc_FAIL = '[LocationAssoc] getLocAssoc fail'

export const getLocationAssocStart = createAction(GET_LOCATION_Assoc_START,
    props<{locationId: number, individualUID: number}>());

export const getLocationAssocSuccess = createAction(GET_LOCATION_Assoc_SUCCESS,
    props<{locAssocs: LTC_LocationAssociatesResultsModel}>());
 
export const getLocationAssocFail = createAction(GET_LOCATION_Assoc_FAIL,
    props<{errMessage: String}>())