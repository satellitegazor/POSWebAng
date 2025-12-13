import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SalesCat } from '../../models/sale.item';
import { Observable } from 'rxjs';
import { SalesTranService } from '../../saletran/services/sales-tran.service';

@Component({
  selector: 'app-item-button-sales-cat-list',
  templateUrl: './item-button-sales-cat-list.component.html',
  styleUrl: './item-button-sales-cat-list.component.css',
  standalone: false
})
export class ItemButtonSalesCatListComponent {
  isHovered: any;

  constructor(private salesSvc: SalesTranService) {
    this.activeId = 0;
  }
  @Input() saleCatList: SalesCat[] = [];
  @Input('') salesCatListRefreshEvent: Observable<boolean> = new Observable<boolean>();
  @Output() saleCatClicked: EventEmitter<number> = new EventEmitter();
  activeId: number = 0

  ngOnInit(): void {
    if (this.saleCatList.length > 0) {
      this.activeId = this.saleCatList[0].salesCategoryID;
    }

    this.salesCatListRefreshEvent.subscribe(data => {
      //console.log('subscription called salesCatListRefresh: ' + data);
      if (data) {
        this.activeId = this.saleCatList[0].salesCategoryID;
      }
    });
  }

  public salesCatgClick(event: Event, catgId: number): void {
    this.activeId = catgId;
    this.saleCatClicked.emit(catgId);
  }

  public updateSalesCatName(newName: string, catObj: SalesCat) {
    if (this.saleCatList.filter(cat => cat.salesCategoryDescription === newName).length > 0) {
      //console.log('Sales Category Name already exists: ' + $event);
      return;
    }
    catObj.salesCategoryDescription = newName;
    catObj.salesCatActive = true;
    this.salesSvc.updateSalesCatName(catObj).subscribe({
      next: (data: SalesCat) => {
        this.saleCatList.forEach(cat => {
          if (cat.salesCategoryDescription === data.salesCategoryDescription) {
            cat.salesCategoryID = data.salesCategoryID;
          }
          //console.log('Sales Category Updated: ' + data.salesCategoryDescription);
        })
      },
       error: (err: any) => {
        console.error('Error updating Sales Category: ' + err);
      }
    });
  }

}
