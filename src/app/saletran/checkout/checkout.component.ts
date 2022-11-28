import { Component, OnInit } from '@angular/core';
import { TicketObjService } from '../ticket-obj.service'; 

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  constructor(private _tktObjSvc: TicketObjService) { }

  ngOnInit(): void {
  }

}
