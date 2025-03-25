import { MobileBase } from "./mobile.base";

    export class DailyExchRateMdl
    {
        public  Results: MobileBase = {} as MobileBase ;
        public  data: DailyExchRate = {} as DailyExchRate ;
    }

    export class DailyExchRate
    {
        public  currCode: string = '';
        public  isForeignCurr: boolean = false;
        public  dailyExchRateId: number = 0;
        public  eventId: number = 0;
        public  locationId: number = 0;
        public  exchangeRate: number = 0;
        public  oneUSDRate: number = 0;
        public  isOneUSD: boolean = false;
        public  oneFCurrRate: number = 0;
        public  cliTimeVar: number = 0;
        public  maintUserId: number = 0;
        public  maintTimeStamp: Date = {} as Date;
        public  busDate: Date = {} as Date;
        public  saleTranCount: number = 0;
        public  prevDayExchRate: number = 0;
        public  prevDayIsOneUSD: boolean = false;
        public  dfltCurrCode: string = '';
        public  foreignCurrCode: string = '';
    }
