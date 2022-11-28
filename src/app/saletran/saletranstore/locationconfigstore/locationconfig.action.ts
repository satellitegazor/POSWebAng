import { createAction, props } from "@ngrx/store";
import { LocationConfigModel } from "../../models/location-config";

export const GET_LOCATION_CONFIG_START = '[LocationConfig] getConfig Start'
export const GET_LOCATION_CONFIG_SUCCESS = '[LocationConfig] getConfig success'
export const GET_LOCATION_CONFIG_FAIL = '[LocationConfig] getConfig fail'

export const getLocationConfigStart = createAction(GET_LOCATION_CONFIG_START,
    props<{locationId: number, individualUID: number}>());

export const getLocationConfigSuccess = createAction(GET_LOCATION_CONFIG_SUCCESS,
    props<{locationCnfg: LocationConfigModel}>());
 
export const getLocationConfigFail = createAction(GET_LOCATION_CONFIG_FAIL,
    props<{errMessage: String}>())