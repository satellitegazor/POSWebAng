import { SaleItem } from "./sale.item";

export class SaleItemButton {
    constructor(private saleItem: SaleItem) {}
    description: string = this.saleItem.salesItemDescription;
    price: number = this.saleItem.price;
    salesTax: number = this.saleItem.salesTax;
    displayOrder: number = this.saleItem.displayOrder;
    id: number = this.saleItem.salesItemID;
    departmentUID: number = this.saleItem.departmentUID;
    salesCategoryID: number = this.saleItem.salesCategoryID;
}