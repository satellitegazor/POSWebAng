import { SaleItem } from "../../../models/sale.item";
import { SaleItemResultsModel } from "../../../models/sale.item.results.model";
import { GetSaleItemMenuReducer } from "./saleitem.reducers";

export interface SaleItemsState {
    saleItemRsltsMdl: SaleItemResultsModel | null;
}

export const initialSaleItemState: SaleItemsState = {
    saleItemRsltsMdl: null
}