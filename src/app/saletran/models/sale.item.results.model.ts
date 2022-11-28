import { MobileBase } from "../../models/mobile.base";
import { SaleItem } from "./sale.item"; 

export class SaleItemResultsModel {
    public results: MobileBase = {} as MobileBase;
    public itemButtonMenuResults: SaleItem[] = [];
}