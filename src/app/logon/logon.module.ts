import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogonRoutingModule } from './logon.routing';
import { VendorLTComponent } from './vendorlt/vendorlt.component';
import { VendorSTComponent } from './vendorst/vendorst.component';
import { SbmComponent } from './sbm/sbm.component';
import { authinterceptorProviders } from '../auth/auth.interceptor';
import { SharedSubjectModule } from '../shared-subject/shared-subject.module';
import { EffectsModule } from '@ngrx/effects';
import { LoginAuthEffects } from '../authstate/auth.effects';
import { StoreModule } from '@ngrx/store';
import { LOGIN_AUTH_STATE } from '../authstate/auth.selector';
import { GetAuthLoginReducer } from '../authstate/auth.reducer';
 
@NgModule({
    declarations: [VendorLTComponent, VendorSTComponent, SbmComponent],
  imports: [
    CommonModule,
      FormsModule,
      LogonRoutingModule,
    SharedSubjectModule,
    EffectsModule.forFeature([LoginAuthEffects]),
    StoreModule.forFeature(LOGIN_AUTH_STATE, GetAuthLoginReducer)

  ],
  providers: [authinterceptorProviders],
    //exports: [VendorLTComponent, VendorSTComponent, SbmComponent]
})
export class LogonModule { }
