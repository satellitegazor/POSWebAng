import { LTC_LocationAssociatesResultsModel } from "../../../models/location.associates";


export interface LocationAssocState {
    locAssocs: LTC_LocationAssociatesResultsModel | null;
}
 
export const initialLocationAssocState: LocationAssocState = {
    locAssocs: null
}