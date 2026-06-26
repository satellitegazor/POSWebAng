import { Component } from '@angular/core';
import { SbmWebApiService } from '../services/sbm-web-api.service';
import { LogonModel } from '../models/logon.model';
import { SbmStorageService } from '../services/sbm-session-storage.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalStorageService } from '../../global/local-storage.service';

@Component({
  selector: 'app-sbm-login',
  templateUrl: './sbm-login.component.html',
  styleUrls: ['./sbm-login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SbmLoginComponent {

  constructor(
    private sbmApi: SbmWebApiService,
    private sbmSessionStorage: SbmStorageService,
    private router: Router,
    private _localStorageSvc: LocalStorageService, 
  ) {}



  loginId: string = '';
  password: string = '';

  onLogin() {
    
    let logonModelReq = new LogonModel();
    logonModelReq.tssId = this.loginId;
    logonModelReq.tssPW = this.password;

    this.sbmApi.sbmLogon(logonModelReq).subscribe({
      next: (result) => {
        if (result.isAuthorized) {
          // Logon successful
          console.log('Logon successful', result);
          this.sbmSessionStorage.saveLogonResults(result);
          this._localStorageSvc.setItemData('apptype', 'sbm')
          this.router.navigate(['/sbm/clist']);
        } else {
          // Logon failed
          console.log('Logon failed', result);
        }
      },
      error: (err) => {
        console.error('Logon error', err);
      }
    });
  }

}
