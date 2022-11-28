import { VendorLoginResultsModel } from "../models/vendor.login.results.model"; 


export interface AuthState {
    authMdl: VendorLoginResultsModel | null;
}

export const initialAuthState: AuthState = {
    authMdl: null
}