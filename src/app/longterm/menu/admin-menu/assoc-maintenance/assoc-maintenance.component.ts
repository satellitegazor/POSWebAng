import { Component, OnInit } from '@angular/core';
import { PosApiService } from '../../../services/pos-api-service';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { LTC_LocationAssociatesResultsModel } from '../../../models/location.associates';

@Component({
  selector: 'app-assoc-maintenance',
  templateUrl: './assoc-maintenance.component.html',
  styleUrls: ['./assoc-maintenance.component.css'],
  standalone: false
})
export class AssocMaintenanceComponent implements OnInit {

  associatesResult: LTC_LocationAssociatesResultsModel | null = null;
  pinReqdForSalesTran: boolean = false;
  
  constructor(
    private posApiService: PosApiService,
    private logonDataService: LogonDataService
  ) {}

  ngOnInit(): void {
    // Get locationId and individualUID from LogonDataService
    const locationId = this.logonDataService.getLocationId();
    const individualUID = this.logonDataService.getLocationConfig().individualUID;
    this.pinReqdForSalesTran = this.logonDataService.getLocationConfig().pinReqdForSalesTran ? true : false;
    // Call the service and assign the result
    this.posApiService.getLocationAssociates(locationId, individualUID).subscribe({
      next: (result) => {
        this.associatesResult = result;
      },
      error: (err) => {
        // Handle error as needed
        this.associatesResult = null;
      }
    });
  }

}
