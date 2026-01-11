import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { saleTranDataInterface } from '../../saletran/store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SaleItem } from '../../models/sale.item';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog';
import { CanComponentDeactivate } from 'src/app/shared/can-component-deactivate';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SaleItemButton } from '../../models/sale.item.button';

interface SaleItemForValidation {
  salesItemDescription: string;
  salesItemID: number;
  price: number;
  salesTax: number;
}

@Component({
  selector: 'app-item-button-sales-item-list',
  templateUrl: './item-button-sales-item-list.component.html',
  styleUrl: './item-button-sales-item-list.component.css',
  standalone: false
})
export class ItemButtonSalesItemListComponent implements OnInit, OnChanges, CanComponentDeactivate {

  @Output() itemAdded = new EventEmitter<SaleItem>();
  @Output() itemDeleted = new EventEmitter<SaleItem>();
  @Output() itemUpdated = new EventEmitter<SaleItem>();

  @Input() saleItemList: SaleItemButton[] = [];
  @Input() salesItemListRefreshEvent: Observable<boolean> = new Observable<boolean>();

  saleItemForm: FormGroup;
  activeId: number = 0;


  

  constructor(private _logonDataSvc: LogonDataService,
    private _store: Store<saleTranDataInterface>,
    private fb: FormBuilder,
    private modalService: NgbModal) {
    this.saleItemForm = this.fb.group({
      saleItemList: this.fb.array([])
    });
  }

  get saleItemListArray(): FormArray {
    return this.saleItemForm.get('saleItemList') as FormArray;
  }

