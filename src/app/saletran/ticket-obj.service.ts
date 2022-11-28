import { Injectable } from '@angular/core';
import { TicketSplit } from '../models/ticket.split'; 

@Injectable({
  providedIn: 'root'
})
export class TicketObjService {

  constructor() { 
    this.TktObj = new TicketSplit();
  }

  public TktObj: TicketSplit = {} as TicketSplit;

}
