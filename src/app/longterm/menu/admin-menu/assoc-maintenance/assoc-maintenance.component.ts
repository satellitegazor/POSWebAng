import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PosApiService } from '../../../services/pos-api-service';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { LTC_Associates, LTC_LocationAssociatesResultsModel } from '../../../models/location.associates';
import { UtilService } from '../../../../services/util.service';
import { GlobalConstants } from '../../../../global/global.constants';
import { ToastService } from '../../../../services/toast.service';



@Component({
  selector: 'app-assoc-maintenance',
  templateUrl: './assoc-maintenance.component.html',
  styleUrls: ['./assoc-maintenance.component.css'],
  standalone: false
})
export class AssocMaintenanceComponent implements OnInit {

  associatesResult: LTC_LocationAssociatesResultsModel | null = null;
  pinReqdForSalesTran: boolean = false;
  // Track original associates for change detection
  private originalAssociates: any[] = [];

  // Role type options for dropdown
  roleTypeOptions = [
    { value: 'RLTYP_CONC_MNGR', display: 'Concession Manager' },
    { value: 'RLTYP_CONC_ASSC', display: 'Concession Associate' }
  ];
  
  constructor(
    private posApiService: PosApiService,
    private logonDataService: LogonDataService,
    private router: Router,
    private toastService: ToastService
  ) {}
  // Navigate to salestran route
  onSalesTransaction(): void {
    this.router.navigate(['salestran']);
  }

  ngOnInit(): void {
    // Get locationId and individualUID from LogonDataService
    const locationId = this.logonDataService.getLocationId();
    const individualUID = this.logonDataService.getLocationConfig().individualUID;
    this.pinReqdForSalesTran = this.logonDataService.getLocationConfig().pinReqdForSalesTran ? true : false;
    // Call the service and assign the result
    this.posApiService.getLocationAssociates(locationId, individualUID).subscribe({
      next: (result) => {
        // Ensure code and description are set for dropdown compatibility
        if (result && result.associates) {
          result.associates.forEach(a => {
            a.maintUserId = this.logonDataService.getLocationConfig().individualUID.toString();
            // If code is present, set description from options
            if (a.code) {
              const found = this.roleTypeOptions.find(opt => opt.value === a.code);
              a.description = found ? found.display : a.code;
            }
            // If code is missing but description is present, try to set code from description
            if (!a.code && a.description) {
              const found = this.roleTypeOptions.find(opt => opt.display === a.description);
              if (found) a.code = found.value;
            }
          });
        }
        this.associatesResult = result;
        // Deep copy for change tracking
        this.originalAssociates = result.associates.map(a => ({ ...a }));
      },
      error: (err) => {
        // Handle error as needed
        this.associatesResult = null;
      }
    });
  }

  // Add a new associate row for user input
  onAddAssociate(): void {
    if (!this.associatesResult) return;
    const newAssociate: any = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      phoneNumber: '',
      pin: '',
      privActConfmComplete: false,
      description: '',
      code: 'RLTYP_CONC_ASSC',
      hasUpdates: true,
      individualUID: -1 * (this.associatesResult.associates.length + 1), // Temporary UID, real one should come from backend
      individualRoleTypeUID: 1,
      individualLocationUID: 0,
      maintTimestamp: new Date(),
      maintUserId: this.logonDataService.getLocationConfig().individualUID.toString(),
      individualActive: true,
      indCountryDialCode: '',
      dcTipAmount: 0,
      ndcTipAmount: 0,
      locationUID: this.logonDataService.getLocationId(),
      active: true
    };
    this.associatesResult.associates.push(newAssociate);
  }

  // Track changes and set hasUpdates flag
  onAssociateChange(index: number): void {
    if (!this.associatesResult) return;
    const assoc = this.associatesResult.associates[index];
    // If associate existed before, mark as updated if changed
    if (this.originalAssociates[index]) {
      const orig = this.originalAssociates[index];
      // Compare fields (add more if needed)
      if (
        assoc.firstName !== orig.firstName ||
        assoc.lastName !== orig.lastName ||
        assoc.emailAddress !== orig.emailAddress ||
        assoc.phoneNumber !== orig.phoneNumber ||
        assoc.privActConfmComplete !== orig.privActConfmComplete
      ) {
        assoc.hasUpdates = true;
      }
    }
  }

  // Save all associates
  onSaveAssociates(): void {
    if (!this.associatesResult) return;
    const locationUID = this.logonDataService.getLocationId();
    // Add locationUID to all associates
    const associatesToSave = this.associatesResult.associates.map(a => ({
      ...a,
      locationUID
    }));
    const request = {
      locationId: locationUID,
      associates: associatesToSave,
      UserId: this.logonDataService.getLocationConfig().individualUID.toString(),
      CliTimeVar: GlobalConstants.GetClientTimeVariance()
    };
    this.posApiService.saveLocationAssociates(this.logonDataService.getLocationConfig().individualUID.toString(), request).subscribe({
      next: (result) => {
        // Optionally refresh or show success
        this.associatesResult = result;
        this.originalAssociates = result.associates.map(a => ({ ...a }));
        this.toastService.success('Associates saved successfully');
      },
      error: (err) => {
        // Handle error
        this.toastService.error('Failed to save associates');
      }
    });
  }

  onResetPIN(assoc: LTC_Associates): void {
    if (!assoc || assoc.individualUID <= 0) return;

    const request = {
      locationId: this.logonDataService.getLocationId(),
      individualId: assoc.individualUID,
      credentials: '', // Add any necessary credentials if required by the API
      vendorNumber: this.logonDataService.getLocationConfig().vendorNumber
    };
    
    this.posApiService.resetAssociatePIN(this.logonDataService.getLocationConfig().individualUID.toString(), request).subscribe({
      next: (result) => {
        // Handle success, maybe show a message or update the UI
        this.toastService.success(`PIN reset successful for ${assoc.firstName} ${assoc.lastName}`);
      },
      error: (err) => {
        // Handle error
        this.toastService.error(`Failed to reset PIN for ${assoc.firstName} ${assoc.lastName}`);
      }
    });
  }

}
