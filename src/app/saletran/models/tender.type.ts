import { MobileBase } from "src/app/models/mobile.base";

export class TenderType {
    public tenderTypeCode: String = '';
    public tenderTypeDesc: String = '';
    public isRefundType: boolean = false;
    public displayThisTender: boolean = true;
    public active: boolean = false;
}

export class TenderTypeModel {

    public results: MobileBase = {} as MobileBase;
    public types: TenderType[] = [];
}