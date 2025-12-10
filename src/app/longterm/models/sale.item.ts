export class SaleItem {
    allowEnvTax: boolean = false;
    allowPartPay: boolean = false;
    allowSaveTkt: boolean = false;
    allowTags: boolean = false;
    allowTaxExemption: boolean = false;
    allowTips: boolean = false;
    businessFunctionDescription: string = '';
    businessFunctionUID: number = 0;
    businessModel: string = '';
    contractUID: number = 0;
    currencyCode: string = '';
    currencyDesc: string = '';
    custInfoReq: boolean = false;
    defaultCurrency: string = '';
    defaultNoOfTags: number = 0;
    departmentName: string = '';
    departmentUID: number = 0;
    deptActive: boolean = false;
    deptMaintTimeStamp: Date = {} as Date;
    displayOrder: number = 0;
    displayOrderItem: number = 0;
    envTax: number = 0;
    exchCouponsAfterTax: number = 0;
    facActive: boolean = false;
    facMaintTimeStamp: Date = {} as Date;
    facilityNumber: string = '';
    facilityUID: number = 0;
    feePercent: number = 0;
    locationName: string = '';
    locationUID: number = 0;
    maintTimestamp: Date = {} as Date;
    noOfTags: number = 0;
    openCashDrwForTips: boolean = false;
    price: number = 0;
    saleItemActive: boolean = false;
    salesCatActive: boolean = false;
    salesCatMaintTimeStamp: Date = {} as Date;
    salesCatTypeUID: number = 0;
    salesCategoryDescription: string = '';
    salesCategoryID: number = 0;
    salesItemDescription: string = '';
    salesItemID: number = 0;
    salesTax: number = 0;
    vendCouponsAfterTax: boolean = false;
}

export interface SaleItemInterface {
    allowEnvTax: boolean;
    allowPartPay: boolean;
    allowSaveTkt: boolean; 
    allowTags: boolean;
    allowTaxExemption: boolean;
    allowTips: boolean;
    businessFunctionDescription: string; 
    businessFunctionUID: number;
    businessModel: string;
    contractUID: number;
    currencyCode: string;
    currencyDesc: string;
    custInfoReq: boolean;
    defaultCurrency: string;
    defaultNoOfTags: number;
    departmentName: string;
    departmentUID: number;
    deptActive: boolean;
    deptMaintTimeStamp: Date;
    displayOrder: number;
    displayOrderItem: number;
    envTax: number;
    exchCouponsAfterTax: number;
    facActive: boolean;
    facMaintTimeStamp: Date;
    facilityNumber: string;
    facilityUID: number;
    feePercent: number;
    locationName: string;
    locationUID: number;
    maintTimestamp: Date;
    noOfTags: number;
    openCashDrwForTips: boolean;
    price: number;
    saleItemActive: boolean;
    salesCatActive: boolean;
    salesCatMaintTimeStamp: Date;
    salesCatTypeUID: number;
    salesCategoryDescription: string;
    salesCategoryID: number;
    salesItemDescription: string;
    salesItemID: number;
    salesTax: number;
    vendCouponsAfterTax: boolean;
}

export const SaleItemInitialState: SaleItemInterface = {
    allowEnvTax: false,
    allowPartPay: false,
    allowSaveTkt: false,
    allowTags: false,
    allowTaxExemption: false,
    allowTips: false,
    businessFunctionDescription: '',
    businessFunctionUID: 0,
    businessModel: '',
    contractUID: 0,
    currencyCode: '',
    currencyDesc: '',
    custInfoReq: false,
    defaultCurrency: '',
    defaultNoOfTags: 0,
    departmentName: '',
    departmentUID: 0,
    deptActive: false,
    deptMaintTimeStamp:{} as Date,
    displayOrder: 0,
    displayOrderItem: 0,
    envTax: 0,
    exchCouponsAfterTax: 0,
    facActive: false,
    facMaintTimeStamp:{} as Date,
    facilityNumber: '',
    facilityUID: 0,
    feePercent: 0,
    locationName: '',
    locationUID: 0,
    maintTimestamp:{} as Date,
    noOfTags: 0,
    openCashDrwForTips: false,
    price: 0,
    saleItemActive: false,
    salesCatActive: false,
    salesCatMaintTimeStamp:{} as Date,
    salesCatTypeUID: 0,
    salesCategoryDescription: '',
    salesCategoryID: 0,
    salesItemDescription: '',
    salesItemID: 0,
    salesTax: 0,
    vendCouponsAfterTax: false
}

export class SalesCat {
    public salesCatActive: boolean = false;
    public salesCatMaintTimeStamp: Date = {} as Date;
    public salesCatTypeUID: number = 0;
    public salesCategoryDescription: string = '';
    public salesCategoryID: number = 0;
    public departmentName: string = '';
    public departmentUID: number = 0;

}

export interface DeptInterface {
    departmentName: string;
    departmentUID: number;
}

export const DeptObj: DeptInterface = {
    departmentName: '',
    departmentUID: 0
}


export class Dept {
    departmentName: string = '';
    departmentUID: number = 0;
}
