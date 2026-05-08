import { MobileBase } from "./mobile.base";


export class LogonResultsModel {
    results?: MobileBase;
    userPrincipal?: MobPrincipal;
    userIdentity?: MobClientIdentity;
    userRoles?: string[];
    isAuthorized?: boolean;
    posTerminalId?: string;
}

export class MobClientIdentity {
    public nonAssociatePersonnelCodes: string = "CIMO";
    public name: string = '';
    public employeeID: number = 0;
    public firstName: string = '';
    public middleInitial: string = '';
    public lastName: string = '';
    public suffix: string = '';
    public fullName: string = '';
    public employeeTitle: string = '';
    public emailAddress: string = '';
    public personnelCategoryCode: string = '';
    public jobTitle: string = '';
    public dutyFacilityNumber: string = '';
    public dutyFacilityName: string = '';
    public useR_ID: string = '';
    public principalCacheKey: string = '';
    public isLnUser: boolean = false;
    public isNonAssociate: boolean = false;
    public isAuthenticated: boolean = false;
}


export class SystemStatus {
    priority?: string;
    processUp?: string;
    expectedUpTime?: string;
    reason?: string;
    downTimeStart?: Date;
    downTimeEnd?: Date;
}

export class LogonModel {
    tssId?: string;
    tssPW?: string;
    loggingOut?: boolean;
    status?: SystemStatus;
}


export class MobIdentity {
    static nonAafesPersonnelCodes = "CIMO";

    employeeId?: number;
    firstName?: string;
    middleInitial?: string;
    lastName?: string;
    suffix?: string;
    fullName?: string;
    employeeTitle?: string;
    emailAddress?: string;
    personnelCategoryCode?: string;
    dutyFacilityNumber?: string;
    authenticationType?: string;
    isAuthenticated?: boolean;
    name?: string;

    constructor(userName?: string) {
        if (userName) {
            this.name = userName;
        }
    }

    get principalCacheKey(): string {
        return MobIdentity.principalCacheKeyFor(this.name || '');
    }

    static principalCacheKeyFor(userName: string): string {
        return `GenericPrincipal_${userName}`;
    }

    get isLnUser(): boolean {
        return this.personnelCategoryCode === 'L';
    }

    get isNonAafes(): boolean {
        if (!this.personnelCategoryCode) return false;
        return MobIdentity.nonAafesPersonnelCodes.split('').some(c => this.personnelCategoryCode!.includes(c));
    }
}

export class MobPrincipal {
    roles: string[];
    mobIdentity: MobIdentity;

    constructor(identity: MobIdentity, roles: string[]) {
        this.mobIdentity = identity;
        this.roles = roles;
    }
}
