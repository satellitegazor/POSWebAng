import { MobileBase } from '../../../app/models/mobile.base';

export class LTCSpecialInstructionsParmModel {
	departmentUID: number = 0;
	hasChanges: boolean = false;
	instructions: LTCSpecialInstructions[] = [];
}

export class LTCSpecialInstructions {
	departmentUID: number = 0;
	splInstructionUID: number = 0;
	description: string = '';
	active: boolean = false;
	displayOrder: number = 0;
	hasUpdates: boolean = false;
	locSplInstCount: number = 0;
}

export class LTCSpecialInstructionsResultsModel {
	specialInstructions: LTCSpecialInstructions[] = [];
	results: MobileBase = {} as MobileBase;
}
