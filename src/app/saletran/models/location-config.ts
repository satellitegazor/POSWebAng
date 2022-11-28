import { MobileBase } from "src/app/models/mobile.base"; 

export class LocationConfigModel {

    public Results: MobileBase = {} as MobileBase;
    public Data: LocationConfig[] = [];
}

export class LocationConfig {
    public BusinessFunctionUID: number = 0;
    public BusinessModel: number = 0;
    public AllowPartPay: boolean = false;
    public AllowSaveTkt: boolean = false;
    public AllowTips: boolean = false;
    public OpenCashDrawer: boolean = false;
    public ExchCouponsAfterTax: boolean = false;
    public VendCouponsAfterTax: boolean = false;
    public FacilityUID: number = 0;
    public FacilityNumber: string = '';
    public LocationUID: number = 0;
    public LocationName: string = '';
    public StoreName: string = '';
    public PINReqdForSalesTran: boolean = false;
    public AssociateName: string = '';
    public AssociateRole: string = '';
    public AssociateRoleDesc: string = '';
    public ContractUID: number = 0;
    public ContractNumber: string = '';
    public VendorNumber: string = '';
    public VendorName: string = '';
    public FacilityName: string = '';
    public IndividualUID: number = 0;
    public IndLocUID: number = 0;
    public ContractStart: Date = {} as Date;
    public ContractEnd: Date = {} as Date;
    public BusFuncCode: string = '';
    public AssocEmail: string = '';
    public IsVendorLogin: boolean = false;
    public SBMUserFirstName: string = '';
    public SBMUserMiddleName: string = '';
    public SBMUserLastName: string = '';
    public SBMUserJobTitle: string = '';
    public SBMUserFullName: string = '';
    public SBMFaciltyNumber: string = '';
    public SBMFacilityName: string = '';
    public RgnCode: string = '';
    public CountryCode: string = '';
    public CurrCode: string = '';
    public CCDevice: string = '';
    public RegionId: string = '';
    public DefaultCurrency: string = '';
    public USDFastcash: string = '';
    public FrgnFastcash: string = '';
    public CountryDialCode: string = '';
    public AddressLine1: string = '';
    public AddressLine2: string = '';
    public City: string = '';
    public StateProvice: string = '';
    public PhoneNumber: string = '';
    public PostalCode: string = '';
    public HoursOfOperations: LTC_HoursOfOperation[] = [];
    public EagleCashOptn: boolean = false;
    public UseShipHndlng: boolean = false;
}


export class LTC_HoursOfOperation {
    public HrsOfOperationID: number = 0;
    public LocationUID: number = 0
    public DayFrom: string = '';
    public DayTo: string = '';
    public TimeFrom: string = '';
    public TimeTo: string = '';
    public DisplayOrder: string = '';
    public HasUpdates: boolean = false;
}