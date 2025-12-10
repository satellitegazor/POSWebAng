import { MobileBase } from "src/app/models/mobile.base";

// Optional: If you prefer class syntax instead of interfaces
export class AssociatePINUpdateResultsModel {
    Results: MobileBase = {} as MobileBase;
    VendorNumber: string | null = null;
    VendorName: string | null = null;
    FacilityNumber: string | null = null;
    FacilityName: string | null = null;
    LocationName: string | null = null;
    AssociateEmail: string | null = null;
    ContractStart: string = '';
    ContractEnd: string = '';
    IndividualRole: string | null = null;
    AssociateName: string | null = null;
}