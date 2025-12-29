import { MobileBase } from "src/app/models/mobile.base";

export class LTC_SaveSalesItemModelParameters {
    ContractUID: number = 0;
    AllowTaxExemption: boolean = false;
    ExchCouponsAfterTax: boolean = false;
    VendCouponsAfterTax: boolean = false;
    OpenCashDrawerForTips: boolean = false;
    DefaultCurrency: string = '';
    SalesItems: LTC_SalesItems[] = [];
}

export class LTC_SalesItems {
    DisplayOrderItem: number = 0;
    FacilityUID: number = 0;
    LocationUID: number = 0;
    BusinessFunctionID: number = 0;
    SalesCategoryID: number = 0;
    SalesItemID: number = 0;
    SalesItemDescription: string = '';
    SalesCategoryDescription: string = '';
    Price: number = 0;
    SalesTax: number = 0;          // stored as decimal (e.g., 0.0825 for 8.25%)
    EnvTax: number = 0;
    ExchCouponsAfterTax: boolean | null = false;
    VendCouponsAfterTax: boolean | null = false;
    AllowTaxExemption: boolean | null = false;
    NoOfTags: number = 0;
    HasUpdates: boolean = false;
    Action: number = 0;            // e.g., 0 = none, 1 = insert, 2 = update, 3 = delete
}

export class LTC_SaveSalesItemModel {
    Results: MobileBase = new MobileBase();
    SalesItems: LTC_SalesItems[] = [];
    ShowAddMenuBtn: boolean = false;
}