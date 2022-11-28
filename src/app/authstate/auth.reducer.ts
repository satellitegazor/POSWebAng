import { Action, createReducer, on } from "@ngrx/store";
import { getLoginSuccess } from "./auth.action";
import { initialAuthState, AuthState } from "./auth.state"; 

export const _getAuthLoginReducer = createReducer(
    initialAuthState,
    on(getLoginSuccess, (state, action) => {
        return {
            ...state,
            authMdl: action.authMdl
        };
    })
);

export function GetAuthLoginReducer (state: AuthState, action: Action ) {
    return _getAuthLoginReducer(state, action);
}