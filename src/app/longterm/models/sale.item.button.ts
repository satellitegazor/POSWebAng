import { SaleItem } from "./sale.item";

export class SaleItemButton {

    constructor(private saleItem: SaleItem) 
    {
        this.description = this.saleItem.salesItemDescription;
        this.price = this.saleItem.price;
        this.salesTax = this.saleItem.salesTax;
        this.displayOrder = this.saleItem.displayOrder;
        this.id = this.saleItem.salesItemID;
        this.departmentUID = this.saleItem.departmentUID;
        this.salesCategoryID = this.saleItem.salesCategoryID;
    }

    description: string = ''; 
    price: number = 0;
    salesTax: number = 0;
    displayOrder: number = 0;
    id: number = 0;
    departmentUID: number = 0;
    salesCategoryID: number = 0;

}