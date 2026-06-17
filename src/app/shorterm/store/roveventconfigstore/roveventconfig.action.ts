import { createAction, props } from "@ngrx/store";
import { EventConfig } from "../../models/event.config";

export const GET_EVENT_CONFIG_START = '[EventConfig] getConfig Start'
export const GET_EVENT_CONFIG_SUCCESS = '[EventConfig] getConfig success'
export const GET_EVENT_CONFIG_FAIL = '[EventConfig] getConfig fail'
export const SET_EVENT_CONFIG = '[EventConfig] Set Config'
export const UPDATE_EVENT_CONFIG_POST_LOGON = '[EventConfig] Update Config Post Logon'


export const getEventConfigStart = createAction(GET_EVENT_CONFIG_START,
    props<{eventId: number, individualUID: number}>());

export const getEventConfigSuccess = createAction(GET_EVENT_CONFIG_SUCCESS,
    props<{eventConfig: EventConfig}>());
 
export const getEventConfigFail = createAction(GET_EVENT_CONFIG_FAIL,
    props<{errMessage: String}>())

export const setEventConfig = createAction(SET_EVENT_CONFIG,
    props<{eventConfig: EventConfig}>());

export const updateEventConfigPostLogon = createAction(UPDATE_EVENT_CONFIG_POST_LOGON,
    props<{
        associateName: string,
        associateRole: string,
        associateRoleDesc: string,
        contractNumber: string,
        contractUID: number,
        facilityName: string,
        eventName: string,
        facilityNumber: string,
        vendorNumber: string,
        vendorName: string
    }>());

