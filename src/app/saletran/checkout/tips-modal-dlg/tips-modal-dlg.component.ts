import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalRef } from '@independer/ng-modal';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { LTC_Associates } from '../../models/location.associates';
import { SalesTranService } from '../../services/sales-tran.service';
import { upsertAssocTips } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector, getTicketTotals, getAssocTipList } from '../../store/ticketstore/ticket.selector';

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

    lineItemTotalDC: number = 0;
    lineItemTotalNDC: number = 0;

    tipTotalDC: number = 0;
    tipTotalNDC: number = 0;
 
  dcTotal: number = 0;
  ndcTotal: number = 0;

  ngOnInit(): void {
    var locCnfg = this._logonDataSvc.getLocationConfig();

    this._store.select(getAssocTipList).subscribe(tl => {
      if(tl.length > 0) {
        this.assocSaleTips = JSON.parse(JSON.stringify(tl));
      }
    });

    this._saleTranSvc.getLocationAssociates(locCnfg.locationUID, locCnfg.individualUID).subscribe(data => {
      

        data.associates.forEach(assoc => {         

          if(this.assocSaleTips.filter(a => a.indivLocId == assoc.individualLocationUID).length > 0) {
            let associate: AssociateSaleTips = this.assocSaleTips.filter(a => a.indivLocId == assoc.individualLocationUID)[0];
            associate.firstName = assoc.firstName;
            associate.lastName = assoc.lastName;
            associate.tipAssociateId = assoc.individualUID;
          }
        }) 
      

      this._store.select(getTicketTotals).subscribe(dt => {
        this.dcTotal = dt.grandTotalDC;
        this.ndcTotal = dt.grandTotalNDC;
        this.lineItemTotalDC = Number.parseFloat((dt.grandTotalDC - dt.tipTotalDC).toFixed(2));
        this.lineItemTotalNDC = Number.parseFloat((dt.grandTotalNDC - dt.tipTotalNDC).toFixed(2));        
      })
    })
  }

  onTipChanged(event: any) {
    
    this.assocSaleTips.forEach(elem => {
      if(elem.tipAssociateId == Number(event.target.id.substr(2))) {
        elem.tipAmount = Number(event.target.value);
      }
      this.dcTotal += elem.tipAmount;
    })
  }

  onTotalAmountChanged(event: any) {

  

    let totalTipAmt = Number(event.target.value);
    if(totalTipAmt < this.lineItemTotalDC) {
      return;
    }


    let diffAmt = totalTipAmt - this.lineItemTotalDC;
    let indivTipAmt = Math.round(((diffAmt / this.assocSaleTips.length) + Number.EPSILON) * 100) / 100;;
    let indx = 0;

    let cumulativeTipTotal = 0;
    for(let i = 0; i < this.assocSaleTips.length; i++) {
      
      cumulativeTipTotal += indivTipAmt;
      
      if(i == this.assocSaleTips.length -1) {
        this.assocSaleTips[i].tipAmount = (indivTipAmt + (Math.round((diffAmt - cumulativeTipTotal) * 100) / 100));
      }
      else {
        this.assocSaleTips[i].tipAmount = indivTipAmt;
      }
    }
    this.lineItemTotalDC = totalTipAmt;
    this.lineItemTotalNDC = totalTipAmt;

    this.tipTotalDC = diffAmt;
    this.tipTotalNDC = diffAmt;
  }

  public Save() {

    let totalTipAmt = 0;
    
    this.assocSaleTips.forEach(function(obj: AssociateSaleTips, indx: number) {
      totalTipAmt += obj.tipAmount;
      
    })
    this.tipTotalDC = totalTipAmt;
    this.tipTotalNDC = totalTipAmt;
    
    this.modal.close();
    this._store.dispatch(upsertAssocTips({ assocTipsList: this.assocSaleTips, totalTipAmtDC:this.tipTotalDC, totalTipAmtNDC: this.tipTotalNDC }));
    
    if(this.tndrCode != "") {
      this.router.navigate(['tender'], {queryParams: {code: this.tndrCode}})
    }

  }
  public Cancel() {
    this.modal.close('');
  }
}
