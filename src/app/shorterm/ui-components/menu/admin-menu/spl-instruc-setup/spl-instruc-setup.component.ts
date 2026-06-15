
  

import { Component } from '@angular/core';
import { PosApiService } from '../../../services/pos-api-service';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services/toast.service';
import { Dept, SaleItem } from '../../../models/sale.item';
import { LTCSpecialInstructions } from '../../../models/special.instructions.model';

@Component({
  selector: 'app-spl-instruc-setup',
  templateUrl: './spl-instruc-setup.component.html',
  styleUrls: ['./spl-instruc-setup.component.css'],
  standalone: false
})
export class SplInstrucSetupComponent {

  allItemButtonMenuList: SaleItem[] = [];
  public deptList: Dept[] = [];
  activeId: number = 0;
  locationId: number = 0;
  contractId: number = 0;
  splInstructionAry: LTCSpecialInstructions[] = [];

  constructor(private _saleTranSvc: PosApiService,
    private _logonDataSvc: LogonDataService,
    private _toastSvc: ToastService) {

    }

  ngOnInit(): void {
    const config = this._logonDataSvc.getLocationConfig();
    this.locationId = config.locationUID || 0;
    this.contractId = config.contractUID || 0;
    this.getAllSaleItems(this.locationId, this.contractId, 0, 0, 0, 0);
  }

  private getAllSaleItems(locationId: number, contractId: number, facilityid: number, businessFunctionId: number, salesCategoryId: number, departmentId: number): void {

    this._saleTranSvc.getSaleItemListFromDB(locationId, contractId, facilityid, businessFunctionId, salesCategoryId, departmentId, 0).subscribe(data => {

      this.allItemButtonMenuList = data.itemButtonMenuResults; //.filter(item => (item.salesItemDescription !== 'Enter Item Description Here' && item.saleItemActive) || (item.salesItemDescription == 'Enter Item Description Here' && !item.saleItemActive));
      this.getDeptList();
    });

  }

  public getDeptList(): void {  
    this.allItemButtonMenuList.forEach(item => {
      let dptCount = this.deptList.filter(d => d.departmentUID == item.departmentUID).length;
      if (dptCount == 0) {
        let dpt = new Dept();
        dpt.departmentUID = item.departmentUID;
        dpt.departmentName = item.departmentName;
        this.deptList.push(dpt);
      }
    });
    this.activeId = this.deptList.length > 0 ? this.deptList[0].departmentUID : 0;

    this._saleTranSvc.getLocationSpecialInstructions(String(this._logonDataSvc.getLocationConfig().individualUID), this.locationId, this.activeId)
      .subscribe(data => {
      // Handle the response data here
      this.splInstructionAry = data.specialInstructions.filter(instr => instr.active);
    });
  }

  public deptClick(event: Event, deptUID: number): void {
    this.activeId = deptUID;
    this._saleTranSvc.getLocationSpecialInstructions(String(this._logonDataSvc.getLocationConfig().individualUID), this.locationId, deptUID)
      .subscribe(data => {
        this.splInstructionAry = data.specialInstructions.filter(instr => instr.active);
      });
  }

  // Handler for Add button
  public onAddInstruction(): void {
    // Add a new special instruction row for the active department
    const newInstruction = new LTCSpecialInstructions();
    newInstruction.departmentUID = this.activeId;
    newInstruction.splInstructionUID = 0;
    newInstruction.description = '';
    newInstruction.active = true;
    newInstruction.displayOrder = this.splInstructionAry.length + 1;
    newInstruction.hasUpdates = true;
    newInstruction.locSplInstCount = 0;
    this.splInstructionAry.push(newInstruction);
  }

  // Handler for Save button
  public onSaveInstructions(): void {
    const uid = String(this._logonDataSvc.getLocationConfig().individualUID);
    const parm = {
      departmentUID: this.activeId,
      hasChanges: true,
      instructions: this.splInstructionAry
    };
    this._saleTranSvc.saveLocationSpecialInstructions(uid, parm).subscribe({
      next: (result) => {
        this.splInstructionAry = result.specialInstructions.filter(instr => instr.active);
        this._toastSvc.success('Special instructions saved successfully.');
      },
      error: () => {
        this._toastSvc.error('Failed to save special instructions.');
      }
    });
  }

  // Handler for Sales Transaction button
  public onSalesTransaction(): void {
    // Implement navigation or logic as needed
    this._toastSvc.info('Sales Transaction button clicked.');
  }

  // Handler for Delete button
  public onDeleteInstruction(instructionId: number): void {
    const instr = this.splInstructionAry.find(i => i.splInstructionUID === instructionId);
    if (instr) {
        const confirmed = window.confirm('Are you sure you want to delete this instruction?');
        if (confirmed) {

          this._saleTranSvc.inactivateSplInstruction(String(this._logonDataSvc.getLocationConfig().individualUID), this.activeId, instructionId).subscribe({
            next: () => {
              this.splInstructionAry = this.splInstructionAry.filter(i => i.splInstructionUID !== instructionId);
              this._toastSvc.success('Special instruction deleted successfully.');
            },
            error: () => {
              this._toastSvc.error('Failed to delete special instruction.');
            }
          });
        }
    }
  }
}
