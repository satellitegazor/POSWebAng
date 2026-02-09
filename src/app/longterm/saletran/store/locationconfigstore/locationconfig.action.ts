import { createAction, props } from "@ngrx/store";
import { LocationConfigModel } from "../../../models/location-config";
import { TicketSplit } from "src/app/models/ticket.split";
import { LTC_Ticket } from "src/app/longterm/models/ticket.list";

export const GET_LOCATION_CONFIG_START = '[LocationConfig] getConfig Start'
export const GET_LOCATION_CONFIG_SUCCESS = '[LocationConfig] getConfig success'
export const GET_LOCATION_CONFIG_FAIL = '[LocationConfig] getConfig fail'
export const SET_LOCATION_CONFIG = '[LocationConfig] Set Config'


export const getLocationConfigStart = createAction(GET_LOCATION_CONFIG_START,
    props<{locationId: number, individualUID: number}>());

export const getLocationConfigSuccess = createAction(GET_LOCATION_CONFIG_SUCCESS,
    props<{locationCnfg: LocationConfigModel}>());
 
export const getLocationConfigFail = createAction(GET_LOCATION_CONFIG_FAIL,
    props<{errMessage: String}>())

export const setLocationConfig = createAction(SET_LOCATION_CONFIG,
    props<{locationConfig: LocationConfigModel}>());

