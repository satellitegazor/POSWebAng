
import { NgModule } from '@angular/core';
import { LogonModule } from './logon.module';
import { VendorLTComponent } from './vendorlt/vendorlt.component';
import { VendorSTComponent } from './vendorst/vendorst.component';
import { SbmComponent } from './sbm/sbm.component';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

export const routes: Routes = [
    { path: '', component: VendorLTComponent },
    { path: 'vlogon', component: VendorLTComponent },
    { path: 'rlogon', component: VendorSTComponent },
    { path: 'logon', component: SbmComponent },
];

/*export const routing: ModuleWithProviders = RouterModule.forChild(routes)*/

//const routes: Routes = [
//    { path: '', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'vlogon', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'rlogon', loadChildren: './logon/logon.module#LogonModule' },
//];

//@NgModule({
//    imports: [RouterModule.forRoot(routes)],
//    exports: [RouterModule]
//})

export const LogonRoutingModule: ModuleWithProviders<LogonModule> = RouterModule.forChild(routes);