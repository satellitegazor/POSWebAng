export class TicketTender {
    public ticketTenderId: number = 0;
    public tenderTypeId: number = 0;
    public tenderTransactionId: number = 0;
    public tenderTypeCode: string = '';
    public tenderTypeDesc: string = '';
    public isRefundType: boolean = false;
    public displayOrder: number = 0;
    public cardEndingNbr: string = '';
    public tracking: string = '';
    public traceId: string = '';
    public authNbr: string = '';
    public tenderAmount: number = 0;
    public fCTenderAmount: number = 0;
    public changeDue: number = 0;
    public fCChangeDue: number = 0;
    public cardBalance: number = 0;
    public fCCurrCode: string = '';
    public transactionNumber: string = '';
    public tndMaintTimestamp: Date = {} as Date;
    public tndMaintUserId: string = '';
    public tipAmount: number = 0;
    public fCTipAmount: number = 0;
    public rRN: string = '';
    public milstarPlanNum: string = '';
    public checkNumber: string = '';
 }
 