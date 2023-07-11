export class ContractSummaryGrouped {
    public FacilityNumber: string = '';
    public LocationName: string = '';
    public TenderTypeCode: string = '';
    public TenderTypeDescription: string = '';
    public Associate: string = '';
    public LocationUID: number = 0;
    public IndividualUID: number = 0;
    public DisplayOrder: number = 0;
    public NbrTrans: number = 0;
    public NbrTender: number = 0;
    public Sales: number = 0;
    public TipAmount: number = 0;
    public Refunds: number = 0;
    public SalesTax: number = 0;
    public CouponTotal: number = 0;
    public VendorCoupons: number = 0;
    public ExchangeCoupons: number = 0;
    public LineItmKatsaCpnAmt: number = 0;
}

/// <summary>
/// End of Event and Current Day Summary Report Details
/// </summary>
export class ContractTransactionDetail {
    public TicketNumber: number = 0;
    public FacilityNumber: string = ''
    public TransactionId: number = 0;
    public IndividualUID: number = 0;
    public Associate: string = ''
    public TransactionDate: Date = {} as Date;
    public TenderTypeCode: string = ''
    public TenderTypeDescription: string = ''
    public DisplayOrder: number = 0;
    public PartPayUID: number = 0;

    public TaxExempted: string = ''
    public NbrTrans: number = 0;
    public Sales: number = 0;
    public TipAmount: number = 0;
    public Refunds: number = 0;
    public SalesTax: number = 0;
    public EnvTax: number = 0;
    public CouponTotal: number = 0;

    public TransactionOrder: number = 0; // Descending order
    public TransactionDateOrder: number = 0; // Descending order
    public TenderOrderAsc: number = 0; // Ascending order
    public TenderOrderDesc: number = 0; // Descending order

    public VendorCoupons: number = 0;
    public ExchangeCoupons: number = 0;
    public KATUSACoupons: number = 0;
    public ShipHandling: number = 0; //CPS-6850 VG 
}