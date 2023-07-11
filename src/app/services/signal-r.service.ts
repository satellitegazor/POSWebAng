import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  constructor() { 

  }
  private hubConnection: signalR.HubConnection = {} as signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl("/signalrnotify").build();
    this.hubConnection.start()
                      .then(() => console.log('Connection Started'))
                      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public dataListener = () => {
    this.hubConnection.on("SalesTranReport", (data) => {
      
    })
  }




}
