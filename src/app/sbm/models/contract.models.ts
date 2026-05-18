import { MobileBase } from "../../models/mobile.base";
import { Vendor } from "../../longterm/models/contract.models";

export class ActiveContracts {
    id!: number;
    contractStart!: Date;
    contractEnd?: Date;
    contractNumber!: string;
    locationUid!: number;
    locationName!: string;
    maintTimestamp!: Date;
    maintUserId!: string;
    firstName!: string;
    lastName!: string;
    emailAddress!: string;
    vendorNumber!: string;
    title!: string;
    facilityNumber!: string;
    lastNotifiedDate!: Date;
    firstNotifyDate!: Date;
    secondNotifyDate!: Date;
    thirdNotifyDate!: Date;
    regionCode!: string;
}

export class ContractIdResultsModel {
    results!: MobileBase;
    activeContracts!: ActiveContracts[];
}

export class FAEmailAddress {
    regionCode!: string;
    emailAddress!: string;
}

export class SBMEmailList {
    exchangeNum!: string;
    sbmEmailAddr!: string;
}

export class ROVDerDiscrepancyModel {
    contractNumber!: string;
    regionCode!: string;
    eventId!: number;
    currencyCode!: string;
    eventName!: string;
    facilityNbr!: string;
    parentFacilityNbr!: string;
    exchangeRate!: number;
    vendorNumber!: string;
    vendorName!: string;
    eventStart!: Date;
    eventEnd!: Date;
    isOneUsd!: boolean;
    oneUsdRate!: number;
    oneFCurrRate!: number;
    foreignCurrCode!: string;
    usdCurrCode!: string;
}

export class LTCDerDiscrepancyModel {
    contractNumber!: string;
    regionCode!: string;
    locationUid!: number;
    currencyCode!: string;
    locationName!: string;
    facilityNumber!: string;
    parentFacilityNbr!: string;
    vendorNumber!: string;
    vendorName!: string;
    exchangeRate!: number;
    contractStart!: Date;
    contractEnd!: Date;
    isOneUsd!: boolean;
    oneUsdRate!: number;
    oneFCurrRate!: number;
    frgnCurrCode!: string;
    usdCurrCode!: string;
}

export class DERDiscrepancyModel {
    results!: MobileBase;
    ltcDerDiscrepancies!: LTCDerDiscrepancyModel[];
    rovDerDiscrepancies!: ROVDerDiscrepancyModel[];
    sbmEmailLst!: SBMEmailList[];
    faEmailLst!: FAEmailAddress[];
}

export class AuthModel {
    entity!: string;
    authType!: string;
    role!: string;
    roleDescription!: string;
    entityDescription!: string;
    roleId!: number;
    posTerminalId!: string;
}

export class GroupedContractList {
    vendorNumber: string = '';
    vendorName: string = '';
    contractId: number = 0;
    facNumberList: string = '';
    contractStartDate!: Date; 
    contractEndDate?: Date;
    parentFacNumber: string = '';
    sbmEmailAddress: string = '';
}

export class VendorContractData {
    contractId!: number;
    contractNumber!: string;
    contractStartDate!: Date;
    contractEndDate!: Date;
    appType!: number;
    eventIdToStart!: number;
    venderData!: Vendor;
    facNumberList!: string[];
}

export class ContractsGroupedByExchange {
    parentFacNbr!: string;
    parentFacName!: string;
    regionName!: string;
    sbmEmailAddr!: string | null;
    contractsInExchange!: VendorContractData[];
}

export class VendorContractDataModel {
    results!: MobileBase;
    dataByExchange!: ContractsGroupedByExchange[];
}