  ngOnInit(): void {

    // this.loadSaleItems();

    // this.salesItemListRefreshEvent.subscribe(data => {
    //   //console.log('subscription called salesitmListRefresh: ' + data);
    //   if (data) {
    //     if (this.saleItemList.length == 0 || typeof this.saleItemList[0].id == 'undefined') {
    //         console.log('undefined sale item id');
    //         return;
    //     }
        
    //     this.loadSaleItems();
    //   }
    // });
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['saleItemList'] && !changes['saleItemList'].firstChange) {
      this.activeId = this.saleItemList[0].id;
      this.loadSaleItems();
    }
  }

  loadSaleItems(): void {
    const controls = this.saleItemList.map(item => this.fb.group({
      description: [item.description || '', [Validators.required, Validators.minLength(3)]],
      price: [item.price || 0, [Validators.required, Validators.min(0)]],  
      salesTax: [item.salesTax || 0],
      displayOrder: [item.displayOrder || 0],
      id: [item.id],
      departmentUID: [item.departmentUID],
      salesCategoryUID: [item.salesCategoryID]
    }));

    this.saleItemForm.setControl('saleItemList', this.fb.array(controls));

    if (this.saleItemList.length > 0) {
      this.activeId = this.saleItemList[0].id;
    }
  }

  // This method is called by the guard
  canDeactivate(): boolean | Promise<boolean> {

    if (this.saleItemForm.dirty) {
      // Form has unsaved changes
      const modalRef = this.modalService.open(ConfirmDialogComponent);
      modalRef.componentInstance.message = 'You have unsaved changes. Do you want to leave without saving?';
      return modalRef.result.then(() => true, () => false); 
      // User clicked "Yes" → allow navigation
      // User clicked "No" or dismissed → stay
    }
    // No changes → allow navigation
    return true;
  }


  // Add this public method
  getCurrentSalesItems(): SaleItemButton[] | null {
    if (this.saleItemForm.invalid) {
      this.saleItemForm.markAllAsTouched(); // Show validation errors
      return null; // Prevent save if invalid
    }

    // Map form value back to your model
    return this.saleItemListArray.controls.map((control: any) => ({
      id: control.get('id')?.value,
      description: control.get('description')?.value?.trim(),  // Changed from salesItemDescription
      price: control.get('price')?.value,
      salesTax: control.get('salesTax')?.value,
      displayOrder: control.get('displayOrder')?.value || 0,
      departmentUID: control.get('departmentUID')?.value,  // Add missing property
      salesCategoryID: control.get('salesCategoryUID')?.value  // Add missing property (note: form has salesCategoryUID, interface has salesCategoryID)
    })) as SaleItemButton[];
  }

  // Add this method — parent will call it on Save
  getChangedItems(): SaleItemButton[] {
    const changedItems: SaleItemButton[] = [];

    this.saleItemListArray.controls.forEach((control: any, index: number) => {
      if (control.dirty) {  // ← Only if user changed something
        let updatedItem: SaleItemButton = new SaleItemButton(new SaleItem());
        
          updatedItem.id = control.get('id')?.value;
          updatedItem.description = control.get('description')?.value.trim();
          updatedItem.price = control.get('price')?.value;
          updatedItem.salesTax = control.get('salesTax')?.value;
          updatedItem.displayOrder = control.get('displayOrder')?.value || index + 1;
          updatedItem.departmentUID = control.get('departmentUID')?.value;
          updatedItem.salesCategoryID = control.get('salesCategoryUID')?.value;
          changedItems.push(updatedItem);
      }
    });

    return changedItems;
  }
  deleteItem(index: number) {
    const control = this.saleItemListArray.at(index);
    const itemId = control.get('id')?.value;

    // Find the full item object
    const deletedItem = this.saleItemList.find(item => item.id === itemId);

    if (deletedItem) {
      let saleItemToDelete = new SaleItem();
      saleItemToDelete.salesItemID = deletedItem.id;
      saleItemToDelete.salesItemDescription = deletedItem.description;
      saleItemToDelete.price = deletedItem.price;
      saleItemToDelete.salesTax = deletedItem.salesTax;
      saleItemToDelete.departmentUID = deletedItem.departmentUID;
      saleItemToDelete.salesCategoryID = deletedItem.salesCategoryID;
      // Emit the full item object to parent
      this.itemDeleted.emit(saleItemToDelete);

      // Optional: also remove from local array for immediate UI update
      this.saleItemListArray.removeAt(index);
      this.saleItemList = this.saleItemList.filter(i => i.id !== itemId);
    }
  }
  moveItemDown(index: number) {
    let atIndexItem = this.saleItemListArray.at(index);
    let belowIndexItem = this.saleItemListArray.at(index + 1);

    if (atIndexItem && belowIndexItem) {
      const atIndexDisplayOrder = atIndexItem.get('displayOrder')?.value;
      const belowIndexDisplayOrder = belowIndexItem.get('displayOrder')?.value;
      atIndexItem.get('displayOrder')?.setValue(belowIndexDisplayOrder);
      belowIndexItem.get('displayOrder')?.setValue(atIndexDisplayOrder);

      this.saleItemListArray.setControl(index, belowIndexItem);
      this.saleItemListArray.setControl(index + 1, atIndexItem);
      atIndexItem.markAsDirty();
      belowIndexItem.markAsDirty();

      this.itemUpdated.emit();
    }
    
  }
  moveItemUp(index: number) {
    let atIndexItem = this.saleItemListArray.at(index);
    let aboveIndexItem = this.saleItemListArray.at(index - 1);

    if (atIndexItem && aboveIndexItem) {
      const atIndexDisplayOrder = atIndexItem.get('displayOrder')?.value;
      const aboveIndexDisplayOrder = aboveIndexItem.get('displayOrder')?.value;
      atIndexItem.get('displayOrder')?.setValue(aboveIndexDisplayOrder);
      aboveIndexItem.get('displayOrder')?.setValue(atIndexDisplayOrder);

      this.saleItemListArray.setControl(index, aboveIndexItem);
      this.saleItemListArray.setControl(index - 1, atIndexItem);
      atIndexItem.markAsDirty();
      aboveIndexItem.markAsDirty();
      this.itemUpdated.emit();
    }
  }
  setDefaultTax(_t14: SaleItemButton) {
    this.saleItemListArray.controls.forEach((control: any, index: number) => {
      if (index !== 0) { // Skip the first item
        control.get('salesTax')?.setValue(_t14);
        control.markAsDirty();
      }
    });
    this.itemUpdated.emit();
  }

}
