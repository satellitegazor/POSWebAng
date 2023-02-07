import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalRef } from '@independer/ng-modal';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { LTC_Associates } from '../../models/location.associates';
import { SalesTranService } from '../../services/sales-tran.service';
import { upsertAssocTips } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-tips-modal-dlg',
  templateUrl: './tips-modal-dlg.component.html',
  styleUrls: ['./tips-modal-dlg.component.css']
})
export class TipsModalDlgComponent implements OnInit {

  constructor(private modal: ModalRef, private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
    private _store: Store<tktObjInterface>, private router: Router) { }

    public tndrCode: string = ''
    saleAssocList: LTC_Associates[] = [];
    assocSaleTips: AssociateSaleTips[] = [];

  dcTotal: number = 0;
  ndcTotal: number = 0;

  ngOnInit(): void {
    var locCnfg = this._logonDataSvc.getLocationConfig();
    this._saleTranSvc.getLocationAssociates(locCnfg.locationUID, locCnfg.individualUID).subscribe(data => {
      this._store.select(getCheckoutItemsSelector).subscribe(checkOutItems => {
        checkOutItems?.forEach(itm => {
          if(this.saleAssocList.filter(a => a.individualLocationUID == itm.srvdByAssociateVal).length == 0) {
            this.saleAssocList.push( data.associates.filter(k => k.individualLocationUID == itm.srvdByAssociateVal)[0]);
          }
        })
      })

      this.saleAssocList.forEach(element => {
        let a: AssociateSaleTips = new AssociateSaleTips();
        a.tipAssociateId = element.individualUID;
        a.tipAmount = 0;
        a.tipAmtLocCurr = 0;
        this.assocSaleTips.push(a);
      });
      
    })
  }

  onTipChanged(event: any) {
    this.dcTotal = 0;
    this.assocSaleTips.forEach(elem => {
      if(elem.tipAssociateId == Number(event.target.id.substr(2))) {
        elem.tipAmount = Number(event.target.value);
      }
      this.dcTotal += elem.tipAmount;
    })
  }

  public Save() {

    this.saleAssocList.forEach(assoc => {
      let asc = new AssociateSaleTips();
      asc.tipAssociateId = assoc.individualUID;
    })

    this.modal.close();
    this._store.dispatch(upsertAssocTips({ assocTipsList: this.assocSaleTips }));
    this.router.navigate(['tender'], {queryParams: {code: this.tndrCode}})

  }
  public Cancel() {
    this.modal.close('');
  }
}
