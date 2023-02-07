import { MobileBase } from "./mobile.base";

    export class DailyExchRateMdl
    {
        public  Results: MobileBase = {} as MobileBase ;
        public  Data: DailyExchRate = {} as DailyExchRate ;
    }

    export class DailyExchRate
    {
        public  CurrCode: string = '';
        public  IsForeignCurr: boolean = false;
        public  DailyExchRateId: number = 0;
        public  EventId: number = 0;
        public  LocationId: number = 0;
        public  ExchangeRate: number = 0;
        public  OneUSDRate: number = 0;
        public  IsOneUSD: boolean = false;
        public  OneFCurrRate: number = 0;
        public  CliTimeVar: number = 0;
        public  MaintUserId: number = 0;
        public  MaintTimeStamp: Date = {} as Date;
        public  BusDate: Date = {} as Date;
        public  SaleTranCount: number = 0;
        public  PrevDayExchRate: number = 0;
        public  PrevDayIsOneUSD: boolean = false;
        public  DfltCurrCode: string = '';
        public  ForeignCurrCode: string = '';
    }
