import { LocationConfigModel } from "../../models/location-config";

export interface LocationConfigState {
    locationCnfg: LocationConfigModel | null;
}
 
export const initialLocationConfigState: LocationConfigState = {
    locationCnfg: null
}