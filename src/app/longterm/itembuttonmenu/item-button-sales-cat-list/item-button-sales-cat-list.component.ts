import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SaleItem, SalesCat, SalesCategorySaveResponse } from '../../models/sale.item';
import { Observable } from 'rxjs';
import { SalesTranService } from '../../saletran/services/sales-tran.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LogonSvc } from 'src/app/logon/logonsvc.service';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';

@Component({
  selector: 'app-item-button-sales-cat-list',
  templateUrl: './item-button-sales-cat-list.component.html',
  styleUrl: './item-button-sales-cat-list.component.css',
  standalone: false
})
export class ItemButtonSalesCatListComponent {


  isHovered: any;

  constructor(private salesSvc: SalesTranService, private logonSvc: LogonDataService) {
    this.activeId = 0;
  }
  @Input() saleCatList: SalesCat[] = [];
  @Input('') salesCatListRefreshEvent: Observable<boolean> = new Observable<boolean>();
  @Output() saleCatClicked: EventEmitter<number> = new EventEmitter();
  @Output() saleItemAddedInSC: EventEmitter<SaleItem> = new EventEmitter();
  activeId: number = 0

  ngOnInit(): void {
    if (this.saleCatList.length > 0) {
      this.activeId = this.saleCatList[0].salesCategoryUID;
    }

    this.salesCatListRefreshEvent.subscribe(data => {
      //console.log('subscription called salesCatListRefresh: ' + data);
      if (data) {
        this.activeId = this.saleCatList[0].salesCategoryUID;
      }
    });
  }

  public salesCatgClick(event: Event, catgId: number): void {
    this.activeId = catgId;
    this.saleCatClicked.emit(catgId);
  }

  public updateSalesCatName(newName: string, catObj: SalesCat) {
    if (this.saleCatList.filter(cat => cat.description === newName).length > 0) {
      //console.log('Sales Category Name already exists: ' + $event);
      return;
    }
    catObj.description = newName;
    catObj.active = true;

    let uid = this.logonSvc.getLocationConfig().individualUID;
    catObj.maintUserId = uid;
    

    this.salesSvc.updateSalesCatName(uid, catObj).subscribe({
      next: (data: SalesCategorySaveResponse) => {
        this.saleCatList.forEach(cat => {
          if (cat.description === data.category.description) {
            cat.salesCategoryUID = data.category.salesCategoryUID;

          }
          //console.log('Sales Category Updated: ' + data.salesCategoryDescription);
        })
      },
      error: (err: any) => {
        console.error('Error updating Sales Category: ' + err);
      }
    });
  }
  addNewSalesCategory() {
    const newCat = new SalesCat();
    newCat.description = 'New Category';
    newCat.active = true;
    
    newCat.departmentUID = this.saleCatList[0].departmentUID
    newCat.active = true;
    newCat.salesCatTypeUID = this.saleCatList[0].salesCatTypeUID;
    newCat.salesCategoryUID = 0;

    this.salesSvc.updateSalesCatName(this.logonSvc.getLocationConfig().individualUID, newCat).subscribe({
      next: (data: SalesCategorySaveResponse) => {
        let saleCat = new SalesCat();
        saleCat.salesCategoryUID = data.category.salesCategoryUID;
        saleCat.description = data.category.description;
        saleCat.active = data.category.active;
        saleCat.departmentUID = data.category.departmentUID;
        saleCat.salesCatTypeUID = data.category.salesCatTypeUID;
        this.saleCatList.push(saleCat);

        let saleItem = new SaleItem();
        saleItem.salesCategoryID = data.item.salesCategoryUID;
        saleItem.salesItemDescription = data.item.description;
        saleItem.price = data.item.unitPrice;
        saleItem.salesItemID = data.item.salesItemUID;
        saleItem.departmentUID = data.category.departmentUID;
        saleItem.noOfTags = data.item.noOfTags || 0;
        saleItem.displayOrder = data.item.displayOrder;

        this.saleItemAddedInSC.emit(saleItem);
        //console.log('Sales Category Added: ' + data.salesCategoryDescription);
      },
      error: (err: any) => {
        console.error('Error adding Sales Category: ' + err);
      }
    });


  }
}
