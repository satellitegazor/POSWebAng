import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "./auth.state";

export const LOGIN_AUTH_STATE = "loginAuthState"; 
const getAuthLoginState = createFeatureSelector<AuthState>(LOGIN_AUTH_STATE);

export const getAuthLoginSelector = createSelector(getAuthLoginState, 
    (state) => {
        return state ? state.authMdl : null;
    }
)

// export const getAuthLoginToken = createSelector(getAuthLoginState, 
//     (state) => {
//         return state ? state.authMdl?.tokenString : "";
//     }
// )

