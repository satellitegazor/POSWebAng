import { createAction, props } from "@ngrx/store";
import { VLogonModel } from "../logon/models/vlogon.model";
import { VendorLoginResultsModel } from "../models/vendor.login.results.model";

export const GET_LOGIN_AUTH_START = '[Login] auth Start' 
export const GET_LOGIN_AUTH_SUCCESS = '[Login] auth success'
export const GET_LOGIN_AUTH_FAIL = '[Login] auth fail'

export const getLoginStart = createAction(GET_LOGIN_AUTH_START,
    props<{logonMdl: VLogonModel}>());

export const getLoginSuccess = createAction(GET_LOGIN_AUTH_SUCCESS,
    props<{authMdl: VendorLoginResultsModel}>());

export const getLoginFail = createAction(GET_LOGIN_AUTH_FAIL,
    props<{errMessage: String}>())