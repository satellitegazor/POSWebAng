
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


