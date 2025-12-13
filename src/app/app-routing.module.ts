import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AppModule } from './app.module';
 
const appRoutes: Routes = [
    { path: 'vlogon', loadChildren: () => import('./logon/logon.module').then(mod => mod.LogonModule)  },
    { path: 'rlogon', loadChildren: () => import('./logon/logon.module').then(mod => mod.LogonModule) },
    { path: 'salestran', loadChildren: () => import('./longterm/saletran/saletran.module').then(mod => mod.SalesTranModule) },
    { path: 'misc', loadChildren: () => import('./misc-module/misc.module').then(mod => mod.MiscModule) },
    { path: 'lrcpt', loadChildren: () => import('./rcpt/rcpt.module').then(mod => mod.RcptModule) },
    { path: 'itembtnmenu', loadChildren: () => import('./longterm/saletran/saletran.module').then(mod => mod.SalesTranModule) },
    
];

export const ModuleRouting: ModuleWithProviders<AppModule> = RouterModule.forRoot(appRoutes);
