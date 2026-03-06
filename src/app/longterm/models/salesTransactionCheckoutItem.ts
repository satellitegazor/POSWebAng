export class SalesTransactionCheckoutItem 
{
    ticketDetailId: number = 0;
    tktTransactionID: number = 0;
    salesItemDesc: string = "";
    salesItemUID: number = 0;
    salesCategoryUID: number = 0;
    quantity: number = 0;
    unitPrice: number = 0;
    salesTaxPct: number = 0;
    envrnmtlTaxPct: number = 0;
    noOfTags: number = 0;
    vendorCouponDiscountPct: number = 0;
    discountAmount: number = 0;
    exchangeCouponDiscountPct: number = 0;
    couponLineItemDollarAmount: number = 0;
    lineItemTaxAmount: number = 0;
    lineItemEnvTaxAmount: number = 0;
    lineItemDollarDisplayAmount: number = 0;
    dtlMaintTimestamp: Date = {} as Date;
    dtlMaintUserId: string = "";
    isMiscellaneous: boolean = false;
    contractUID: number = 0;
    locationUID: number = 0;
    facilityUID: number = 0;
    departmentUID: number = 0;
    businessFunctionUID: number = 0;
    deptName: string = "";
    custInfoReq: boolean = false;
    applyCouponsAfterTax: boolean = false;
    allowPartPay: boolean = false;
    allowSaveTkt: boolean = false;
    instruction: string = "";
    addlInstruction: string = "";
    openCashDrwForTips: boolean = false;
    allowTips: boolean = false;
    srvdByAssociateVal: number = 0;
    srvdByAssociateText: string = "";
    businessFuncCode: string = "";
    splInstUID: number = 0;
    splInstDesc: string = "";
    splInstOthRsn: string = "";
    itemSaved: boolean = false;
    fcCouponLineItemDollarAmount: number = 0;
    fcDiscountAmount: number = 0;
    fcLineItemDollarDisplayAmount: number = 0;
    fcLineItemTaxAmount: number = 0;
    fcUnitPrice: number = 0;
    lineItmKatsaCpnAmt: number = 0;
    fcLineItmKatsaCpnAmt: number = 0;
    fcLineItemEnvTaxAmount: number = 0;
    exchCpnAmountDC = 0;
    vndCpnAmountDC = 0;
    exchCpnAmountNDC = 0;
    vndCpnAmountNDC = 0;

    public static deepCopySaleItemList(sourceList: SalesTransactionCheckoutItem[]) {
        let destList: SalesTransactionCheckoutItem[] = [];
        sourceList.forEach(saleItem => {
            let destSaleItem = SalesTransactionCheckoutItem.deepCopy(saleItem);
            destList.push(destSaleItem);
        });
        return destList;
    }

    public static deepCopy(source: SalesTransactionCheckoutItem): SalesTransactionCheckoutItem {
        const copy = new SalesTransactionCheckoutItem();

        // Simple value fields with null/undefined → safe defaults
        copy.ticketDetailId = source.ticketDetailId ?? 0;
        copy.tktTransactionID = source.tktTransactionID ?? 0;
        copy.salesItemDesc = source.salesItemDesc ?? "";
        copy.salesItemUID = source.salesItemUID ?? 0;
        copy.salesCategoryUID = source.salesCategoryUID ?? 0;
        copy.quantity = source.quantity ?? 0;
        copy.unitPrice = source.unitPrice ?? 0;
        copy.salesTaxPct = source.salesTaxPct ?? 0;
        copy.envrnmtlTaxPct = source.envrnmtlTaxPct ?? 0;
        copy.noOfTags = source.noOfTags ?? 0;
        copy.vendorCouponDiscountPct = source.vendorCouponDiscountPct ?? 0;
        copy.discountAmount = source.discountAmount ?? 0;
        copy.exchangeCouponDiscountPct = source.exchangeCouponDiscountPct ?? 0;
        copy.couponLineItemDollarAmount = source.couponLineItemDollarAmount ?? 0;
        copy.lineItemTaxAmount = source.lineItemTaxAmount ?? 0;
        copy.lineItemEnvTaxAmount = source.lineItemEnvTaxAmount ?? 0;
        copy.lineItemDollarDisplayAmount = source.lineItemDollarDisplayAmount ?? 0;
        copy.dtlMaintUserId = source.dtlMaintUserId ?? "";
        copy.isMiscellaneous = source.isMiscellaneous ?? false;
        copy.contractUID = source.contractUID ?? 0;
        copy.locationUID = source.locationUID ?? 0;
        copy.facilityUID = source.facilityUID ?? 0;
        copy.departmentUID = source.departmentUID ?? 0;
        copy.businessFunctionUID = source.businessFunctionUID ?? 0;
        copy.deptName = source.deptName ?? "";
        copy.custInfoReq = source.custInfoReq ?? false;
        copy.applyCouponsAfterTax = source.applyCouponsAfterTax ?? false;
        copy.allowPartPay = source.allowPartPay ?? false;
        copy.allowSaveTkt = source.allowSaveTkt ?? false;
        copy.instruction = source.instruction ?? "";
        copy.addlInstruction = source.addlInstruction ?? "";
        copy.openCashDrwForTips = source.openCashDrwForTips ?? false;
        copy.allowTips = source.allowTips ?? false;
        copy.srvdByAssociateVal = source.srvdByAssociateVal ?? 0;
        copy.srvdByAssociateText = source.srvdByAssociateText ?? "";
        copy.businessFuncCode = source.businessFuncCode ?? "";
        copy.splInstUID = source.splInstUID ?? 0;
        copy.splInstDesc = source.splInstDesc ?? "";
        copy.splInstOthRsn = source.splInstOthRsn ?? "";
        copy.itemSaved = source.itemSaved ?? false;
        copy.fcCouponLineItemDollarAmount = source.fcCouponLineItemDollarAmount ?? 0;
        copy.fcDiscountAmount = source.fcDiscountAmount ?? 0;
        copy.fcLineItemDollarDisplayAmount = source.fcLineItemDollarDisplayAmount ?? 0;
        copy.fcLineItemTaxAmount = source.fcLineItemTaxAmount ?? 0;
        copy.fcUnitPrice = source.fcUnitPrice ?? 0;
        copy.lineItmKatsaCpnAmt = source.lineItmKatsaCpnAmt ?? 0;
        copy.fcLineItmKatsaCpnAmt = source.fcLineItmKatsaCpnAmt ?? 0;
        copy.fcLineItemEnvTaxAmount = source.fcLineItemEnvTaxAmount ?? 0;
        copy.exchCpnAmountDC = source.exchCpnAmountDC ?? 0;
        copy.vndCpnAmountDC = source.vndCpnAmountDC ?? 0;
        copy.exchCpnAmountNDC = source.exchCpnAmountNDC ?? 0;
        copy.vndCpnAmountNDC = source.vndCpnAmountNDC ?? 0;

        // Special handling for Date (null/undefined → new Date())
        copy.dtlMaintTimestamp = source.dtlMaintTimestamp instanceof Date
            ? new Date(source.dtlMaintTimestamp)   // proper deep copy of Date
            : (source.dtlMaintTimestamp ? new Date(source.dtlMaintTimestamp) : new Date());

        // Arrays (deep copy)

        // If you have more nested objects, copy them similarly

        return copy;
    }

}