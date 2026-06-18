
import { GetSaleItemMenuReducer } from "./saleitem.reducers";
import { RDeptCategoryResultModels } from "../../models/models";

export interface SaleItemsState {
    saleItemRsltsMdl: RDeptCategoryResultModels | null;
}

export const initialSaleItemState: SaleItemsState = {
    saleItemRsltsMdl: null
}