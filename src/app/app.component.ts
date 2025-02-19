import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent {

  constructor(
    private route: Router) {

  }
  
  vlogout() {

    this.route.navigate(['/vlogon']);
  }
  Region: String = 'Europe';
  title = 'CPOSWeb';

  DisplayAlertMsg(msg: string) {

  }
}
