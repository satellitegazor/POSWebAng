import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { LTC_Associates } from '../../models/location.associates';
import { SalesTranService } from '../../services/sales-tran.service';
import { upsertAssocTips } from '../../store/ticketstore/ticket.action';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-tips-modal-dlg',
  templateUrl: './tips-modal-dlg.component.html',
  styleUrls: ['./tips-modal-dlg.component.css']
})
export class TipsModalDlgComponent implements OnInit {

  constructor(private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
    private _store: Store<tktObjInterface>, private router: Router) { }

    public tndrCode: string = ''
    saleAssocList: LTC_Associates[] = [];
    assocSaleTips: AssociateSaleTips[] = [];

  dcTotal: number = 0;
  ndcTotal: number = 0;

  ngOnInit(): void {
    var locCnfg = this._logonDataSvc.getLocationConfig();
    this._saleTranSvc.getLocationAssociates(locCnfg.locationUID, locCnfg.individualUID).subscribe(data => {
      this.saleAssocList = data.associates; 
      
      data.associates.forEach(element => {
        let a: AssociateSaleTips = new AssociateSaleTips();
        a.tipAssociateId = element.individualUID;
        a.tipAmount = 0;
        a.tipAmtLocCurr = 0;
        this.assocSaleTips.push(a);
      });
      
    })
  }

  onTipChanged() {
    this.assocSaleTips.forEach(elem => {
      this.dcTotal += elem.tipAmount;
    })
  }

  public Save() {

    this.saleAssocList.forEach(assoc => {
      let asc = new AssociateSaleTips();
      asc.tipAssociateId = assoc.individualUID;
    })

    this._store.dispatch(upsertAssocTips({ assocTipsList: this.assocSaleTips }));
    this.router.navigate(['tender'], {queryParams: {code: this.tndrCode}})

  }
  public Cancel() { }
}
