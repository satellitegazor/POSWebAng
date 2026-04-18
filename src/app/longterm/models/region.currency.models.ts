import { MobileBase } from '../../models/mobile.base';

export class CPOS_Currency {
	regionCode: string = '';
	currencyCode: string = '';
	currencyDesc: string = '';
	displayOrder: string = '';
}

export class CPOS_RegionCountry {
	regionCode: string = '';
	regionDesc: string = '';
	countryCode: string = '';
	countryName: string = '';
	displayOrder: string = '';
}

export class CPOS_RegionCountryCurrencyResultsModel {
	results: MobileBase = {} as MobileBase;
	cposRegionCountry: CPOS_RegionCountry[] = [];
	cposCurrency: CPOS_Currency[] = [];
}

export class CPOS_Region {
	regionCode: string = '';
	regionDesc: string = '';
	displayOrder: string = '';
}

export class CPOS_RegionResultsModel {
	results: MobileBase = {} as MobileBase;
	cposRegion: CPOS_Region[] = [];
}
