export class VerifoneCommStatus {
    // Default values are set in the constructor or directly
    public IsSuccess: boolean = false;
    public ResultData: string = "";
    public TabMachineName: string = "";
    public IpAddress: string = "";
    public VersionNum: string = '';   // assuming VersionNumber is imported/defined
    public SecondaryData: string = "";
    public DetailedStatus: string = "";
    public MacLabelInSession: string = "";
    public SessionDuration: string = "";
    public InvoiceSession: string = "";
    public DeviceName: string = "";
    public SerialNumber: string = "";
    public OsName: string = "";
    public PinpadVersion: string = "";

    // These were not initialized in Java → kept as undefined or optional
    public ResponseCode?: string;
    public PosId?: string;
    public AppId?: string;
    public CctId?: string;
    public AesdkVersion?: string;
    public CctScreenName?: string;
    public CctVersion?: string;
    public ResponseText?: string;
    public PinPadType?: string;

    constructor() {
        // You can add any initialization logic here if needed
        // (Java had empty constructor → we keep it empty too)
    }
}