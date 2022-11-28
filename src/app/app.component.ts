import { Component } from '@angular/core';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  Region: String = 'Europe';
  title = 'CPOSWeb';

  DisplayAlertMsg(msg: string) {

  }
}
