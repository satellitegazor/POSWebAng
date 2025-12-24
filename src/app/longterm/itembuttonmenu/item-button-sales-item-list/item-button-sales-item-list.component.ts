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

  deleteItem(_t14: SaleItemButton) {
    throw new Error('Method not implemented.');
  }
  moveItemDown(_t15: number) {
    throw new Error('Method not implemented.');
  }
  moveItemUp(_t15: number) {
    throw new Error('Method not implemented.');
  }
  setDefaultTax(_t14: SaleItemButton) {
    throw new Error('Method not implemented.');
  }

  

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

    this.loadSaleItems();

    this.salesItemListRefreshEvent.subscribe(data => {
      //console.log('subscription called salesitmListRefresh: ' + data);
      if (data) {
        this.activeId = this.saleItemList[0].id;
      }
    });
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['saleItemList'] && !changes['saleItemList'].firstChange) {
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

}
