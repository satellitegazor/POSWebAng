import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal }  from '@ng-bootstrap/ng-bootstrap'
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { LTC_Associates } from '../../models/location.associates';
import { SalesTranService } from '../../services/sales-tran.service';
import { removeTndrWithSaveCode, upsertAssocTips } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector, getTicketTotals, getAssocTipList } from '../../store/ticketstore/ticket.selector';

import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { UtilService } from 'src/app/services/util.service';

@Component({
    selector: 'app-tips-modal-dlg',
    templateUrl: './tips-modal-dlg.component.html',
    styleUrls: ['./tips-modal-dlg.component.css'],
    standalone: false
})
export class TipsModalDlgComponent implements OnInit {

  constructor(private modal: NgbModal, private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
    private _store: Store<saleTranDataInterface>, private router: Router,  private utilSvc: UtilService) { }

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
      //debugger;
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
            associate.tipAssociateId = assoc.individualLocationUID;
          }
        }) 
      

      this._store.select(getTicketTotals).subscribe(dt => {
        this.dcTotal = Number.parseFloat(((dt.grandTotalDC * 100) / 100).toFixed(2));
        this.ndcTotal = Number.parseFloat(((dt.grandTotalNDC * 100) / 100).toFixed(2));

        this.lineItemTotalDC = (Number.parseFloat((dt.grandTotalDC - dt.tipTotalDC).toFixed(2)) * 100) / 100;
        this.lineItemTotalNDC = (Number.parseFloat((dt.grandTotalNDC - dt.tipTotalNDC).toFixed(2)) * 100) / 100;
      })
    })
  }

  onTipChanged(event: any) {
    let tipAmt: number =0
    this.assocSaleTips.forEach(elem => {
      if(elem.indivLocId == Number(event.target.id.substr(2))) {
        elem.tipAmount = Number(event.target.value.replace(',', ''));
        tipAmt = elem.tipAmount;
      }
    })    
    this.dcTotal += tipAmt;
  }

  onTotalAmountChanged(value: number) {

    let totalTipAmt = Number(value);
    console.log('onTotalAmountChanged Total Tip Amt: ' + totalTipAmt);
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
        this.assocSaleTips[i].tipAmount = Number((indivTipAmt + (Math.round((diffAmt - cumulativeTipTotal) * 100) / 100)).toFixed(2));
      }
      else {
        this.assocSaleTips[i].tipAmount = indivTipAmt;
      }
    }
    this.lineItemTotalDC = totalTipAmt;
    this.lineItemTotalNDC = totalTipAmt * this._logonDataSvc.getExchangeRate();

    this.tipTotalDC = diffAmt;
    this.tipTotalNDC = diffAmt;
  }

  public Save() {

    //this._store.dispatch(removeTndrWithSaveCode({ tndrCode: "SV" }))

    let totalTipAmt = 0;
    
    this.assocSaleTips.forEach(function(obj: AssociateSaleTips, indx: number) {
      //console.log('in Save Tip: ' + obj.tipAmount);
      totalTipAmt += obj.tipAmount;
    })

    this.tipTotalDC = totalTipAmt;
    this.tipTotalNDC = totalTipAmt ;
    this.dcTotal += totalTipAmt;

    this.modal.dismissAll();
    
    this._store.dispatch(upsertAssocTips({ assocTipsList: this.assocSaleTips, totalTipAmtDC:this.tipTotalDC, totalTipAmtNDC: this.tipTotalNDC }));
    
    //console.log('in Save Tip TenderCode: ' + this.tndrCode);
    if(this.tndrCode != "") {
      this.router.navigate([this.utilSvc.tenderCodePageMap.get(this.tndrCode)], {queryParams: {code: this.tndrCode}})
    }

  }
  
  public Cancel() {
    this.modal.dismissAll('');
  }

  keyValidate(event: any) { 
    var t = event.target.value;
    var result = t.indexOf('.') >= 0 ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 2) : t;
    if(event.keyCode === 8) {
      return true;
    }
    else if (event.keyCode !== 190 && (event.keyCode < 48 || event.keyCode > 57))
      return false;
    else {
      if(result !== event.target.value)
        return false;
      else
        return true;
    }
  }


}
