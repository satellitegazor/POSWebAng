import { LocationConfig } from "../../../models/location-config";

export interface LocationConfigState {
    locationCnfg: LocationConfig | null;
}
 
export const initialLocationConfigState: LocationConfigState = {
    locationCnfg: new LocationConfig()
}