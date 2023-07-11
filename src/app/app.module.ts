import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LogonModule } from './logon/logon.module';
import { ModuleRouting } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { SalesTranModule } from './saletran/saletran.module';
import { SharedSubjectModule } from './shared-subject/shared-subject.module';
import { ModalModule } from '@independer/ng-modal';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { LoginAuthEffects } from './authstate/auth.effects';
import { GetAuthLoginReducer } from './authstate/auth.reducer';
import { LOGIN_AUTH_STATE } from './authstate/auth.selector';
import { LogonDataService } from './global/logon-data-service.service';
import { LogonSvc } from './logon/logonsvc.service';
import { CurrencyInputDirective } from './directives/currency-input.directive';
import { SummaryComponent } from './reports/salestran/summary/summary.component';
import { DetailComponent } from './reports/salestran/detail/detail.component';
import { SalestranComponent } from './reports/salestran/salestran/salestran.component';
 
@NgModule({
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CurrencyInputDirective,
    SummaryComponent,
    DetailComponent,
    SalestranComponent
  ],
  imports: [
    BrowserModule,
    ModuleRouting,
    FormsModule,
    LogonModule,
    SalesTranModule,
    SharedSubjectModule,  
    ModalModule,
    HttpClientModule,
    EffectsModule.forRoot([]),
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true
    }),
  ],
  providers: [{provide: LogonDataService}, {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }],
  bootstrap: [AppComponent]
})
export class AppModule { }
