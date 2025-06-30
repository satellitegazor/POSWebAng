import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TicketTender } from 'src/app/models/ticket.tender';
import { getBalanceDue, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { SalesTranService } from '../../services/sales-tran.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { TenderType, TenderTypeModel } from '../../models/tender.type';

@Component({
    selector: 'app-split-pay',
    templateUrl: './split-pay.component.html',
    styleUrls: ['./split-pay.component.css'],
    standalone: false
})
export class SplitPayComponent implements OnInit {
  _tenderTypesModel: TenderTypeModel = {} as TenderTypeModel;
  _displayTenders: TenderType[] = [];
  tenderButtonWidthPercent: number = 0;

  constructor(private _saleTranSvc: SalesTranService, 
      private _logonDataSvc: LogonDataService,
      private _sharedSubSvc: SharedSubjectService, 
      private modalService: NgbModal, 
      private _store: Store<saleTranDataInterface>,
      private router: Router) { }

  tndrs: TicketTender[] = [];
  balDue: number = 0;


  ngOnInit(): void {

    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();

    this.tenderButtonUIDisplay();

    this._store.select(getTktObjSelector).subscribe(data => {

      if(data) {
        this.tndrs = data?.ticketTenderList;
      }
      
    })

    this._store.select(getBalanceDue).subscribe(data => {
      if(data) {
          this.balDue = data;
      }
    })

  }

  public tenderButtonUIDisplay(): void {

    this._displayTenders = this._tenderTypesModel.types?.filter((tndr) => tndr.isRefundType == false);
    this.tenderButtonWidthPercent = 99 / (this._displayTenders?.length); // +1 for split pay button
  }


}
