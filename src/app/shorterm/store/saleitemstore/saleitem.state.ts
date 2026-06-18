
import { GetSaleItemMenuReducer } from "./saleitem.reducers";
import { RDeptCategoryResultModels } from "../../models/models";

export interface RovSaleItemsState {
    saleItemRsltsMdl: RDeptCategoryResultModels | null;
}

export const initialRovSaleItemState: RovSaleItemsState = {
    saleItemRsltsMdl: null
}