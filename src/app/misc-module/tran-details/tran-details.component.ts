import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LTC_TransactionDetails } from 'src/app/longterm/models/ticket.list';
import { SalesTranService } from 'src/app/longterm/saletran/services/sales-tran.service';

@Component({
    selector: 'app-tran-details',
    templateUrl: './tran-details.component.html',
    styleUrls: ['./tran-details.component.css'],
    standalone: false
})
export class TranDetailsComponent implements OnInit {

  public custId: number = 0;
  public tranDtls: LTC_TransactionDetails[] = [];

  constructor(private activatedRoute: ActivatedRoute,
    private _router: Router,
    private _logonDataSvc: LogonDataService,
    private _saleTranSvc: SalesTranService) { 

    }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: { [x: string]: number; }) => {

      this.custId = params['custid'];

      this._logonDataSvc.getLocationId();

      let indivId = this._logonDataSvc.getLocationConfig().individualUID;

      this._saleTranSvc.getTransactionDetails(indivId.toString(), 0, '', '', '', this._logonDataSvc.getLocationConfig().contractUID,
        this._logonDataSvc.getLocationConfig().locationUID, 0, 0, '', this.custId).subscribe(retVal => {
          this.tranDtls = retVal.data;
        })  
    })
  }

  tranSelected(tranId: number) {
    this._router.navigateByUrl('/lrcpt?tranid=' + tranId);    
  }

}
