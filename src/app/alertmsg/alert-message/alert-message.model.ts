export class Alert {
    id?: string;
    type?: AlertType;
    message?: string;
    autoClose?: boolean;
    keepAfterRouteChange?: boolean;
    fade?: boolean;

    constructor(init?:Partial<Alert>) {
        Object.assign(this, init);
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}

export class AlertOptions {
    id?: string;
    autoClose?: boolean;
    keepAfterRouteChange?: boolean;
    constructor(_id: string, _autoClose: boolean, _keepAfterRouteChange: boolean) {
        this.id = _id;
        this.autoClose = _autoClose;
        this.keepAfterRouteChange = _keepAfterRouteChange;
    }
}